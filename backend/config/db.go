package config

import (
	"fmt"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// DBConfig 数据库配置
type DBConfig struct {
	Host            string `yaml:"host"`
	Port            int    `yaml:"port"`
	User            string `yaml:"user"`
	Password        string `yaml:"password"`
	DBName          string `yaml:"dbname"`
	Charset         string `yaml:"charset"`
	MaxIdleConns    int    `yaml:"max_idle_conns"`
	MaxOpenConns    int    `yaml:"max_open_conns"`
	ConnMaxLifetime int    `yaml:"conn_max_lifetime"` // 秒
}

// InitDB 初始化数据库连接
func InitDB(config *DBConfig) error {
	// 构建 DSN
	// charset=utf8mb4 参数会设置 connection 的字符集，确保正确处理中文
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&collation=utf8mb4_unicode_ci&parseTime=True&loc=Local",
		config.User,
		config.Password,
		config.Host,
		config.Port,
		config.DBName,
	)

	// 连接数据库
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // 开发环境显示 SQL 日志
	})

	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	// 设置连接字符集为 utf8mb4，解决中文乱码问题
	// 这会设置 character_set_client, character_set_connection, character_set_results 为 utf8mb4
	if err := DB.Exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci").Error; err != nil {
		return fmt.Errorf("failed to set character set: %w", err)
	}

	// 获取底层 SQL DB 对象配置连接池
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// 设置连接池参数
	maxIdleConns := config.MaxIdleConns
	if maxIdleConns <= 0 {
		maxIdleConns = 10
	}
	maxOpenConns := config.MaxOpenConns
	if maxOpenConns <= 0 {
		maxOpenConns = 100
	}
	connMaxLifetime := config.ConnMaxLifetime
	if connMaxLifetime <= 0 {
		connMaxLifetime = 3600
	}

	sqlDB.SetMaxIdleConns(maxIdleConns)                                    // 最大空闲连接数
	sqlDB.SetMaxOpenConns(maxOpenConns)                                    // 最大打开连接数
	sqlDB.SetConnMaxLifetime(time.Duration(connMaxLifetime) * time.Second) // 连接最大生命周期

	return nil
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}

// CloseDB 关闭数据库连接
func CloseDB() error {
	if DB != nil {
		sqlDB, err := DB.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
