package models

import (
	"time"
)

// User 用户模型
type User struct {
	ID        uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Phone     string    `gorm:"type:varchar(11);uniqueIndex;not null" json:"phone"`
	Password  string    `gorm:"type:varchar(255);not null" json:"-"` // 不在 JSON 中显示密码
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// TableName 指定表名
func (User) TableName() string {
	return "cese_user"
}
