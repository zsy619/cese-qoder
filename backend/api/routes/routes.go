package routes

import (
	"context"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/zsy619/cese-qoder/backend/api/handlers"
	"github.com/zsy619/cese-qoder/backend/middleware"
	"github.com/zsy619/cese-qoder/backend/utils"
	"go.uber.org/zap"
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

	// ===== API Provider路由（全部需要认证）=====
	apiProvider := v1.Group("/api-provider")
	apiProvider.Use(middleware.AuthMiddleware())
	{
		apiProvider.POST("", handlers.CreateAPIProviderHandler)
		apiProvider.GET("", handlers.ListAPIProvidersHandler)
		apiProvider.GET("/:id", handlers.GetAPIProviderHandler)
		apiProvider.PUT("/:id", handlers.UpdateAPIProviderHandler)
		apiProvider.DELETE("/:id", handlers.DeleteAPIProviderHandler)
	}

	// ===== AI生成路由（全部需要认证）=====
	generate := v1.Group("/generate")
	generate.Use(middleware.AuthMiddleware())
	{
		generate.POST("", handlers.GenerateContentHandler)
	}

	// 健康检查接口
	h.GET("/health", func(ctx context.Context, c *app.RequestContext) {
		c.JSON(200, map[string]string{
			"status": "ok",
		})
	})

	// ===== 静态文件服务 =====
	// 提供提示词模板文件访问
	h.GET("/docs/*filepath", func(ctx context.Context, c *app.RequestContext) {
		// 获取请求的文件路径
		requestPath := string(c.Param("filepath"))

		utils.Info("Static file request",
			zap.String("requestPath", requestPath),
			zap.String("fullPath", string(c.Request.URI().Path())))

		// 移除前导斜杠
		requestPath = strings.TrimPrefix(requestPath, "/")

		// URL解码文件路径
		decodedPath, err := url.QueryUnescape(requestPath)
		if err == nil {
			requestPath = decodedPath
			utils.Info("Decoded file path", zap.String("decodedPath", requestPath))
		}

		// 构建实际文件路径
		// 提示词模板文件在 frontend/public/docs 目录
		// 使用相对路径 ../frontend/public/docs 来定位文件
		currentDir, _ := os.Getwd()
		filePath := filepath.Join(currentDir, "..", "frontend", "public", "docs", requestPath)

		utils.Info("Attempting to read file", zap.String("filePath", filePath))

		// 检查文件是否存在
		fileInfo, err := os.Stat(filePath)
		if os.IsNotExist(err) {
			utils.Warn("File not found",
				zap.String("filePath", filePath),
				zap.String("requestPath", requestPath))
			c.String(404, "File not found: "+requestPath)
			return
		}

		if err != nil {
			utils.Error("Error checking file",
				zap.String("filePath", filePath),
				zap.Error(err))
			c.String(500, "Error checking file: "+err.Error())
			return
		}

		// 确保不是目录
		if fileInfo.IsDir() {
			utils.Warn("Requested path is a directory", zap.String("filePath", filePath))
			c.String(400, "Cannot serve directory")
			return
		}

		// 读取文件内容
		content, err := os.ReadFile(filePath)
		if err != nil {
			utils.Error("Error reading file",
				zap.String("filePath", filePath),
				zap.Error(err))
			c.String(500, "Error reading file: "+err.Error())
			return
		}

		utils.Info("File read successfully",
			zap.String("filePath", filePath),
			zap.Int("contentLength", len(content)))

		// 设置正确的 Content-Type 和字符编码
		contentType := "text/plain; charset=utf-8"
		ext := filepath.Ext(filePath)
		if ext == ".md" {
			contentType = "text/markdown; charset=utf-8"
		}

		c.Header("Content-Type", contentType)
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")

		// 返回文件内容
		c.Data(200, contentType, content)

		utils.Info("File served successfully",
			zap.String("filePath", filePath),
			zap.String("contentType", contentType))
	})
}
