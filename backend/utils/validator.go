package utils

import (
	"regexp"
)

// ValidatePhone 验证中国大陆手机号格式
// 格式：1[3-9]开头 + 9位数字
func ValidatePhone(phone string) bool {
	if len(phone) != 11 {
		return false
	}
	// 正则表达式：1[3-9]\d{9}
	pattern := `^1[3-9]\d{9}$`
	matched, err := regexp.MatchString(pattern, phone)
	if err != nil {
		return false
	}
	return matched
}

// ValidatePassword 验证密码强度
// 要求：8-16位，包含大写字母、小写字母、数字、特殊字符
func ValidatePassword(password string) bool {
	if len(password) < 8 || len(password) > 16 {
		return false
	}

	// 检查是否包含大写字母
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	// 检查是否包含小写字母
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	// 检查是否包含数字
	hasNumber := regexp.MustCompile(`\d`).MatchString(password)
	// 检查是否包含特殊字符
	hasSpecial := regexp.MustCompile(`[!@#$%^&*]`).MatchString(password)

	return hasUpper && hasLower && hasNumber && hasSpecial
}

// ValidateRequired 验证必填字段
func ValidateRequired(field string) bool {
	return len(field) > 0
}
