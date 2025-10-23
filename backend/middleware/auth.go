package middleware

import (
	"context"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/zsy619/cese-qoder/backend/utils"
)

// AuthMiddleware JWT 认证中间件
func AuthMiddleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		// 获取 Authorization header
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) == 0 {
			c.JSON(consts.StatusUnauthorized, utils.Response{
				Code:    utils.CodeUnauthorized,
				Message: "未提供认证信息",
				Data:    nil,
			})
			c.Abort()
			return
		}

		// 验证 Token 格式：Bearer <token>
		parts := strings.SplitN(string(authHeader), " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(consts.StatusUnauthorized, utils.Response{
				Code:    utils.CodeUnauthorized,
				Message: "认证格式错误",
				Data:    nil,
			})
			c.Abort()
			return
		}

		// 解析 Token
		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			c.JSON(consts.StatusUnauthorized, utils.Response{
				Code:    utils.CodeTokenInvalid,
				Message: "Token 无效或已过期",
				Data:    nil,
			})
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("userMobile", claims.Mobile)

		c.Next(ctx)
	}
}
