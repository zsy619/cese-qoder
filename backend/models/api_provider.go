package models

import (
	"time"
)

// APIProvider API Provider配置模型
type APIProvider struct {
	ID         uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID     uint64    `json:"user_id" gorm:"not null;index"`
	Name       string    `json:"name" gorm:"type:varchar(100);not null"`
	APIKey     string    `json:"api_key" gorm:"type:varchar(255);not null"`
	APISecret  string    `json:"api_secret,omitempty" gorm:"type:varchar(255)"`
	APIURL     string    `json:"api_url" gorm:"type:varchar(500);not null"`
	APIType    string    `json:"api_type" gorm:"type:varchar(50);not null;index"`
	APIModel   string    `json:"api_model" gorm:"type:varchar(100);not null"`
	APIVersion string    `json:"api_version" gorm:"type:varchar(20);default:'v1'"`
	APIStatus  int8      `json:"api_status" gorm:"type:tinyint(1);default:1;index"`
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
	APIKey     string `json:"api_key" binding:"required"`
	APISecret  string `json:"api_secret"`
	APIURL     string `json:"api_url" binding:"required"`
	APIType    string `json:"api_type" binding:"required"`
	APIModel   string `json:"api_model" binding:"required"`
	APIVersion string `json:"api_version"`
	APIRemark  string `json:"api_remark"`
}

// APIProviderUpdateRequest 更新API Provider请求
type APIProviderUpdateRequest struct {
	Name       string `json:"name"`
	APIKey     string `json:"api_key"`
	APISecret  string `json:"api_secret"`
	APIURL     string `json:"api_url"`
	APIType    string `json:"api_type"`
	APIModel   string `json:"api_model"`
	APIVersion string `json:"api_version"`
	APIStatus  *int8  `json:"api_status"`
	APIRemark  string `json:"api_remark"`
}

// APIProviderResponse API Provider响应（隐藏敏感信息）
type APIProviderResponse struct {
	ID         uint      `json:"id"`
	UserID     uint64    `json:"user_id"`
	Name       string    `json:"name"`
	APIKeyMask string    `json:"api_key_mask"` // 脱敏后的密钥
	APIURL     string    `json:"api_url"`
	APIType    string    `json:"api_type"`
	APIModel   string    `json:"api_model"`
	APIVersion string    `json:"api_version"`
	APIStatus  int8      `json:"api_status"`
	APIRemark  string    `json:"api_remark,omitempty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// ToResponse 转换为响应格式（脱敏）
func (p *APIProvider) ToResponse() *APIProviderResponse {
	return &APIProviderResponse{
		ID:         p.ID,
		UserID:     p.UserID,
		Name:       p.Name,
		APIKeyMask: maskAPIKey(p.APIKey),
		APIURL:     p.APIURL,
		APIType:    p.APIType,
		APIModel:   p.APIModel,
		APIVersion: p.APIVersion,
		APIStatus:  p.APIStatus,
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
