package handlers

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/zsy619/cese-qoder/backend/services"
	"github.com/zsy619/cese-qoder/backend/utils"
)

var userService = &services.UserService{}

// RegisterHandler 用户注册处理器
// POST /api/v1/user/register
func RegisterHandler(ctx context.Context, c *app.RequestContext) {
	var req services.RegisterRequest
	if err := c.BindAndValidate(&req); err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "参数错误: "+err.Error())
		return
	}

	user, err := userService.Register(&req)
	if err != nil {
		// 根据错误信息返回不同的错误码
		code := utils.CodeError
		if err.Error() == "手机号格式错误" {
			code = utils.CodePhoneInvalid
		} else if err.Error() == "手机号已存在" {
			code = utils.CodePhoneExists
		} else if err.Error() == "密码强度不足：需要8-16位，包含大小写字母、数字和特殊字符" {
			code = utils.CodePasswordWeak
		}
		utils.ResponseError(&ctx, c, code, err.Error())
		return
	}

	utils.SuccessWithMessage(&ctx, c, "注册成功", user)
}

// LoginHandler 用户登录处理器
// POST /api/v1/user/login
func LoginHandler(ctx context.Context, c *app.RequestContext) {
	var req services.LoginRequest
	if err := c.BindAndValidate(&req); err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "参数错误: "+err.Error())
		return
	}

	token, user, err := userService.Login(&req)
	if err != nil {
		// 根据错误信息返回不同的错误码
		code := utils.CodeError
		if err.Error() == "手机号格式错误" {
			code = utils.CodePhoneInvalid
		} else if err.Error() == "手机号不存在" {
			code = utils.CodePhoneNotFound
		} else if err.Error() == "密码错误" {
			code = utils.CodePasswordError
		}
		utils.ResponseError(&ctx, c, code, err.Error())
		return
	}

	utils.SuccessWithMessage(&ctx, c, "登录成功", map[string]interface{}{
		"token": token,
		"user":  user,
	})
}

// ChangePasswordHandler 修改密码处理器
// POST /api/v1/user/change-password
func ChangePasswordHandler(ctx context.Context, c *app.RequestContext) {
	var req services.ChangePasswordRequest
	if err := c.BindAndValidate(&req); err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "参数错误: "+err.Error())
		return
	}

	// 从上下文获取用户信息
	userPhone, exists := c.Get("userPhone")
	if !exists {
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未认证")
		return
	}

	// 验证是否为本人操作
	if userPhone.(string) != req.Phone {
		utils.ResponseError(&ctx, c, utils.CodeForbidden, "无权修改他人密码")
		return
	}

	err := userService.ChangePassword(&req)
	if err != nil {
		code := utils.CodeError
		if err.Error() == "手机号不存在" {
			code = utils.CodePhoneNotFound
		} else if err.Error() == "旧密码错误" {
			code = utils.CodePasswordError
		} else if err.Error() == "新密码强度不足：需要8-16位，包含大小写字母、数字和特殊字符" {
			code = utils.CodePasswordWeak
		}
		utils.ResponseError(&ctx, c, code, err.Error())
		return
	}

	utils.SuccessWithMessage(&ctx, c, "密码修改成功", nil)
}

// GetUserInfoHandler 获取用户信息处理器
// GET /api/v1/user/info
func GetUserInfoHandler(ctx context.Context, c *app.RequestContext) {
	// 从上下文获取用户信息
	userPhone, exists := c.Get("userPhone")
	if !exists {
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未认证")
		return
	}

	user, err := userService.GetUserInfo(userPhone.(string))
	if err != nil {
		utils.ResponseError(&ctx, c, utils.CodeNotFound, err.Error())
		return
	}

	utils.Success(&ctx, c, user)
}
