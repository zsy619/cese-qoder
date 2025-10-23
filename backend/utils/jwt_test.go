package utils

import (
	"testing"
	"time"

	"github.com/zsy619/cese-qoder/backend/config"
)

// init 初始化测试环境
func init() {
	// 使用默认配置初始化 JWT
	cfg := config.GetDefaultConfig()
	InitJWT(&cfg.JWT)
}

func TestGenerateToken(t *testing.T) {
	phone := "13800138000"

	token, err := GenerateToken(phone)
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}

	if token == "" {
		t.Error("GenerateToken() returned empty token")
	}

	// 验证token可以被正确解析
	claims, err := ParseToken(token)
	if err != nil {
		t.Errorf("ParseToken() failed for generated token: %v", err)
	}
	if claims.Mobile != phone {
		t.Errorf("ParseToken() Mobile = %v, want %v", claims.Mobile, phone)
	}
}

func TestParseToken(t *testing.T) {
	phone := "13800138000"

	// 生成有效token
	validToken, err := GenerateToken(phone)
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}

	tests := []struct {
		name    string
		token   string
		wantErr bool
	}{
		{"有效Token", validToken, false},
		{"无效Token", "invalid.token.string", true},
		{"空Token", "", true},
		{"错误格式Token", "not-a-jwt-token", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := ParseToken(tt.token)
			if (err != nil) != tt.wantErr {
				t.Errorf("ParseToken() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !tt.wantErr {
				if claims == nil {
					t.Error("ParseToken() returned nil claims for valid token")
				}
				if claims.Mobile != phone {
					t.Errorf("ParseToken() Mobile = %v, want %v", claims.Mobile, phone)
				}
			}
		})
	}
}

func TestTokenExpiration(t *testing.T) {
	phone := "13800138000"

	// 临时修改过期时间为1秒
	originalExpire := JWTExpireDuration
	JWTExpireDuration = time.Second * 1
	defer func() { JWTExpireDuration = originalExpire }()

	token, err := GenerateToken(phone)
	if err != nil {
		t.Fatalf("GenerateToken() error = %v", err)
	}

	// 立即解析应该成功
	_, err = ParseToken(token)
	if err != nil {
		t.Errorf("ParseToken() immediate parse error = %v", err)
	}

	// 等待2秒后token应该过期
	time.Sleep(2 * time.Second)
	_, err = ParseToken(token)
	if err == nil {
		t.Error("ParseToken() should fail for expired token")
	}
}

// 基准测试
func BenchmarkGenerateToken(b *testing.B) {
	phone := "13800138000"
	for i := 0; i < b.N; i++ {
		GenerateToken(phone)
	}
}

func BenchmarkParseToken(b *testing.B) {
	phone := "13800138000"
	token, _ := GenerateToken(phone)
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		ParseToken(token)
	}
}
