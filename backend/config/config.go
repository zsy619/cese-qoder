package config

// AppConfig 应用配置
type AppConfig struct {
	Server ServerConfig `yaml:"server"`
	DB     DBConfig     `yaml:"database"`
	JWT    JWTConfig    `yaml:"jwt"`
	Log    LogConfig    `yaml:"log"`
}

// ServerConfig 服务器配置
type ServerConfig struct {
	Host string `yaml:"host"`
	Port int    `yaml:"port"`
	Mode string `yaml:"mode"` // debug, release
}

// JWTConfig JWT 配置
type JWTConfig struct {
	Secret     string `yaml:"secret"`
	ExpireHour int    `yaml:"expire_hour"`
}

// LogConfig 日志配置
type LogConfig struct {
	Level      string `yaml:"level"` // debug, info, warn, error
	FilePath   string `yaml:"file_path"`
	MaxSize    int    `yaml:"max_size"` // MB
	MaxBackups int    `yaml:"max_backups"`
	MaxAge     int    `yaml:"max_age"` // days
}

// GetDefaultConfig 获取默认配置
func GetDefaultConfig() *AppConfig {
	return &AppConfig{
		Server: ServerConfig{
			Host: "0.0.0.0",
			Port: 8080,
			Mode: "debug",
		},
		DB: DBConfig{
			Host:     "localhost",
			Port:     3306,
			User:     "root",
			Password: "123456",
			DBName:   "context_engine",
			Charset:  "utf8mb4",
		},
		JWT: JWTConfig{
			Secret:     "cese-qoder-secret-key-change-in-production",
			ExpireHour: 24,
		},
		Log: LogConfig{
			Level:      "debug",
			FilePath:   "logs/app.log",
			MaxSize:    100,
			MaxBackups: 7,
			MaxAge:     30,
		},
	}
}
