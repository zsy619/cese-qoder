package handlers

import (
	"context"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/zsy619/cese-qoder/backend/services"
	"github.com/zsy619/cese-qoder/backend/utils"
)

var templateService = &services.TemplateService{}

// CreateTemplateHandler 创建模板处理器
// POST /api/v1/template
func CreateTemplateHandler(ctx context.Context, c *app.RequestContext) {
	var req services.TemplateRequest
	if err := c.BindAndValidate(&req); err != nil {
		utils.Error(&ctx, c, utils.CodeInvalidParams, "参数错误: "+err.Error())
		return
	}

	// 从上下文获取用户信息
	userPhone, exists := c.Get("userPhone")
	if !exists {
		utils.Error(&ctx, c, utils.CodeUnauthorized, "未认证")
		return
	}

	template, err := templateService.CreateTemplate(userPhone.(string), &req)
	if err != nil {
		utils.Error(&ctx, c, utils.CodeError, err.Error())
		return
	}

	utils.SuccessWithMessage(&ctx, c, "创建成功", template)
}

// GetTemplatesHandler 获取模板列表处理器
// GET /api/v1/template
func GetTemplatesHandler(ctx context.Context, c *app.RequestContext) {
	var req services.TemplateQueryRequest
	if err := c.BindAndValidate(&req); err != nil {
		utils.Error(&ctx, c, utils.CodeInvalidParams, "参数错误: "+err.Error())
		return
	}

	// 从上下文获取用户信息
	userPhone, exists := c.Get("userPhone")
	if !exists {
		utils.Error(&ctx, c, utils.CodeUnauthorized, "未认证")
		return
	}

	templates, total, err := templateService.GetTemplates(userPhone.(string), &req)
	if err != nil {
		utils.Error(&ctx, c, utils.CodeError, err.Error())
		return
	}

	utils.PageSuccess(&ctx, c, templates, total, req.Page, req.PageSize)
}

// GetTemplateByIDHandler 获取模板详情处理器
// GET /api/v1/template/:id
func GetTemplateByIDHandler(ctx context.Context, c *app.RequestContext) {
	// 获取模板 ID
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(&ctx, c, utils.CodeInvalidParams, "模板ID格式错误")
		return
	}

	// 从上下文获取用户信息
	userPhone, exists := c.Get("userPhone")
	if !exists {
		utils.Error(&ctx, c, utils.CodeUnauthorized, "未认证")
		return
	}

	template, err := templateService.GetTemplateByID(userPhone.(string), id)
	if err != nil {
		code := utils.CodeNotFound
		if err.Error() == "模板不存在或无权访问" {
			code = utils.CodeTemplateNotFound
		}
		utils.Error(&ctx, c, code, err.Error())
		return
	}

	utils.Success(&ctx, c, template)
}

// UpdateTemplateHandler 更新模板处理器
// PUT /api/v1/template/:id
func UpdateTemplateHandler(ctx context.Context, c *app.RequestContext) {
	// 获取模板 ID
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(&ctx, c, utils.CodeInvalidParams, "模板ID格式错误")
		return
	}

	var req services.TemplateRequest
	if err := c.BindAndValidate(&req); err != nil {
		utils.Error(&ctx, c, utils.CodeInvalidParams, "参数错误: "+err.Error())
		return
	}

	// 从上下文获取用户信息
	userPhone, exists := c.Get("userPhone")
	if !exists {
		utils.Error(&ctx, c, utils.CodeUnauthorized, "未认证")
		return
	}

	template, err := templateService.UpdateTemplate(userPhone.(string), id, &req)
	if err != nil {
		code := utils.CodeError
		if err.Error() == "模板不存在或无权操作" {
			code = utils.CodeTemplateNoAuth
		}
		utils.Error(&ctx, c, code, err.Error())
		return
	}

	utils.SuccessWithMessage(&ctx, c, "更新成功", template)
}

// DeleteTemplateHandler 删除模板处理器
// DELETE /api/v1/template/:id
func DeleteTemplateHandler(ctx context.Context, c *app.RequestContext) {
	// 获取模板 ID
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(&ctx, c, utils.CodeInvalidParams, "模板ID格式错误")
		return
	}

	// 从上下文获取用户信息
	userPhone, exists := c.Get("userPhone")
	if !exists {
		utils.Error(&ctx, c, utils.CodeUnauthorized, "未认证")
		return
	}

	err = templateService.DeleteTemplate(userPhone.(string), id)
	if err != nil {
		code := utils.CodeError
		if err.Error() == "模板不存在或无权操作" {
			code = utils.CodeTemplateNoAuth
		}
		utils.Error(&ctx, c, code, err.Error())
		return
	}

	utils.SuccessWithMessage(&ctx, c, "删除成功", nil)
}
