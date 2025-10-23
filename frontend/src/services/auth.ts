/**
 * 统一的鉴权机制
 * @description 提供全局统一的Token管理、请求拦截和响应处理
 */

import {
    API_CONFIG,
    ApiError,
    ApiResponse,
    ErrorCode,
    getApiUrl,
    getErrorMessage,
    HttpMethod,
    RequestOptions,
    Storage,
} from './common';

/**
 * Token 存储键名
 */
const TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

/**
 * Token 管理类
 */
export class TokenManager {
  /**
   * 获取 Token
   * @returns Token 字符串，不存在返回 null
   */
  static getToken(): string | null {
    return Storage.get<string>(TOKEN_KEY);
  }

  /**
   * 设置 Token
   * @param token - Token 字符串
   */
  static setToken(token: string): void {
    Storage.set(TOKEN_KEY, token);
  }

  /**
   * 移除 Token
   */
  static removeToken(): void {
    Storage.remove(TOKEN_KEY);
  }

  /**
   * 判断是否已登录
   * @returns 是否存在有效 Token
   */
  static isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * 清除认证信息（包括Token和用户信息）
   */
  static clearAuth(): void {
    this.removeToken();
    Storage.remove(USER_INFO_KEY);
  }
}

/**
 * HTTP 请求客户端
 */
export class HttpClient {
  /**
   * 创建请求超时Promise
   * @param timeout - 超时时间（毫秒）
   * @returns Promise
   */
  private static createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new ApiError(ErrorCode.ERROR, '请求超时'));
      }, timeout);
    });
  }

  /**
   * 构建请求头
   * @param options - 请求选项
   * @returns Headers 对象
   */
  private static buildHeaders(options: RequestOptions): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 如果需要认证，添加 Authorization 头
    if (options.requireAuth !== false) {
      const token = TokenManager.getToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * 处理响应
   * @param response - Fetch Response 对象
   * @returns 解析后的数据
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    // 尝试解析JSON
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch (error) {
      throw new ApiError(
        ErrorCode.ERROR,
        '服务器响应格式错误',
        response
      );
    }

    // 检查业务状态码
    if (data.code !== ErrorCode.SUCCESS) {
      const errorMessage = data.message || getErrorMessage(data.code);
      const apiError = new ApiError(data.code, errorMessage, data);

      // 如果是认证错误，清除本地认证信息
      if (apiError.isAuthError()) {
        TokenManager.clearAuth();
        // 可以在这里触发跳转到登录页的事件
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      throw apiError;
    }

    return data.data as T;
  }

  /**
   * 执行 HTTP 请求
   * @param url - 请求 URL
   * @param options - 请求选项
   * @returns Promise<T>
   */
  static async request<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      requireAuth = true,
      timeout = API_CONFIG.TIMEOUT,
      showLoading = false,
      showError = true,
      ...fetchOptions
    } = options;

    // 构建完整的请求选项
    const requestInit: RequestInit = {
      ...fetchOptions,
      headers: this.buildHeaders({ requireAuth, ...fetchOptions }),
    };

    try {
      // 显示加载状态
      if (showLoading) {
        window.dispatchEvent(new CustomEvent('loading:start'));
      }

      // 创建请求Promise和超时Promise
      const fetchPromise = fetch(url, requestInit);
      const timeoutPromise = this.createTimeoutPromise(timeout);

      // 执行请求（带超时控制）
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // 处理响应
      return await this.handleResponse<T>(response);
    } catch (error) {
      // 统一错误处理
      if (error instanceof ApiError) {
        // 显示错误提示
        if (showError) {
          window.dispatchEvent(
            new CustomEvent('error:show', { detail: error.message })
          );
        }
        throw error;
      }

      // 网络错误或其他错误
      const networkError = new ApiError(
        ErrorCode.ERROR,
        '网络连接失败，请检查网络设置',
        error
      );

      if (showError) {
        window.dispatchEvent(
          new CustomEvent('error:show', { detail: networkError.message })
        );
      }

      throw networkError;
    } finally {
      // 隐藏加载状态
      if (showLoading) {
        window.dispatchEvent(new CustomEvent('loading:end'));
      }
    }
  }

  /**
   * GET 请求
   * @param path - API 路径
   * @param params - 查询参数
   * @param options - 请求选项
   * @returns Promise<T>
   */
  static async get<T = any>(
    path: string,
    params?: Record<string, any>,
    options?: RequestOptions
  ): Promise<T> {
    const queryString = params
      ? '?' +
        Object.entries(params)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';

    const url = getApiUrl(path) + queryString;
    return this.request<T>(url, {
      method: HttpMethod.GET,
      ...options,
    });
  }

  /**
   * POST 请求
   * @param path - API 路径
   * @param data - 请求数据
   * @param options - 请求选项
   * @returns Promise<T>
   */
  static async post<T = any>(
    path: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = getApiUrl(path);
    return this.request<T>(url, {
      method: HttpMethod.POST,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * PUT 请求
   * @param path - API 路径
   * @param data - 请求数据
   * @param options - 请求选项
   * @returns Promise<T>
   */
  static async put<T = any>(
    path: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = getApiUrl(path);
    return this.request<T>(url, {
      method: HttpMethod.PUT,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * DELETE 请求
   * @param path - API 路径
   * @param options - 请求选项
   * @returns Promise<T>
   */
  static async delete<T = any>(
    path: string,
    options?: RequestOptions
  ): Promise<T> {
    const url = getApiUrl(path);
    return this.request<T>(url, {
      method: HttpMethod.DELETE,
      ...options,
    });
  }

  /**
   * PATCH 请求
   * @param path - API 路径
   * @param data - 请求数据
   * @param options - 请求选项
   * @returns Promise<T>
   */
  static async patch<T = any>(
    path: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = getApiUrl(path);
    return this.request<T>(url, {
      method: HttpMethod.PATCH,
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }
}

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (
  url: string,
  options: RequestOptions
) => { url: string; options: RequestOptions } | Promise<{ url: string; options: RequestOptions }>;

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor<T = any> = (
  response: T
) => T | Promise<T>;

/**
 * 错误拦截器类型
 */
export type ErrorInterceptor = (
  error: ApiError
) => void | Promise<void>;

/**
 * 拦截器管理器
 */
export class InterceptorManager {
  private static requestInterceptors: RequestInterceptor[] = [];
  private static responseInterceptors: ResponseInterceptor[] = [];
  private static errorInterceptors: ErrorInterceptor[] = [];

  /**
   * 添加请求拦截器
   * @param interceptor - 拦截器函数
   */
  static addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 添加响应拦截器
   * @param interceptor - 拦截器函数
   */
  static addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 添加错误拦截器
   * @param interceptor - 拦截器函数
   */
  static addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * 执行请求拦截器
   */
  static async runRequestInterceptors(
    url: string,
    options: RequestOptions
  ): Promise<{ url: string; options: RequestOptions }> {
    let result = { url, options };
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result.url, result.options);
    }
    return result;
  }

  /**
   * 执行响应拦截器
   */
  static async runResponseInterceptors<T>(response: T): Promise<T> {
    let result = response;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result);
    }
    return result;
  }

  /**
   * 执行错误拦截器
   */
  static async runErrorInterceptors(error: ApiError): Promise<void> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error);
    }
  }
}

// 导出默认的 HTTP 客户端实例
export default HttpClient;
