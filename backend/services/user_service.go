package services

import (
	"errors"

	"github.com/zsy619/cese-qoder/backend/config"
	"github.com/zsy619/cese-qoder/backend/models"
	"github.com/zsy619/cese-qoder/backend/utils"
)

// UserService 用户服务
type UserService struct{}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// ChangePasswordRequest 修改密码请求
type ChangePasswordRequest struct {
	Phone       string `json:"phone" binding:"required"`
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

// Register 用户注册
func (s *UserService) Register(req *RegisterRequest) (*models.User, error) {
	// 验证手机号格式
	if !utils.ValidatePhone(req.Phone) {
		return nil, errors.New("手机号格式错误")
	}

	// 验证密码强度
	if !utils.ValidatePassword(req.Password) {
		return nil, errors.New("密码强度不足：需要8-16位，包含大小写字母、数字和特殊字符")
	}

	// 检查手机号是否已存在
	var existUser models.User
	if err := config.DB.Where("phone = ?", req.Phone).First(&existUser).Error; err == nil {
		return nil, errors.New("手机号已存在")
	}

	// 加密密码
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	// 创建用户
	user := &models.User{
		Phone:    req.Phone,
		Password: hashedPassword,
	}

	if err := config.DB.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// Login 用户登录
func (s *UserService) Login(req *LoginRequest) (string, *models.User, error) {
	// 验证手机号格式
	if !utils.ValidatePhone(req.Phone) {
		return "", nil, errors.New("手机号格式错误")
	}

	// 查询用户
	var user models.User
	if err := config.DB.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		return "", nil, errors.New("手机号不存在")
	}

	// 验证密码
	if !utils.CheckPassword(user.Password, req.Password) {
		return "", nil, errors.New("密码错误")
	}

	// 生成 Token
	token, err := utils.GenerateToken(user.Phone)
	if err != nil {
		return "", nil, errors.New("生成 Token 失败")
	}

	return token, &user, nil
}

// ChangePassword 修改密码
func (s *UserService) ChangePassword(req *ChangePasswordRequest) error {
	// 验证手机号格式
	if !utils.ValidatePhone(req.Phone) {
		return errors.New("手机号格式错误")
	}

	// 验证新密码强度
	if !utils.ValidatePassword(req.NewPassword) {
		return errors.New("新密码强度不足：需要8-16位，包含大小写字母、数字和特殊字符")
	}

	// 查询用户
	var user models.User
	if err := config.DB.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		return errors.New("手机号不存在")
	}

	// 验证旧密码
	if !utils.CheckPassword(user.Password, req.OldPassword) {
		return errors.New("旧密码错误")
	}

	// 加密新密码
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return errors.New("密码加密失败")
	}

	// 更新密码
	if err := config.DB.Model(&user).Update("password", hashedPassword).Error; err != nil {
		return err
	}

	return nil
}

// GetUserInfo 获取用户信息
func (s *UserService) GetUserInfo(phone string) (*models.User, error) {
	var user models.User
	if err := config.DB.Where("phone = ?", phone).First(&user).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	return &user, nil
}

// GetUserByPhone 根据手机号获取用户（供其他服务调用）
func GetUserByPhone(phone string) (*models.User, error) {
	var user models.User
	if err := config.DB.Where("phone = ?", phone).First(&user).Error; err != nil {
		return nil, errors.New("用户不存在")
	}
	return &user, nil
}
