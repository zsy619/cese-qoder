package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT 配置
var (
	// JWTSecret JWT 密钥（生产环境应从配置文件读取）
	JWTSecret = []byte("cese-qoder-secret-key-change-in-production")
	// JWTExpireDuration Token 过期时间（24小时）
	JWTExpireDuration = time.Hour * 24
)

// Claims JWT 声明结构体
type Claims struct {
	UserID string `json:"user_id"` // 用户ID（手机号码）
	jwt.RegisteredClaims
}

// GenerateToken 生成 JWT Token
func GenerateToken(phone string) (string, error) {
	claims := &Claims{
		UserID: phone,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(JWTExpireDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "cese-qoder",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(JWTSecret)
}

// ParseToken 解析 JWT Token
func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return JWTSecret, nil
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
	return GenerateToken(claims.UserID)
}
