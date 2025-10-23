package utils

import (
	"strings"
	"testing"
)

func TestHashPassword(t *testing.T) {
	password := "Test@123456"

	// 测试加密
	hashed, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}
	t.Logf("\n加密后的密码为：%s", hashed)

	// 验证加密后的密码长度（96字符）
	if len(hashed) != 96 {
		t.Errorf("HashPassword() returned hash with wrong length: got %d, want 96", len(hashed))
	}

	// 验证加密后的密码与原密码不同
	if hashed == password {
		t.Error("HashPassword() returned same as input password")
	}

	// 测试加密的一致性（同一密码多次加密结果应不同，因为盐值不同）
	hashed2, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() second call error = %v", err)
	}

	if hashed == hashed2 {
		t.Error("HashPassword() should generate different hashes for same password (different salt)")
	}

	// 验证两次加密的密码都能通过验证
	if !CheckPassword(hashed, password) {
		t.Error("CheckPassword() failed for first hash")
	}
	if !CheckPassword(hashed2, password) {
		t.Error("CheckPassword() failed for second hash")
	}
}

func TestCheckPassword(t *testing.T) {
	password := "Test@123456"
	wrongPassword := "Wrong@123456"

	// 先加密密码
	hashed, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword() error = %v", err)
	}

	tests := []struct {
		name           string
		hashedPassword string
		password       string
		want           bool
	}{
		{"正确密码", hashed, password, true},
		{"错误密码", hashed, wrongPassword, false},
		{"空密码", hashed, "", false},
		{"无效哈希格式", "invalid-hash", password, false},
		{"短哈希", "abc", password, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := CheckPassword(tt.hashedPassword, tt.password); got != tt.want {
				t.Errorf("CheckPassword() = %v, want %v", got, tt.want)
			}
		})
	}
}

// TestSM3Hash 测试SM3哈希算法
func TestSM3Hash(t *testing.T) {
	password1 := "Test@123456"
	password2 := "Test@123456"
	password3 := "Different@123"

	// 同一密码多次加密，应该不同（因为盐值不同）
	hash1, _ := HashPassword(password1)
	hash2, _ := HashPassword(password2)

	if hash1 == hash2 {
		t.Error("Same password should generate different hashes due to different salts")
	}

	// 但是都应该能通过验证
	if !CheckPassword(hash1, password1) || !CheckPassword(hash2, password2) {
		t.Error("Password verification failed")
	}

	// 不同密码应该无法通过验证
	if CheckPassword(hash1, password3) {
		t.Error("Different password should not pass verification")
	}
}

// TestEncryptDecryptData 测试SM4数据加解密
func TestEncryptDecryptData(t *testing.T) {
	// 生成SM4密钥
	key, err := GenerateSM4Key()
	if err != nil {
		t.Fatalf("GenerateSM4Key() error = %v", err)
	}

	if len(key) != SM4KeySize {
		t.Errorf("GenerateSM4Key() returned key with wrong size: got %d, want %d", len(key), SM4KeySize)
	}

	plaintext := "This is sensitive data 敏感数据"

	// 测试加密
	ciphertext, err := EncryptData(plaintext, key)
	if err != nil {
		t.Fatalf("EncryptData() error = %v", err)
	}

	if ciphertext == "" {
		t.Error("EncryptData() returned empty string")
	}

	if ciphertext == plaintext {
		t.Error("EncryptData() returned same as plaintext")
	}

	// 测试解密
	decrypted, err := DecryptData(ciphertext, key)
	if err != nil {
		t.Fatalf("DecryptData() error = %v", err)
	}

	if decrypted != plaintext {
		t.Errorf("DecryptData() = %v, want %v", decrypted, plaintext)
	}
}

// TestEncryptDataInvalidKey 测试无效密钥
func TestEncryptDataInvalidKey(t *testing.T) {
	invalidKey := []byte("short")
	plaintext := "test data"

	_, err := EncryptData(plaintext, invalidKey)
	if err == nil {
		t.Error("EncryptData() should return error for invalid key size")
	}

	if err != nil && !strings.Contains(err.Error(), "invalid key size") {
		t.Errorf("EncryptData() error = %v, want 'invalid key size' error", err)
	}
}

// TestHashPasswordEmpty 测试空密码
func TestHashPasswordEmpty(t *testing.T) {
	_, err := HashPassword("")
	if err == nil {
		t.Error("HashPassword() should return error for empty password")
	}
}

// 基准测试
func BenchmarkHashPassword(b *testing.B) {
	password := "Test@123456"
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		HashPassword(password)
	}
}

func BenchmarkCheckPassword(b *testing.B) {
	password := "Test@123456"
	hashed, _ := HashPassword(password)
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		CheckPassword(hashed, password)
	}
}

func BenchmarkEncryptData(b *testing.B) {
	key, _ := GenerateSM4Key()
	plaintext := "This is test data for benchmark"
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		EncryptData(plaintext, key)
	}
}

func BenchmarkDecryptData(b *testing.B) {
	key, _ := GenerateSM4Key()
	plaintext := "This is test data for benchmark"
	ciphertext, _ := EncryptData(plaintext, key)
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		DecryptData(ciphertext, key)
	}
}
