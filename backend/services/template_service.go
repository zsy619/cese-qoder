package services

import (
	"errors"
	"fmt"

	"github.com/zsy619/cese-qoder/backend/config"
	"github.com/zsy619/cese-qoder/backend/models"
)

// TemplateService 模板服务
type TemplateService struct{}

// TemplateRequest 模板请求
type TemplateRequest struct {
	Topic          string `json:"topic" binding:"required"`
	TaskObjective  string `json:"task_objective"`
	AIRole         string `json:"ai_role"`
	MyRole         string `json:"my_role"`
	KeyInformation string `json:"key_information"`
	BehaviorRule   string `json:"behavior_rule"`
	DeliveryFormat string `json:"delivery_format"`
}

// TemplateQueryRequest 模板查询请求
type TemplateQueryRequest struct {
	UserID         string `form:"user_id"`         // 精确匹配（手机号）
	Topic          string `form:"topic"`           // 模糊匹配
	TaskObjective  string `form:"task_objective"`  // 模糊匹配
	AIRole         string `form:"ai_role"`         // 模糊匹配
	MyRole         string `form:"my_role"`         // 模糊匹配
	KeyInformation string `form:"key_information"` // 模糊匹配
	BehaviorRule   string `form:"behavior_rule"`   // 模糊匹配
	DeliveryFormat string `form:"delivery_format"` // 模糊匹配
	Page           int    `form:"page"`            // 页码，默认 1
	PageSize       int    `form:"page_size"`       // 每页数量，默认 15
}

// CreateTemplate 创建模板
func (s *TemplateService) CreateTemplate(userMobile string, req *TemplateRequest) (*models.Template, error) {
	// 验证用户存在
	if _, err := GetUserByMobile(userMobile); err != nil {
		return nil, err
	}

	// 创建模板
	template := &models.Template{
		Mobile:         userMobile,
		Topic:          req.Topic,
		TaskObjective:  req.TaskObjective,
		AIRole:         req.AIRole,
		MyRole:         req.MyRole,
		KeyInformation: req.KeyInformation,
		BehaviorRule:   req.BehaviorRule,
		DeliveryFormat: req.DeliveryFormat,
	}

	if err := config.DB.Create(template).Error; err != nil {
		return nil, err
	}

	return template, nil
}

// GetTemplates 查询模板列表（支持多条件查询和分页）
func (s *TemplateService) GetTemplates(userMobile string, req *TemplateQueryRequest) ([]models.Template, int64, error) {
	// 验证用户存在
	if _, err := GetUserByMobile(userMobile); err != nil {
		return nil, 0, err
	}

	// 设置默认分页参数
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 {
		req.PageSize = 15
	}
	if req.PageSize > 100 {
		req.PageSize = 100
	}

	// 构建查询
	query := config.DB.Model(&models.Template{}).Where("mobile = ?", userMobile)

	// 添加模糊查询条件
	if req.Topic != "" {
		query = query.Where("topic LIKE ?", "%"+req.Topic+"%")
	}
	if req.TaskObjective != "" {
		query = query.Where("task_objective LIKE ?", "%"+req.TaskObjective+"%")
	}
	if req.AIRole != "" {
		query = query.Where("ai_role LIKE ?", "%"+req.AIRole+"%")
	}
	if req.MyRole != "" {
		query = query.Where("my_role LIKE ?", "%"+req.MyRole+"%")
	}
	if req.KeyInformation != "" {
		query = query.Where("key_information LIKE ?", "%"+req.KeyInformation+"%")
	}
	if req.BehaviorRule != "" {
		query = query.Where("behavior_rule LIKE ?", "%"+req.BehaviorRule+"%")
	}
	if req.DeliveryFormat != "" {
		query = query.Where("delivery_format LIKE ?", "%"+req.DeliveryFormat+"%")
	}

	// 查询总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 查询数据（按创建时间倒序）
	var templates []models.Template
	offset := (req.Page - 1) * req.PageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(req.PageSize).Find(&templates).Error; err != nil {
		return nil, 0, err
	}

	return templates, total, nil
}

// GetTemplateByID 获取模板详情
func (s *TemplateService) GetTemplateByID(userMobile string, templateID uint64) (*models.Template, error) {
	// 验证用户存在
	if _, err := GetUserByMobile(userMobile); err != nil {
		return nil, err
	}

	// 查询模板
	var template models.Template
	if err := config.DB.Where("id = ? AND mobile = ?", templateID, userMobile).First(&template).Error; err != nil {
		return nil, errors.New("模板不存在或无权访问")
	}

	return &template, nil
}

// UpdateTemplate 更新模板
func (s *TemplateService) UpdateTemplate(userMobile string, templateID uint64, req *TemplateRequest) (*models.Template, error) {
	// 验证用户存在
	if _, err := GetUserByMobile(userMobile); err != nil {
		return nil, err
	}

	// 查询模板
	var template models.Template
	if err := config.DB.Where("id = ? AND mobile = ?", templateID, userMobile).First(&template).Error; err != nil {
		return nil, errors.New("模板不存在或无权操作")
	}

	// 更新字段
	template.Topic = req.Topic
	template.TaskObjective = req.TaskObjective
	template.AIRole = req.AIRole
	template.MyRole = req.MyRole
	template.KeyInformation = req.KeyInformation
	template.BehaviorRule = req.BehaviorRule
	template.DeliveryFormat = req.DeliveryFormat

	if err := config.DB.Save(&template).Error; err != nil {
		return nil, err
	}

	return &template, nil
}

// DeleteTemplate 删除模板
func (s *TemplateService) DeleteTemplate(userMobile string, templateID uint64) error {
	// 验证用户存在
	if _, err := GetUserByMobile(userMobile); err != nil {
		return err
	}

	// 查询模板
	var template models.Template
	if err := config.DB.Where("id = ? AND mobile = ?", templateID, userMobile).First(&template).Error; err != nil {
		return errors.New("模板不存在或无权操作")
	}

	// 删除模板
	if err := config.DB.Delete(&template).Error; err != nil {
		return fmt.Errorf("删除失败: %w", err)
	}

	return nil
}
