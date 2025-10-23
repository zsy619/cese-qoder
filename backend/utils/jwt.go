package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/zsy619/cese-qoder/backend/config"
)

// JWT 配置
var (
	// JWTSecret JWT 密钥（从配置文件读取）
	JWTSecret []byte
	// JWTExpireDuration Token 过期时间
	JWTExpireDuration time.Duration
)

// InitJWT 初始化 JWT 配置
func InitJWT(cfg *config.JWTConfig) {
	JWTSecret = []byte(cfg.Secret)
	JWTExpireDuration = time.Hour * time.Duration(cfg.ExpireHour)
}

// getJWTConfig 获取 JWT 配置（如果未初始化则使用默认值）
func getJWTConfig() ([]byte, time.Duration) {
	if len(JWTSecret) == 0 {
		// 使用默认配置
		cfg := config.GetConfig()
		return []byte(cfg.JWT.Secret), time.Hour * time.Duration(cfg.JWT.ExpireHour)
	}
	return JWTSecret, JWTExpireDuration
}

// Claims JWT 声明结构体
type Claims struct {
	Mobile string `json:"mobile"` // 用户手机号码
	jwt.RegisteredClaims
}

// GenerateToken 生成 JWT Token
func GenerateToken(phone string) (string, error) {
	secret, expireDuration := getJWTConfig()

	claims := &Claims{
		Mobile: phone,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expireDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "cese-qoder",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// ParseToken 解析 JWT Token
func ParseToken(tokenString string) (*Claims, error) {
	secret, _ := getJWTConfig()

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// RefreshToken 刷新 Token
func RefreshToken(tokenString string) (string, error) {
	claims, err := ParseToken(tokenString)
	if err != nil {
		return "", err
	}

	// 如果 Token 在30分钟内过期，允许刷新
	if time.Until(claims.ExpiresAt.Time) > time.Minute*30 {
		return "", errors.New("token is not close to expiration")
	}

	// 生成新 Token
	return GenerateToken(claims.Mobile)
}
