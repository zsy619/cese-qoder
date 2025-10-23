package tests

import (
	"testing"

	"github.com/zsy619/cese-qoder/backend/services"
	"github.com/zsy619/cese-qoder/backend/utils"
)

// BenchmarkUserRegister 用户注册性能测试
func BenchmarkUserRegister(b *testing.B) {
	userService := &services.UserService{}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		req := &services.RegisterRequest{
			Mobile:   "13900139000",
			Password: "Test@123456",
		}
		userService.Register(req)
	}
}

// BenchmarkUserLogin 用户登录性能测试
func BenchmarkUserLogin(b *testing.B) {
	userService := &services.UserService{}

	// 预先注册用户
	req := &services.RegisterRequest{
		Mobile:   "13900139001",
		Password: "Test@123456",
	}
	userService.Register(req)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		loginReq := &services.LoginRequest{
			Mobile:   "13900139001",
			Password: "Test@123456",
		}
		userService.Login(loginReq)
	}
}

// BenchmarkPasswordHash 密码加密性能测试
func BenchmarkPasswordHash(b *testing.B) {
	password := "Test@123456"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		utils.HashPassword(password)
	}
}

// BenchmarkPasswordCheck 密码验证性能测试
func BenchmarkPasswordCheck(b *testing.B) {
	password := "Test@123456"
	hashed, _ := utils.HashPassword(password)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		utils.CheckPassword(hashed, password)
	}
}

// BenchmarkJWTGenerate JWT生成性能测试
func BenchmarkJWTGenerate(b *testing.B) {
	phone := "13900139000"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		utils.GenerateToken(phone)
	}
}

// BenchmarkJWTParse JWT解析性能测试
func BenchmarkJWTParse(b *testing.B) {
	phone := "13900139000"
	token, _ := utils.GenerateToken(phone)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		utils.ParseToken(token)
	}
}

// BenchmarkPhoneValidation 手机号验证性能测试
func BenchmarkPhoneValidation(b *testing.B) {
	phone := "13900139000"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		utils.ValidatePhone(phone)
	}
}

// BenchmarkPasswordValidation 密码强度验证性能测试
func BenchmarkPasswordValidation(b *testing.B) {
	password := "Test@123456"

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		utils.ValidatePassword(password)
	}
}
