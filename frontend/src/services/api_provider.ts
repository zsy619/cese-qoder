/**
 * API Provider配置管理服务
 * @description 提供大模型API Provider的增删改查功能
 */

import HttpClient from './auth';

/**
 * API Provider配置数据接口
 */
export interface APIProviderData {
  /** Provider名称 */
  name: string;
  /** API密钥 */
  api_key: string;
  /** API访问地址 */
  api_url: string;
  /** 使用的模型名称 */
  api_model: string;
  /** API版本，默认v1 */
  api_version?: string;
  /** 开放类型：0-私有，1-公开 (TINYINT(1)) */
  api_open?: number;
  /** 备注说明 */
  api_remark?: string;
}

/**
 * API Provider完整信息接口
 */
export interface APIProvider {
  /** Provider ID */
  id: number;
  /** 用户手机号 */
  mobile: string;
  /** Provider名称 */
  name: string;
  /** API密钥（脱敏显示） */
  api_key_mask: string;
  /** API访问地址 */
  api_url: string;
  /** 使用的模型名称 */
  api_model: string;
  /** API版本 */
  api_version: string;
  /** 状态：1-启用，0-禁用 (TINYINT(1)) */
  api_status: number;
  /** 开放类型：0-私有，1-公开 (TINYINT(1)) */
  api_open: number;
  /** 备注说明 */
  api_remark?: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

/**
 * API Provider更新请求参数
 */
export interface APIProviderUpdateData {
  /** Provider名称 */
  name?: string;
  /** API密钥 */
  api_key?: string;
  /** API访问地址 */
  api_url?: string;
  /** 使用的模型名称 */
  api_model?: string;
  /** API版本 */
  api_version?: string;
  /** 状态：1-启用，0-禁用 (TINYINT(1)) */
  api_status?: number;
  /** 开放类型：0-私有，1-公开 (TINYINT(1)) */
  api_open?: number;
  /** 备注说明 */
  api_remark?: string;
}

/**
 * API Provider查询参数
 */
export interface APIProviderQueryParams {
  /** 按状态过滤：1-启用，0-禁用 */
  status?: number;
}

/**
 * API Provider列表响应
 */
export interface APIProviderListResponse {
  /** 总数 */
  total: number;
  /** Provider列表 */
  list: APIProvider[];
}

/**
 * API类型枚举（已废弃，因api_type字段已移除）
 * @deprecated 该枚举已废弃，保留仅为向后兼容
 */
export enum APIType {
  /** OpenAI官方API */
  OPENAI = 'openai',
  /** DeepSeek */
  DEEPSEEK = 'deepseek',
  /** Ollama本地部署 */
  OLLAMA = 'ollama',
  /** 自定义（兼容OpenAI格式） */
  CUSTOM = 'custom',
}

/**
 * API Provider状态枚举
 */
export enum APIProviderStatus {
  /** 禁用 */
  DISABLED = 0,
  /** 启用 */
  ENABLED = 1,
}

/**
 * API Provider开放类型枚举
 */
export enum APIProviderOpenType {
  /** 私有 */
  PRIVATE = 0,
  /** 公开 */
  PUBLIC = 1,
}

/**
 * API类型配置信息（已废弃，因api_type字段已移除）
 * @deprecated 该接口已废弃，保留仅为向后兼容
 */
export interface APITypeConfig {
  /** 类型标识 */
  type: APIType;
  /** 显示名称 */
  label: string;
  /** 默认URL */
  defaultURL: string;
  /** 常用模型列表 */
  models: string[];
  /** 描述信息 */
  description: string;
}

/**
 * 支持的API类型配置（已废弃，因api_type字段已移除）
 * @deprecated 该配置已废弃，保留仅为向后兼容
 */
export const API_TYPE_CONFIGS: Record<APIType, APITypeConfig> = {
  [APIType.OPENAI]: {
    type: APIType.OPENAI,
    label: 'OpenAI',
    defaultURL: 'https://api.openai.com',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    description: 'OpenAI官方API，支持GPT系列模型',
  },
  [APIType.DEEPSEEK]: {
    type: APIType.DEEPSEEK,
    label: 'DeepSeek',
    defaultURL: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-coder'],
    description: '国产大模型，性价比高',
  },
  [APIType.OLLAMA]: {
    type: APIType.OLLAMA,
    label: 'Ollama',
    defaultURL: 'http://localhost:11434',
    models: ['llama2', 'mistral', 'codellama'],
    description: '本地部署的大模型服务',
  },
  [APIType.CUSTOM]: {
    type: APIType.CUSTOM,
    label: '自定义',
    defaultURL: '',
    models: [],
    description: '兼容OpenAI格式的自定义API',
  },
};

/**
 * API Provider服务类
 * @description 提供API Provider配置的所有操作
 */
export class APIProviderService {
  /**
   * 创建API Provider配置
   * @param data - Provider配置数据
   * @returns Promise<APIProvider> 创建成功返回Provider信息
   * @throws {ApiError} 创建失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const provider = await APIProviderService.create({
   *     name: 'DeepSeek',
   *     api_key: 'sk-xxxxx',
   *     api_url: 'https://api.deepseek.com',
   *     api_model: 'deepseek-chat',
   *     api_remark: 'DeepSeek官方API'
   *   });
   *   console.log('创建成功:', provider);
   * } catch (error) {
   *   console.error('创建失败:', error.message);
   * }
   * ```
   */
  static async create(data: APIProviderData): Promise<APIProvider> {
    return HttpClient.post<APIProvider>('/api-provider', data, {
      requireAuth: true,
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 获取API Provider列表
   * @param params - 查询参数
   * @returns Promise<APIProviderListResponse> Provider列表
   * @throws {ApiError} 查询失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const result = await APIProviderService.list({
   *     status: 1
   *   });
   *   console.log('总数:', result.total);
   *   console.log('列表:', result.list);
   * } catch (error) {
   *   console.error('查询失败:', error.message);
   * }
   * ```
   */
  static async list(
    params?: APIProviderQueryParams
  ): Promise<APIProviderListResponse> {
    return HttpClient.get<APIProviderListResponse>('/api-provider', params, {
      requireAuth: true,
      showLoading: false,
      showError: true,
    });
  }

  /**
   * 根据ID获取API Provider详情
   * @param id - Provider ID
   * @returns Promise<APIProvider> Provider详情
   * @throws {ApiError} 获取失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const provider = await APIProviderService.getById(1);
   *   console.log('Provider详情:', provider);
   * } catch (error) {
   *   console.error('获取失败:', error.message);
   * }
   * ```
   */
  static async getById(id: number): Promise<APIProvider> {
    return HttpClient.get<APIProvider>(`/api-provider/${id}`, undefined, {
      requireAuth: true,
      showLoading: false,
      showError: true,
    });
  }

  /**
   * 更新API Provider配置
   * @param id - Provider ID
   * @param data - 要更新的数据
   * @returns Promise<void> 更新成功
   * @throws {ApiError} 更新失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   await APIProviderService.update(1, {
   *     name: '新名称',
   *     api_status: 0
   *   });
   *   console.log('更新成功');
   * } catch (error) {
   *   console.error('更新失败:', error.message);
   * }
   * ```
   */
  static async update(
    id: number,
    data: APIProviderUpdateData
  ): Promise<void> {
    return HttpClient.put<void>(`/api-provider/${id}`, data, {
      requireAuth: true,
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 删除API Provider配置
   * @param id - Provider ID
   * @returns Promise<void> 删除成功
   * @throws {ApiError} 删除失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   await APIProviderService.delete(1);
   *   console.log('删除成功');
   * } catch (error) {
   *   console.error('删除失败:', error.message);
   * }
   * ```
   */
  static async delete(id: number): Promise<void> {
    return HttpClient.delete<void>(`/api-provider/${id}`, {
      requireAuth: true,
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 启用API Provider
   * @param id - Provider ID
   * @returns Promise<void> 启用成功
   * 
   * @example
   * ```typescript
   * await APIProviderService.enable(1);
   * ```
   */
  static async enable(id: number): Promise<void> {
    return this.update(id, { api_status: APIProviderStatus.ENABLED });
  }

  /**
   * 禁用API Provider
   * @param id - Provider ID
   * @returns Promise<void> 禁用成功
   * 
   * @example
   * ```typescript
   * await APIProviderService.disable(1);
   * ```
   */
  static async disable(id: number): Promise<void> {
    return this.update(id, { api_status: APIProviderStatus.DISABLED });
  }

  /**
   * 设置为公开Provider
   * @param id - Provider ID
   * @returns Promise<void> 设置成功
   * 
   * @example
   * ```typescript
   * await APIProviderService.setPublic(1);
   * ```
   */
  static async setPublic(id: number): Promise<void> {
    return this.update(id, { api_open: APIProviderOpenType.PUBLIC });
  }

  /**
   * 设置为私有Provider
   * @param id - Provider ID
   * @returns Promise<void> 设置成功
   * 
   * @example
   * ```typescript
   * await APIProviderService.setPrivate(1);
   * ```
   */
  static async setPrivate(id: number): Promise<void> {
    return this.update(id, { api_open: APIProviderOpenType.PRIVATE });
  }

  /**
   * 获取指定类型的所有Provider（已废弃，因api_type字段已移除）
   * @deprecated 该方法已废弃，请使用 list() 方法
   * @param _apiType - API类型（已无效）
   * @returns Promise<APIProvider[]> Provider列表
   */
  static async getByType(_apiType: string): Promise<APIProvider[]> {
    // api_type字段已移除，此方法仅为向后兼容保留
    const result = await this.list();
    return result.list;
  }

  /**
   * 获取所有启用的Provider
   * @returns Promise<APIProvider[]> 启用的Provider列表
   * 
   * @example
   * ```typescript
   * const enabledProviders = await APIProviderService.getEnabled();
   * ```
   */
  static async getEnabled(): Promise<APIProvider[]> {
    const result = await this.list({ status: APIProviderStatus.ENABLED });
    return result.list;
  }

  /**
   * 验证API Key格式
   * @param apiKey - API密钥
   * @returns boolean 是否有效
   * 
   * @example
   * ```typescript
   * const isValid = APIProviderService.validateAPIKey('sk-xxxxx');
   * ```
   */
  static validateAPIKey(apiKey: string): boolean {
    if (!apiKey || apiKey.trim() === '') {
      return false;
    }

    // 基本验证：非空且长度大于0
    return apiKey.length > 0;
  }

  /**
   * 验证API URL格式
   * @param url - API访问地址
   * @returns boolean 是否有效
   * 
   * @example
   * ```typescript
   * const isValid = APIProviderService.validateAPIURL('https://api.openai.com');
   * ```
   */
  static validateAPIURL(url: string): boolean {
    if (!url || url.trim() === '') {
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 格式化Provider显示名称
   * @param provider - Provider对象
   * @returns 格式化后的显示名称
   * 
   * @example
   * ```typescript
   * const displayName = APIProviderService.formatDisplayName(provider);
   * // 返回: "DeepSeek (deepseek-chat)"
   * ```
   */
  static formatDisplayName(provider: APIProvider): string {
    return `${provider.name} (${provider.api_model})`;
  }

  /**
   * 判断Provider是否可用
   * @param provider - Provider对象
   * @returns boolean 是否可用
   * 
   * @example
   * ```typescript
   * if (APIProviderService.isAvailable(provider)) {
   *   console.log('Provider可用');
   * }
   * ```
   */
  static isAvailable(provider: APIProvider): boolean {
    return provider.api_status === APIProviderStatus.ENABLED;
  }

  /**
   * 判断Provider是否为公开
   * @param provider - Provider对象
   * @returns boolean 是否公开
   * 
   * @example
   * ```typescript
   * if (APIProviderService.isPublic(provider)) {
   *   console.log('这是公开Provider');
   * }
   * ```
   */
  static isPublic(provider: APIProvider): boolean {
    return provider.api_open === APIProviderOpenType.PUBLIC;
  }

  /**
   * 测试Provider连接（前端模拟）
   * @param provider - Provider对象
   * @returns Promise<boolean> 连接是否成功
   * 
   * @example
   * ```typescript
   * const connected = await APIProviderService.testConnection(provider);
   * if (connected) {
   *   console.log('连接成功');
   * }
   * ```
   */
  static async testConnection(provider: APIProvider): Promise<boolean> {
    // 这是一个前端模拟的测试方法
    // 实际应该调用后端的测试接口
    try {
      // 简单验证URL是否有效
      return this.validateAPIURL(provider.api_url);
    } catch {
      return false;
    }
  }
}

/**
 * 导出默认的API Provider服务实例
 */
export default APIProviderService;
