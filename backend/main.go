package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/zsy619/cese-qoder/backend/api/routes"
	"github.com/zsy619/cese-qoder/backend/config"
	"github.com/zsy619/cese-qoder/backend/utils"
	"go.uber.org/zap"
)

func main() {
	// 1. 初始化日志
	if err := utils.InitLogger(); err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer utils.Sync()

	utils.Info("Starting CESE-Qoder Backend Service...")

	// 2. 加载配置
	appConfig := config.GetDefaultConfig()
	utils.Info("Configuration loaded", zap.Any("config", appConfig))

	// 3. 初始化数据库连接
	if err := config.InitDB(&appConfig.DB); err != nil {
		utils.Fatal("Failed to connect to database", zap.Error(err))
	}
	utils.Info("Database connected successfully")

	// 4. 创建 Hertz 服务器实例
	h := server.Default(
		server.WithHostPorts(fmt.Sprintf("%s:%d", appConfig.Server.Host, appConfig.Server.Port)),
	)

	// 5. 注册路由
	routes.RegisterRoutes(h)
	utils.Info("Routes registered")

	// 6. 设置优雅关闭
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		utils.Info("Shutting down server...")

		// 关闭数据库连接
		if err := config.CloseDB(); err != nil {
			utils.Error("Error closing database", zap.Error(err))
		}

		utils.Info("Server stopped")
		os.Exit(0)
	}()

	// 7. 启动服务器
	utils.Info("Server started",
		zap.String("host", appConfig.Server.Host),
		zap.Int("port", appConfig.Server.Port),
	)

	h.Spin()
}
