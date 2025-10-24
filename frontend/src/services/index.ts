/**
 * 服务层统一导出入口
 * @description 提供所有API服务的统一导入接口
 */

// 导出通用定义和工具
export * from './common';

// 导出认证相关
export { default as HttpClient, InterceptorManager, TokenManager } from './auth';
export type { ErrorInterceptor, RequestInterceptor, ResponseInterceptor } from './auth';

// 导出用户服务
export { default as UserService } from './user';
export type {
    ChangePasswordRequest, LoginRequest,
    LoginResponse, RegisterRequest,
    RegisterResponse, UserInfo
} from './user';

// 导出API Provider服务
export { API_TYPE_CONFIGS, APIProviderOpenType, default as APIProviderService, APIProviderStatus, APIType } from './api_provider';
export type {
    APIProvider,
    APIProviderData, APIProviderListResponse, APIProviderQueryParams, APIProviderUpdateData, APITypeConfig
} from './api_provider';

// 导出模板服务
export { default as TemplateService } from './api';
export type {
    Template, TemplateData, TemplateQueryParams
} from './api';

// 导出AI生成服务
export { AIService } from './ai_service';
export type { AIGenerateRequest, AIGenerateResponse } from './ai_service';

// 向后兼容的导出
export {
    createTemplate, deleteTemplate, exportTemplateAsJSON, exportTemplateAsMarkdown, getTemplateById, getTemplates, updateTemplate
} from './api';

