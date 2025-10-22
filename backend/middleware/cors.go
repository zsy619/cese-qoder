package middleware

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
)

// CORSMiddleware 跨域中间件
func CORSMiddleware() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		// 允许的源
		c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
		// 允许的方法
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		// 允许的头
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		// 允许携带凭证
		c.Header("Access-Control-Allow-Credentials", "true")
		// 预检请求有效期
		c.Header("Access-Control-Max-Age", "3600")

		// 处理预检请求
		if string(c.Method()) == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next(ctx)
	}
}
