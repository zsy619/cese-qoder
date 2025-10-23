/**
 * 用户操作相关接口
 * @description 提供用户注册、登录、信息管理等功能的API接口
 */

import HttpClient, { TokenManager } from './auth';
import { Storage } from './common';

/**
 * 用户信息接口
 */
export interface UserInfo {
  /** 用户ID */
  id: number;
  /** 手机号码 */
  mobile: string;
  /** 邮箱地址 */
  email?: string;
  /** 用户类型：normal-普通用户，admin-管理员，vip-VIP用户 */
  user_type?: string;
  /** 用户状态：1-正常，0-禁用，2-待审核 */
  user_status?: number;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
}

/**
 * 用户注册请求参数
 */
export interface RegisterRequest {
  /** 手机号码，11位数字，格式 1[3-9]\d{9} */
  mobile: string;
  /** 密码，8-16位，必须包含大小写字母、数字和特殊字符 */
  password: string;
}

/**
 * 用户注册响应
 */
export interface RegisterResponse {
  /** 用户信息 */
  user: UserInfo;
}

/**
 * 用户登录请求参数
 */
export interface LoginRequest {
  /** 手机号码 */
  mobile: string;
  /** 密码 */
  password: string;
}

/**
 * 用户登录响应
 */
export interface LoginResponse {
  /** JWT Token */
  token: string;
  /** 用户信息 */
  user: UserInfo;
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordRequest {
  /** 手机号码（必须是当前登录用户） */
  mobile: string;
  /** 旧密码 */
  old_password: string;
  /** 新密码，8-16位，必须包含大小写字母、数字和特殊字符 */
  new_password: string;
}

/**
 * 用户信息存储键名
 */
const USER_INFO_KEY = 'user_info';

/**
 * 用户服务类
 * @description 提供用户相关的所有API操作和状态管理
 */
export class UserService {
  /**
   * 用户注册
   * @param data - 注册请求参数
   * @returns Promise<UserInfo> 注册成功返回用户信息
   * @throws {ApiError} 注册失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const user = await UserService.register({
   *     mobile: '13800138000',
   *     password: 'Test@123456'
   *   });
   *   console.log('注册成功:', user);
   * } catch (error) {
   *   console.error('注册失败:', error.message);
   * }
   * ```
   */
  static async register(data: RegisterRequest): Promise<UserInfo> {
    const response = await HttpClient.post<UserInfo>(
      '/user/register',
      data,
      {
        requireAuth: false, // 注册不需要认证
        showLoading: true,
        showError: true,
      }
    );
    return response;
  }

  /**
   * 用户登录
   * @param data - 登录请求参数
   * @returns Promise<LoginResponse> 登录成功返回Token和用户信息
   * @throws {ApiError} 登录失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const result = await UserService.login({
   *     mobile: '13800138000',
   *     password: 'Test@123456'
   *   });
   *   console.log('登录成功，Token:', result.token);
   *   console.log('用户信息:', result.user);
   * } catch (error) {
   *   console.error('登录失败:', error.message);
   * }
   * ```
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await HttpClient.post<LoginResponse>(
      '/user/login',
      data,
      {
        requireAuth: false, // 登录不需要认证
        showLoading: true,
        showError: true,
      }
    );

    // 保存 Token 和用户信息到本地存储
    if (response.token) {
      TokenManager.setToken(response.token);
    }
    if (response.user) {
      this.saveUserInfo(response.user);
    }

    return response;
  }

  /**
   * 用户登出
   * @description 清除本地存储的Token和用户信息
   * 
   * @example
   * ```typescript
   * UserService.logout();
   * console.log('已登出');
   * ```
   */
  static logout(): void {
    TokenManager.clearAuth();
    this.clearUserInfo();
    // 触发登出事件
    window.dispatchEvent(new CustomEvent('user:logout'));
  }

  /**
   * 修改密码
   * @param data - 修改密码请求参数
   * @returns Promise<void> 修改成功
   * @throws {ApiError} 修改失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   await UserService.changePassword({
   *     mobile: '13800138000',
   *     old_password: 'OldPass@123',
   *     new_password: 'NewPass@456'
   *   });
   *   console.log('密码修改成功');
   *   // 通常需要重新登录
   *   UserService.logout();
   * } catch (error) {
   *   console.error('密码修改失败:', error.message);
   * }
   * ```
   */
  static async changePassword(data: ChangePasswordRequest): Promise<void> {
    await HttpClient.post<void>(
      '/user/change-password',
      data,
      {
        requireAuth: true, // 需要认证
        showLoading: true,
        showError: true,
      }
    );

    // 修改密码成功后，建议用户重新登录
    this.logout();
  }

