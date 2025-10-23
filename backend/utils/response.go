package utils

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
)

// Response 统一响应结构体
type Response struct {
	Code    int         `json:"code"`    // 状态码：0 成功，其他失败
	Message string      `json:"message"` // 响应消息
	Data    interface{} `json:"data"`    // 响应数据
}

// PageData 分页数据结构
type PageData struct {
	List     interface{} `json:"list"`      // 数据列表
	Total    int64       `json:"total"`     // 总数
	Page     int         `json:"page"`      // 当前页码
	PageSize int         `json:"page_size"` // 每页数量
}

// 错误码常量定义
const (
	CodeSuccess          = 0    // 成功
	CodeError            = 1    // 通用错误
	CodeInvalidParams    = 400  // 参数错误
	CodeUnauthorized     = 401  // 未认证
	CodeForbidden        = 403  // 无权限
	CodeNotFound         = 404  // 资源不存在
	CodeInternalError    = 500  // 服务器内部错误
	CodeServerError      = 500  // 服务器错误（别名）
	CodeDatabaseError    = 501  // 数据库错误
	CodePhoneExists      = 1001 // 手机号已存在
	CodePhoneNotFound    = 1002 // 手机号不存在
	CodePasswordError    = 1003 // 密码错误
	CodePasswordWeak     = 1004 // 密码强度不足
	CodePhoneInvalid     = 1005 // 手机号格式错误
	CodeTokenInvalid     = 1006 // Token 无效
	CodeTokenExpired     = 1007 // Token 过期
	CodeTemplateNotFound = 2001 // 模板不存在
	CodeTemplateNoAuth   = 2002 // 无权操作该模板
)

// Success 成功响应
func Success(c *context.Context, ctx *app.RequestContext, data interface{}) {
	// 设置响应头，明确指定UTF-8编码
	ctx.Response.Header.Set("Content-Type", "application/json; charset=utf-8")
	ctx.JSON(consts.StatusOK, Response{
		Code:    CodeSuccess,
		Message: "success",
		Data:    data,
	})
}

// SuccessWithMessage 成功响应（自定义消息）
func SuccessWithMessage(c *context.Context, ctx *app.RequestContext, message string, data interface{}) {
	// 设置响应头，明确指定UTF-8编码
	ctx.Response.Header.Set("Content-Type", "application/json; charset=utf-8")
	ctx.JSON(consts.StatusOK, Response{
		Code:    CodeSuccess,
		Message: message,
		Data:    data,
	})
}

// ResponseError 错误响应
func ResponseError(c *context.Context, ctx *app.RequestContext, code int, message string) {
	// 设置响应头，明确指定UTF-8编码
	ctx.Response.Header.Set("Content-Type", "application/json; charset=utf-8")
	ctx.JSON(consts.StatusOK, Response{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}

// ErrorWithData 错误响应（带数据）
func ErrorWithData(c *context.Context, ctx *app.RequestContext, code int, message string, data interface{}) {
	// 设置响应头，明确指定UTF-8编码
	ctx.Response.Header.Set("Content-Type", "application/json; charset=utf-8")
	ctx.JSON(consts.StatusOK, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

// PageSuccess 分页成功响应
func PageSuccess(c *context.Context, ctx *app.RequestContext, list interface{}, total int64, page, pageSize int) {
	// 设置响应头，明确指定UTF-8编码
	ctx.Response.Header.Set("Content-Type", "application/json; charset=utf-8")
	ctx.JSON(consts.StatusOK, Response{
		Code:    CodeSuccess,
		Message: "success",
		Data: PageData{
			List:     list,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		},
	})
}

// GetErrorMessage 根据错误码获取错误消息
func GetErrorMessage(code int) string {
	messages := map[int]string{
		CodeSuccess:          "成功",
		CodeError:            "操作失败",
		CodeInvalidParams:    "参数错误",
		CodeUnauthorized:     "未认证，请先登录",
		CodeForbidden:        "无权限访问",
		CodeNotFound:         "资源不存在",
		CodeInternalError:    "服务器内部错误",
		CodeDatabaseError:    "数据库错误",
		CodePhoneExists:      "手机号已存在",
		CodePhoneNotFound:    "手机号不存在",
		CodePasswordError:    "密码错误",
		CodePasswordWeak:     "密码强度不足",
		CodePhoneInvalid:     "手机号格式错误",
		CodeTokenInvalid:     "Token 无效",
		CodeTokenExpired:     "Token 已过期",
		CodeTemplateNotFound: "模板不存在",
		CodeTemplateNoAuth:   "无权操作该模板",
	}

	if msg, ok := messages[code]; ok {
		return msg
	}
	return "未知错误"
}
