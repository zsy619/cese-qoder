package routes

import (
	"context"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/zsy619/cese-qoder/backend/api/handlers"
	"github.com/zsy619/cese-qoder/backend/middleware"
)

// RegisterRoutes 注册所有路由
func RegisterRoutes(h *server.Hertz) {
	// 全局中间件
	h.Use(middleware.ErrorHandlerMiddleware())
	h.Use(middleware.LoggerMiddleware())
	h.Use(middleware.CORSMiddleware())

	// API 版本分组
	v1 := h.Group("/api/v1")

	// ===== 用户路由 =====
	// 公开路由（无需认证）
	userPublic := v1.Group("/user")
	{
		userPublic.POST("/register", handlers.RegisterHandler)
		userPublic.POST("/login", handlers.LoginHandler)
	}

	// 需要认证的用户路由
	userAuth := v1.Group("/user")
	userAuth.Use(middleware.AuthMiddleware())
	{
		userAuth.POST("/change-password", handlers.ChangePasswordHandler)
		userAuth.GET("/info", handlers.GetUserInfoHandler)
	}

	// ===== 模板路由（全部需要认证）=====
	template := v1.Group("/template")
	template.Use(middleware.AuthMiddleware())
	{
		template.POST("", handlers.CreateTemplateHandler)
		template.GET("", handlers.GetTemplatesHandler)
		template.GET("/:id", handlers.GetTemplateByIDHandler)
		template.PUT("/:id", handlers.UpdateTemplateHandler)
		template.DELETE("/:id", handlers.DeleteTemplateHandler)
	}

	// 健康检查接口
	h.GET("/health", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{
			"status": "ok",
		})
	})
}
