/**
 * 通用定义和公共方法
 * @description 提供全局统一的类型定义、常量和通用工具方法
 */

/**
 * API 基础配置
 */
export const API_CONFIG = {
    BASE_URL: 'http://localhost:8080',
    // BASE_URL: 'https://api.sece.hn24365.com',
    API_PREFIX: '/api/v1',
    TIMEOUT: 30000, // 30秒超时
} as const;

/**
 * 获取完整的API路径
 * @param path - API路径
 * @returns 完整的API URL
 */
export const getApiUrl = (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${cleanPath}`;
};

/**
 * 统一的API响应格式
 * @template T - 响应数据类型
 */
export interface ApiResponse<T = any> {
    /** 状态码：0 表示成功，非 0 表示失败 */
    code: number;
    /** 响应消息 */
    message: string;
    /** 响应数据 */
    data: T | null;
}

/**
 * 分页响应数据格式
 * @template T - 列表项类型
 */
export interface PageResponse<T = any> {
    /** 数据列表 */
    list: T[];
    /** 总记录数 */
    total: number;
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    page_size: number;
}

/**
 * 分页查询参数
 */
export interface PageParams {
    /** 页码，默认 1 */
    page?: number;
    /** 每页数量，默认 15，最大 100 */
    page_size?: number;
}

/**
 * API 错误码枚举
 */
export enum ErrorCode {
    /** 成功 */
    SUCCESS = 0,
    /** 通用错误 */
    ERROR = 1,
    /** 参数错误 */
    INVALID_PARAMS = 400,
    /** 未认证 */
    UNAUTHORIZED = 401,
    /** 无权限 */
    FORBIDDEN = 403,
    /** 资源不存在 */
    NOT_FOUND = 404,
    /** 服务器内部错误 */
    SERVER_ERROR = 500,
    /** 数据库错误 */
    DATABASE_ERROR = 501,
    /** 手机号已存在 */
    PHONE_EXISTS = 1001,
    /** 手机号不存在 */
    PHONE_NOT_FOUND = 1002,
    /** 密码错误 */
    PASSWORD_ERROR = 1003,
    /** 密码强度不足 */
    PASSWORD_WEAK = 1004,
    /** 手机号格式错误 */
    PHONE_INVALID = 1005,
    /** Token 无效 */
    TOKEN_INVALID = 1006,
    /** Token 过期 */
    TOKEN_EXPIRED = 1007,
    /** 模板不存在 */
    TEMPLATE_NOT_FOUND = 2001,
    /** 无权操作该模板 */
    TEMPLATE_NO_AUTH = 2002,
}

/**
 * 错误码对应的中文提示信息
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    [ErrorCode.SUCCESS]: '操作成功',
    [ErrorCode.ERROR]: '操作失败',
    [ErrorCode.INVALID_PARAMS]: '参数错误',
    [ErrorCode.UNAUTHORIZED]: '未登录或登录已过期',
    [ErrorCode.FORBIDDEN]: '无权限访问',
    [ErrorCode.NOT_FOUND]: '资源不存在',
    [ErrorCode.SERVER_ERROR]: '服务器内部错误',
    [ErrorCode.DATABASE_ERROR]: '数据库错误',
    [ErrorCode.PHONE_EXISTS]: '手机号已存在',
    [ErrorCode.PHONE_NOT_FOUND]: '手机号不存在',
    [ErrorCode.PASSWORD_ERROR]: '密码错误',
    [ErrorCode.PASSWORD_WEAK]: '密码强度不足',
    [ErrorCode.PHONE_INVALID]: '手机号格式错误',
    [ErrorCode.TOKEN_INVALID]: 'Token 无效',
    [ErrorCode.TOKEN_EXPIRED]: 'Token 已过期',
    [ErrorCode.TEMPLATE_NOT_FOUND]: '模板不存在',
    [ErrorCode.TEMPLATE_NO_AUTH]: '无权操作该模板',
};

/**
 * 获取错误提示信息
 * @param code - 错误码
 * @param defaultMessage - 默认消息
 * @returns 错误提示信息
 */
export const getErrorMessage = (
    code: number,
    defaultMessage?: string
): string => {
    return (
        ERROR_MESSAGES[code as ErrorCode] ||
        defaultMessage ||
        ERROR_MESSAGES[ErrorCode.ERROR]
    );
};

/**
 * API 错误类
 */
export class ApiError extends Error {
    /** 错误码 */
    code: number;
    /** 原始响应数据 */
    response?: any;

    constructor(code: number, message: string, response?: any) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.response = response;
    }

    /**
     * 判断是否为认证错误
     */
    isAuthError(): boolean {
        return (
            this.code === ErrorCode.UNAUTHORIZED ||
            this.code === ErrorCode.TOKEN_INVALID ||
            this.code === ErrorCode.TOKEN_EXPIRED
        );
    }

    /**
     * 判断是否为权限错误
     */
    isForbiddenError(): boolean {
        return this.code === ErrorCode.FORBIDDEN;
    }

    /**
     * 判断是否为服务器错误
     */
    isServerError(): boolean {
        return this.code >= 500;
    }
}

/**
 * HTTP 请求方法枚举
 */
export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}

/**
 * HTTP 请求选项
 */
export interface RequestOptions extends RequestInit {
    /** 是否需要认证 */
    requireAuth?: boolean;
    /** 是否显示加载提示 */
    showLoading?: boolean;
    /** 是否自动处理错误提示 */
    showError?: boolean;
    /** 超时时间（毫秒） */
    timeout?: number;
}

/**
 * 构建查询字符串
 * @param params - 查询参数对象
 * @returns 查询字符串
 */
export const buildQueryString = (params?: Record<string, any>): string => {
    if (!params || Object.keys(params).length === 0) {
        return '';
    }

    const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    return queryParams ? `?${queryParams}` : '';
};

/**
 * 深度克隆对象
 * @param obj - 要克隆的对象
 * @returns 克隆后的对象
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as any;
    }

    if (obj instanceof Object) {
        const clonedObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    return obj;
};

/**
 * 格式化日期时间
 * @param date - 日期字符串或对象
 * @param format - 格式化模板
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
    date: string | Date,
    format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
        return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second);
};

/**
 * 节流函数
 * @param func - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    return (...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
};

/**
 * 防抖函数
 * @param func - 要执行的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

/**
 * 本地存储工具类
 */
export class Storage {
    /**
     * 设置存储项
     * @param key - 键名
     * @param value - 值
     */
    static set(key: string, value: any): void {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, stringValue);
        } catch (error) {
            console.error('Storage set error:', error);
        }
    }

    /**
     * 获取存储项
     * @param key - 键名
     * @param defaultValue - 默认值
     * @returns 存储的值
     */
    static get<T = any>(key: string, defaultValue?: T): T | null {
        try {
            const value = localStorage.getItem(key);
            if (value === null) {
                return defaultValue ?? null;
            }
            try {
                return JSON.parse(value);
            } catch {
                return value as any;
            }
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue ?? null;
        }
    }

    /**
     * 移除存储项
     * @param key - 键名
     */
    static remove(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }

    /**
     * 清空所有存储
     */
    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }
}
