package handlers

import (
	"context"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/zsy619/cese-qoder/backend/models"
	"github.com/zsy619/cese-qoder/backend/services"
	"github.com/zsy619/cese-qoder/backend/utils"
	"go.uber.org/zap"
)

// CreateAPIProviderHandler 创建API Provider配置
func CreateAPIProviderHandler(ctx context.Context, c *app.RequestContext) {
	var req models.APIProviderCreateRequest
	if err := c.BindJSON(&req); err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "参数错误")
		return
	}

	// 验证必填字段
	if !utils.ValidateRequired(req.Name) {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "Provider名称不能为空")
		return
	}

	// API Key 改为可选，不需要验证

	if !utils.ValidateRequired(req.APIURL) {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "API URL不能为空")
		return
	}

	if !utils.ValidateRequired(req.APIModel) {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "模型名称不能为空")
		return
	}

	// 获取用户信息
	userMobile, exists := c.Get("userMobile")
	if !exists {
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未授权")
		return
	}

	// 创建Provider
	provider, err := services.CreateAPIProvider(userMobile.(string), &req)
	if err != nil {
		utils.Error("Failed to create API Provider", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "创建失败")
		return
	}

	utils.SuccessWithMessage(&ctx, c, "创建成功", provider.ToResponse())
}

// GetAPIProviderHandler 获取单个API Provider
func GetAPIProviderHandler(ctx context.Context, c *app.RequestContext) {
	// 获取Provider ID
	idStr := c.Param("id")
	providerID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "无效的Provider ID")
		return
	}

	// 获取用户信息
	userMobile, exists := c.Get("userMobile")
	if !exists {
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未授权")
		return
	}

	// 获取Provider
	provider, err := services.GetAPIProvider(userMobile.(string), uint(providerID))
	if err != nil {
		utils.ResponseError(&ctx, c, utils.CodeNotFound, "Provider不存在")
		return
	}

	utils.SuccessWithMessage(&ctx, c, "获取成功", provider.ToResponse())
}

// ListAPIProvidersHandler 获取用户的所有API Provider
func ListAPIProvidersHandler(ctx context.Context, c *app.RequestContext) {
	// 获取查询参数
	statusStr := c.Query("status")

	var status *int8
	if statusStr != "" {
		s, err := strconv.ParseInt(statusStr, 10, 8)
		if err == nil {
			s8 := int8(s)
			status = &s8
		}
	}

	// 获取用户信息
	userMobile, exists := c.Get("userMobile")
	if !exists {
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未授权")
		return
	}

	// 获取Provider列表
	providers, err := services.ListAPIProviders(userMobile.(string), status)
	if err != nil {
		utils.Error("Failed to list API Providers", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "查询失败")
		return
	}

	// 转换为响应格式
	responses := make([]*models.APIProviderResponse, len(providers))
	for i, p := range providers {
		responses[i] = p.ToResponse()
	}

	utils.SuccessWithMessage(&ctx, c, "查询成功", map[string]interface{}{
		"total": len(responses),
		"list":  responses,
	})
}

// UpdateAPIProviderHandler 更新API Provider
func UpdateAPIProviderHandler(ctx context.Context, c *app.RequestContext) {
	// 获取Provider ID
	idStr := c.Param("id")
	providerID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "无效的Provider ID")
		return
	}

	// 解析请求
	var req models.APIProviderUpdateRequest
	if err := c.BindJSON(&req); err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "参数错误")
		return
	}

	// 获取用户信息
	userMobile, exists := c.Get("userMobile")
	if !exists {
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未授权")
		return
	}

	// 更新Provider
	if err := services.UpdateAPIProvider(userMobile.(string), uint(providerID), &req); err != nil {
		utils.Error("Failed to update API Provider", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "更新失败")
		return
	}

	utils.SuccessWithMessage(&ctx, c, "更新成功", nil)
}

// DeleteAPIProviderHandler 删除API Provider
func DeleteAPIProviderHandler(ctx context.Context, c *app.RequestContext) {
	// 获取Provider ID
	idStr := c.Param("id")
	providerID, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "无效的Provider ID")
		return
	}

	// 获取用户信息
	userMobile, exists := c.Get("userMobile")
	if !exists {
		utils.ResponseError(&ctx, c, utils.CodeUnauthorized, "未授权")
		return
	}

	// 删除Provider
	if err := services.DeleteAPIProvider(userMobile.(string), uint(providerID)); err != nil {
		utils.Error("Failed to delete API Provider", zap.Error(err))
		utils.ResponseError(&ctx, c, utils.CodeServerError, "删除失败")
		return
	}

	utils.SuccessWithMessage(&ctx, c, "删除成功", nil)
}
