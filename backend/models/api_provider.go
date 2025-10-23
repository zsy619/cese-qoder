package models

import (
	"time"
)

// APIProvider API Provider配置模型
type APIProvider struct {
	ID         uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Mobile     string    `json:"mobile" gorm:"type:varchar(32);not null;index"`
	Name       string    `json:"name" gorm:"type:varchar(100);not null"`
	APIKey     string    `json:"api_key" gorm:"type:varchar(255)"` // 改为可选，移除 not null
	APIURL     string    `json:"api_url" gorm:"type:varchar(500);not null"`
	APIModel   string    `json:"api_model" gorm:"type:varchar(100);not null"`
	APIVersion string    `json:"api_version" gorm:"type:varchar(20);default:'v1'"`
	APIStatus  int8      `json:"api_status" gorm:"type:tinyint(1);default:1;index"`
	APIOpen    int8      `json:"api_open" gorm:"type:tinyint(1);default:0;index"`
	APIRemark  string    `json:"api_remark,omitempty" gorm:"type:text"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName 指定表名
func (APIProvider) TableName() string {
	return "cese_api_provider"
}

// APIProviderCreateRequest 创建API Provider请求
type APIProviderCreateRequest struct {
	Name       string `json:"name" binding:"required"`
	APIKey     string `json:"api_key"` // 移除 required，改为可选
	APIURL     string `json:"api_url" binding:"required"`
	APIModel   string `json:"api_model" binding:"required"`
	APIVersion string `json:"api_version"`
	APIOpen    int8   `json:"api_open"`
	APIRemark  string `json:"api_remark"`
}

// APIProviderUpdateRequest 更新API Provider请求
type APIProviderUpdateRequest struct {
	Name       string `json:"name"`
	APIKey     string `json:"api_key"`
	APIURL     string `json:"api_url"`
	APIModel   string `json:"api_model"`
	APIVersion string `json:"api_version"`
	APIStatus  *int8  `json:"api_status"`
	APIOpen    *int8  `json:"api_open"`
	APIRemark  string `json:"api_remark"`
}

// APIProviderResponse API Provider响应（隐藏敏感信息）
type APIProviderResponse struct {
	ID         uint      `json:"id"`
	Mobile     string    `json:"mobile"`
	Name       string    `json:"name"`
	APIKeyMask string    `json:"api_key_mask"` // 脱敏后的密钥
	APIURL     string    `json:"api_url"`
	APIModel   string    `json:"api_model"`
	APIVersion string    `json:"api_version"`
	APIStatus  int8      `json:"api_status"`
	APIOpen    int8      `json:"api_open"`
	APIRemark  string    `json:"api_remark,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ToResponse 转换为响应格式（脱敏）
func (p *APIProvider) ToResponse() *APIProviderResponse {
	return &APIProviderResponse{
		ID:         p.ID,
		Mobile:     p.Mobile,
		Name:       p.Name,
		APIKeyMask: maskAPIKey(p.APIKey),
		APIURL:     p.APIURL,
		APIModel:   p.APIModel,
		APIVersion: p.APIVersion,
		APIStatus:  p.APIStatus,
		APIOpen:    p.APIOpen,
		APIRemark:  p.APIRemark,
		CreatedAt:  p.CreatedAt,
		UpdatedAt:  p.UpdatedAt,
	}
}

// maskAPIKey API Key脱敏处理
func maskAPIKey(key string) string {
	if len(key) <= 8 {
		return "****"
	}
	return key[:4] + "****" + key[len(key)-4:]
}
