package utils

import (
	"testing"
)

func TestValidatePhone(t *testing.T) {
	tests := []struct {
		name  string
		phone string
		want  bool
	}{
		{"有效手机号-13x", "13800138000", true},
		{"有效手机号-15x", "15912345678", true},
		{"有效手机号-18x", "18612345678", true},
		{"有效手机号-19x", "19812345678", true},
		{"无效-长度不足", "1380013800", false},
		{"无效-长度过长", "138001380000", false},
		{"无效-不是1开头", "23800138000", false},
		{"无效-第二位不是3-9", "12800138000", false},
		{"无效-包含字母", "1380013800a", false},
		{"无效-空字符串", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ValidatePhone(tt.phone); got != tt.want {
				t.Errorf("ValidatePhone(%s) = %v, want %v", tt.phone, got, tt.want)
			}
		})
	}
}

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		want     bool
	}{
		{"有效密码", "Test@123456", true},
		{"有效密码-特殊字符!", "Aa1!bcdefg", true},
		{"有效密码-特殊字符#", "Aa1#bcdefg", true},
		{"无效-长度不足", "Test@12", false},
		{"无效-长度过长", "Test@123456789012", false},
		{"无效-缺少大写", "test@123456", false},
		{"无效-缺少小写", "TEST@123456", false},
		{"无效-缺少数字", "Test@abcdef", false},
		{"无效-缺少特殊字符", "Test12345678", false},
		{"无效-空字符串", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ValidatePassword(tt.password); got != tt.want {
				t.Errorf("ValidatePassword(%s) = %v, want %v", tt.password, got, tt.want)
			}
		})
	}
}

func TestValidateRequired(t *testing.T) {
	tests := []struct {
		name  string
		field string
		want  bool
	}{
		{"非空字符串", "test", true},
		{"空格字符串", " ", true},
		{"空字符串", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ValidateRequired(tt.field); got != tt.want {
				t.Errorf("ValidateRequired(%s) = %v, want %v", tt.field, got, tt.want)
			}
		})
	}
}

// 基准测试
func BenchmarkValidatePhone(b *testing.B) {
	phone := "13800138000"
	for i := 0; i < b.N; i++ {
		ValidatePhone(phone)
	}
}

func BenchmarkValidatePassword(b *testing.B) {
	password := "Test@123456"
	for i := 0; i < b.N; i++ {
		ValidatePassword(password)
	}
}
