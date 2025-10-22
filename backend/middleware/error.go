package middleware

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/protocol/consts"
	"github.com/zsy619/cese-qoder/backend/utils"
	"go.uber.org/zap"
)

// ErrorHandlerMiddleware 错误处理中间件
func ErrorHandlerMiddleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		defer func() {
			if err := recover(); err != nil {
				// 记录错误堆栈
				utils.Error("Panic recovered",
					zap.Any("error", err),
					zap.String("path", string(c.Path())),
				)

				// 返回统一错误响应
				c.JSON(consts.StatusInternalServerError, utils.Response{
					Code:    utils.CodeInternalError,
					Message: "服务器内部错误",
					Data:    nil,
				})

				c.Abort()
			}
		}()

		c.Next(ctx)
	}
}
