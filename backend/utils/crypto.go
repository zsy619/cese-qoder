package utils

import (
	"crypto/rand"
	"encoding/hex"
	"errors"

	"github.com/tjfoc/gmsm/sm3"
	"github.com/tjfoc/gmsm/sm4"
)

const (
	// SaltSize 盐值长度（16字节）
	SaltSize = 16
	// SM4KeySize SM4密钥长度（16字节）
	SM4KeySize = 16
)

// HashPassword 使用国密SM3算法加密密码
// 采用 SM3(password + salt) 方式，增加安全性
func HashPassword(password string) (string, error) {
	if password == "" {
		return "", errors.New("password cannot be empty")
	}

	// 生成随机盐值
	salt := make([]byte, SaltSize)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	// 使用SM3计算哈希：SM3(password + salt)
	hash := sm3.New()
	hash.Write([]byte(password))
	hash.Write(salt)
	hashedPassword := hash.Sum(nil)

	// 格式：hex(salt) + hex(hash)
	// 存储格式：16字节盐值（hex编码后32字符） + 32字节哈希（hex编码后64字符）= 96字符
	result := hex.EncodeToString(salt) + hex.EncodeToString(hashedPassword)

	return result, nil
}

// CheckPassword 验证密码是否正确
func CheckPassword(hashedPassword, password string) bool {
	if len(hashedPassword) != 96 { // 32 (salt hex) + 64 (hash hex)
		return false
	}

	// 提取盐值和哈希值
	saltHex := hashedPassword[:32]
	hashHex := hashedPassword[32:]

	// 解码盐值
	salt, err := hex.DecodeString(saltHex)
	if err != nil {
		return false
	}

	// 使用相同的盐值计算新密码的哈希
	hash := sm3.New()
	hash.Write([]byte(password))
	hash.Write(salt)
	newHash := hash.Sum(nil)
	newHashHex := hex.EncodeToString(newHash)

	// 比较哈希值
	return newHashHex == hashHex
}

// EncryptData 使用SM4加密数据（用于敏感数据加密）
func EncryptData(plaintext string, key []byte) (string, error) {
	if len(key) != SM4KeySize {
		return "", errors.New("invalid key size, must be 16 bytes")
	}

	// SM4 ECB模式加密
	ciphertext, err := sm4.Sm4Ecb(key, []byte(plaintext), true)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(ciphertext), nil
}

// DecryptData 使用SM4解密数据
func DecryptData(ciphertext string, key []byte) (string, error) {
	if len(key) != SM4KeySize {
		return "", errors.New("invalid key size, must be 16 bytes")
	}

	// 解码十六进制字符串
	encryptedData, err := hex.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	// SM4 ECB模式解密
	plaintext, err := sm4.Sm4Ecb(key, encryptedData, false)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// GenerateSM4Key 生成SM4密钥（16字节）
func GenerateSM4Key() ([]byte, error) {
	key := make([]byte, SM4KeySize)
	if _, err := rand.Read(key); err != nil {
		return nil, err
	}
	return key, nil
}
