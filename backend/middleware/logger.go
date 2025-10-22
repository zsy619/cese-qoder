package middleware

import (
	"context"
	"time"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/zsy619/cese-qoder/backend/utils"
	"go.uber.org/zap"
)

// LoggerMiddleware 日志中间件
func LoggerMiddleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		// 记录开始时间
		start := time.Now()

		// 处理请求
		c.Next(ctx)

		// 计算耗时
		latency := time.Since(start)

		// 记录日志
		utils.Info("HTTP Request",
			zap.String("method", string(c.Method())),
			zap.String("path", string(c.Path())),
			zap.String("client_ip", c.ClientIP()),
			zap.Int("status", c.Response.StatusCode()),
			zap.Duration("latency", latency),
		)
	}
}