  /**
   * 获取当前用户信息
   * @returns Promise<UserInfo> 用户信息
   * @throws {ApiError} 获取失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const userInfo = await UserService.getUserInfo();
   *   console.log('用户信息:', userInfo);
   * } catch (error) {
   *   console.error('获取用户信息失败:', error.message);
   * }
   * ```
   */
  static async getUserInfo(): Promise<UserInfo> {
    const userInfo = await HttpClient.get<UserInfo>(
      '/user/info',
      undefined,
      {
        requireAuth: true, // 需要认证
        showLoading: false,
        showError: true,
      }
    );

    // 更新本地存储的用户信息
    this.saveUserInfo(userInfo);

    return userInfo;
  }

  /**
   * 刷新用户信息
   * @description 从服务器重新获取用户信息并更新本地缓存
   * @returns Promise<UserInfo> 最新的用户信息
   * 
   * @example
   * ```typescript
   * const latestUserInfo = await UserService.refreshUserInfo();
   * ```
   */
  static async refreshUserInfo(): Promise<UserInfo> {
    return this.getUserInfo();
  }

  /**
   * 保存用户信息到本地存储
   * @param userInfo - 用户信息
   * 
   * @example
   * ```typescript
   * UserService.saveUserInfo(userInfo);
   * ```
   */
  static saveUserInfo(userInfo: UserInfo): void {
    Storage.set(USER_INFO_KEY, userInfo);
    // 触发用户信息更新事件
    window.dispatchEvent(
      new CustomEvent('user:info-updated', { detail: userInfo })
    );
  }

  /**
   * 从本地存储获取用户信息
   * @returns UserInfo | null 用户信息，不存在返回 null
   * 
   * @example
   * ```typescript
   * const userInfo = UserService.getLocalUserInfo();
   * if (userInfo) {
   *   console.log('当前用户:', userInfo.mobile);
   * } else {
   *   console.log('未登录');
   * }
   * ```
   */
  static getLocalUserInfo(): UserInfo | null {
    return Storage.get<UserInfo>(USER_INFO_KEY);
  }

  /**
   * 清除本地存储的用户信息
   * 
   * @example
   * ```typescript
   * UserService.clearUserInfo();
   * ```
   */
  static clearUserInfo(): void {
    Storage.remove(USER_INFO_KEY);
  }

  /**
   * 判断用户是否已登录
   * @returns boolean 是否已登录
   * 
   * @example
   * ```typescript
   * if (UserService.isLoggedIn()) {
   *   console.log('用户已登录');
   * } else {
   *   console.log('请先登录');
   * }
   * ```
   */
  static isLoggedIn(): boolean {
    return TokenManager.isLoggedIn() && !!this.getLocalUserInfo();
  }

  /**
   * 获取当前用户的手机号
   * @returns string | null 手机号，未登录返回 null
   * 
   * @example
   * ```typescript
   * const mobile = UserService.getCurrentMobile();
   * ```
   */
  static getCurrentMobile(): string | null {
    const userInfo = this.getLocalUserInfo();
    return userInfo?.mobile || null;
  }

  /**
   * 获取当前用户的ID
   * @returns number | null 用户ID，未登录返回 null
   * 
   * @example
   * ```typescript
   * const userId = UserService.getCurrentUserId();
   * ```
   */
  static getCurrentUserId(): number | null {
    const userInfo = this.getLocalUserInfo();
    return userInfo?.id || null;
  }

  /**
   * 判断当前用户是否为管理员
   * @returns boolean 是否为管理员
   * 
   * @example
   * ```typescript
   * if (UserService.isAdmin()) {
   *   console.log('管理员权限');
   * }
   * ```
   */
  static isAdmin(): boolean {
    const userInfo = this.getLocalUserInfo();
    return userInfo?.user_type === 'admin';
  }

  /**
   * 判断当前用户是否为VIP用户
   * @returns boolean 是否为VIP用户
   * 
   * @example
   * ```typescript
   * if (UserService.isVip()) {
   *   console.log('VIP用户');
   * }
   * ```
   */
  static isVip(): boolean {
    const userInfo = this.getLocalUserInfo();
    return userInfo?.user_type === 'vip';
  }

  /**
   * 判断当前用户状态是否正常
   * @returns boolean 用户状态是否正常（1-正常）
   * 
   * @example
   * ```typescript
   * if (!UserService.isUserActive()) {
   *   console.log('账号已被禁用或待审核');
   * }
   * ```
   */
  static isUserActive(): boolean {
    const userInfo = this.getLocalUserInfo();
    return userInfo?.user_status === 1;
  }
}

/**
 * 导出默认的用户服务实例
 */
export default UserService;
