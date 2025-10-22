package models

import (
	"time"
)

// Template 六要素模板模型
type Template struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         uint64    `gorm:"not null;index" json:"user_id"`
	Topic          string    `gorm:"type:varchar(255);not null;index" json:"topic"`
	TaskObjective  string    `gorm:"type:text" json:"task_objective"`
	AIRole         string    `gorm:"type:text" json:"ai_role"`
	MyRole         string    `gorm:"type:text" json:"my_role"`
	KeyInformation string    `gorm:"type:text" json:"key_information"`
	BehaviorRule   string    `gorm:"type:text" json:"behavior_rule"`
	DeliveryFormat string    `gorm:"type:text" json:"delivery_format"`
	CreatedAt      time.Time `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// TableName 指定表名
func (Template) TableName() string {
	return "cese_template"
}
