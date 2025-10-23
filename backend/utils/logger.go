package utils

import (
	"os"

	"github.com/zsy619/cese-qoder/backend/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Logger *zap.Logger

// InitLogger 初始化日志
func InitLogger() error {
	// 使用默认配置
	cfg := config.GetConfig()
	return InitLoggerWithConfig(&cfg.Log)
}

// InitLoggerWithConfig 使用指定配置初始化日志
func InitLoggerWithConfig(cfg *config.LogConfig) error {
	// 确保日志目录存在
	if err := os.MkdirAll("logs", 0755); err != nil {
		return err
	}

	// 解析日志级别
	level := parseLogLevel(cfg.Level)

	// 配置编码器
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.LowercaseLevelEncoder,
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	// 配置日志轮转
	fileWriter := &lumberjack.Logger{
		Filename:   cfg.FilePath,
		MaxSize:    cfg.MaxSize,    // MB
		MaxBackups: cfg.MaxBackups, // 保留的旧文件数量
		MaxAge:     cfg.MaxAge,     // 保留天数
		Compress:   true,           // 压缩旧文件
	}

	// 创建多输出writer（控制台 + 文件）
	consoleEncoder := zapcore.NewConsoleEncoder(encoderConfig)
	fileEncoder := zapcore.NewJSONEncoder(encoderConfig)

	core := zapcore.NewTee(
		zapcore.NewCore(consoleEncoder, zapcore.AddSync(os.Stdout), level),
		zapcore.NewCore(fileEncoder, zapcore.AddSync(fileWriter), level),
	)

	// 创建日志实例
	Logger = zap.New(core, zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel))

	return nil
}

// parseLogLevel 解析日志级别
func parseLogLevel(levelStr string) zapcore.Level {
	switch levelStr {
	case "debug":
		return zap.DebugLevel
	case "info":
		return zap.InfoLevel
	case "warn":
		return zap.WarnLevel
	case "error":
		return zap.ErrorLevel
	default:
		return zap.InfoLevel
	}
}

// Debug 调试日志
func Debug(msg string, fields ...zap.Field) {
	if Logger != nil {
		Logger.Debug(msg, fields...)
	}
}

// Info 信息日志
func Info(msg string, fields ...zap.Field) {
	if Logger != nil {
		Logger.Info(msg, fields...)
	}
}

// Warn 警告日志
func Warn(msg string, fields ...zap.Field) {
	if Logger != nil {
		Logger.Warn(msg, fields...)
	}
}

// Error 错误日志
func Error(msg string, fields ...zap.Field) {
	if Logger != nil {
		Logger.Error(msg, fields...)
	}
}

// Fatal 致命错误日志
func Fatal(msg string, fields ...zap.Field) {
	if Logger != nil {
		Logger.Fatal(msg, fields...)
	}
	os.Exit(1)
}

// Sync 同步日志
func Sync() {
	if Logger != nil {
		_ = Logger.Sync()
	}
}
