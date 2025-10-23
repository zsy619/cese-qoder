/**
 * 模板管理API服务
 * @description 提供模板的增删改查、导出等功能的API接口
 */

import HttpClient from './auth';
import { PageParams, PageResponse } from './common';

/**
 * 模板数据接口
 */
export interface TemplateData {
  /** 主题 */
  topic: string;
  /** 任务目标 */
  task_objective?: string;
  /** AI的角色 */
  ai_role?: string;
  /** 我的角色 */
  my_role?: string;
  /** 关键信息 */
  key_information?: string;
  /** 行为规则 */
  behavior_rule?: string;
  /** 交付格式 */
  delivery_format?: string;
}

/**
 * 模板完整信息接口
 */
export interface Template extends TemplateData {
  /** 模板ID */
  id: number;
  /** 用户手机号 */
  mobile: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}

/**
 * 模板查询参数
 */
export interface TemplateQueryParams extends PageParams {
  /** 主题（模糊匹配） */
  topic?: string;
  /** 任务目标（模糊匹配） */
  task_objective?: string;
  /** AI角色（模糊匹配） */
  ai_role?: string;
  /** 我的角色（模糊匹配） */
  my_role?: string;
  /** 关键信息（模糊匹配） */
  key_information?: string;
  /** 行为规则（模糊匹配） */
  behavior_rule?: string;
  /** 交付格式（模糊匹配） */
  delivery_format?: string;
}

/**
 * 模板服务类
 * @description 提供模板相关的所有API操作
 */
export class TemplateService {
  /**
   * 创建新模板
   * @param data - 模板数据
   * @returns Promise<Template> 创建成功返回模板信息
   * @throws {ApiError} 创建失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const template = await TemplateService.create({
   *     topic: '写作助手',
   *     task_objective: '帮助用户生成高质量的文章内容',
   *     ai_role: '写作专家',
   *     my_role: '内容创作者',
   *     key_information: '需要创作的文章主题和目标读者',
   *     behavior_rule: '使用清晰的结构和生动的语言',
   *     delivery_format: 'Markdown格式'
   *   });
   *   console.log('模板创建成功:', template);
   * } catch (error) {
   *   console.error('创建失败:', error.message);
   * }
   * ```
   */
  static async create(data: TemplateData): Promise<Template> {
    return HttpClient.post<Template>('/template', data, {
      requireAuth: true,
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 查询模板列表
   * @param params - 查询参数
   * @returns Promise<PageResponse<Template>> 分页的模板列表
   * @throws {ApiError} 查询失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const result = await TemplateService.list({
   *     page: 1,
   *     page_size: 10,
   *     topic: '写作'
   *   });
   *   console.log('总数:', result.total);
   *   console.log('模板列表:', result.list);
   * } catch (error) {
   *   console.error('查询失败:', error.message);
   * }
   * ```
   */
  static async list(
    params?: TemplateQueryParams
  ): Promise<PageResponse<Template>> {
    return HttpClient.get<PageResponse<Template>>('/template', params, {
      requireAuth: true,
      showLoading: false,
      showError: true,
    });
  }

  /**
   * 根据ID获取模板详情
   * @param id - 模板ID
   * @returns Promise<Template> 模板详情
   * @throws {ApiError} 获取失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const template = await TemplateService.getById(1);
   *   console.log('模板详情:', template);
   * } catch (error) {
   *   console.error('获取失败:', error.message);
   * }
   * ```
   */
  static async getById(id: number): Promise<Template> {
    return HttpClient.get<Template>(`/template/${id}`, undefined, {
      requireAuth: true,
      showLoading: false,
      showError: true,
    });
  }

  /**
   * 更新模板
   * @param id - 模板ID
   * @param data - 要更新的数据
   * @returns Promise<Template> 更新后的模板信息
   * @throws {ApiError} 更新失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   const updated = await TemplateService.update(1, {
   *     topic: '写作助手（更新版）',
   *     task_objective: '帮助用户生成更高质量的文章内容'
   *   });
   *   console.log('更新成功:', updated);
   * } catch (error) {
   *   console.error('更新失败:', error.message);
   * }
   * ```
   */
  static async update(id: number, data: Partial<TemplateData>): Promise<Template> {
    return HttpClient.put<Template>(`/template/${id}`, data, {
      requireAuth: true,
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 删除模板
   * @param id - 模板ID
   * @returns Promise<void> 删除成功
   * @throws {ApiError} 删除失败抛出错误
   * 
   * @example
   * ```typescript
   * try {
   *   await TemplateService.delete(1);
   *   console.log('删除成功');
   * } catch (error) {
   *   console.error('删除失败:', error.message);
   * }
   * ```
   */
  static async delete(id: number): Promise<void> {
    return HttpClient.delete<void>(`/template/${id}`, {
      requireAuth: true,
      showLoading: true,
      showError: true,
    });
  }

  /**
   * 导出模板为Markdown格式
   * @param template - 模板数据
   * @returns string Markdown格式的文本
   * 
   * @example
   * ```typescript
   * const markdown = TemplateService.exportAsMarkdown(template);
   * console.log(markdown);
   * ```
   */
  static exportAsMarkdown(template: Template): string {
    const lines: string[] = [
      `# ${template.topic}`,
      '',
      '## 任务目标',
      template.task_objective || '',
      '',
      '## AI的角色',
      template.ai_role || '',
      '',
      '## 我的角色',
      template.my_role || '',
      '',
      '## 关键信息',
      template.key_information || '',
      '',
      '## 行为规则',
      template.behavior_rule || '',
      '',
      '## 交付格式',
      template.delivery_format || '',
    ];

    return lines.join('\n');
  }

  /**
   * 导出模板为JSON格式
   * @param template - 模板数据
   * @returns string JSON格式的字符串
   * 
   * @example
   * ```typescript
   * const json = TemplateService.exportAsJSON(template);
   * console.log(json);
   * ```
   */
  static exportAsJSON(template: Template): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * 导出模板为TXT格式
   * @param template - 模板数据
   * @returns string 纯文本格式
   * 
   * @example
   * ```typescript
   * const txt = TemplateService.exportAsTXT(template);
   * console.log(txt);
   * ```
   */
  static exportAsTXT(template: Template): string {
    const lines: string[] = [
      `主题: ${template.topic}`,
      '',
      `任务目标: ${template.task_objective || ''}`,
      `AI的角色: ${template.ai_role || ''}`,
      `我的角色: ${template.my_role || ''}`,
      `关键信息: ${template.key_information || ''}`,
      `行为规则: ${template.behavior_rule || ''}`,
      `交付格式: ${template.delivery_format || ''}`,
      '',
      `创建时间: ${template.created_at}`,
      `更新时间: ${template.updated_at}`,
    ];

    return lines.join('\n');
  }

  /**
   * 下载模板文件
   * @param template - 模板数据
   * @param format - 导出格式 'markdown' | 'json' | 'txt'
   * @param filename - 文件名（不含扩展名）
   * 
   * @example
   * ```typescript
   * TemplateService.download(template, 'markdown', '我的模板');
   * // 将下载名为 "我的模板.md" 的文件
   * ```
   */
  static download(
    template: Template,
    format: 'markdown' | 'json' | 'txt',
    filename?: string
  ): void {
    let content: string;
    let extension: string;

    switch (format) {
      case 'markdown':
        content = this.exportAsMarkdown(template);
        extension = 'md';
        break;
      case 'json':
        content = this.exportAsJSON(template);
        extension = 'json';
        break;
      case 'txt':
        content = this.exportAsTXT(template);
        extension = 'txt';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || template.topic}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * 导出默认的模板服务实例
 */
export default TemplateService;

// 保持向后兼容的导出
export const getTemplates = () => TemplateService.list();
export const getTemplateById = (id: number) => TemplateService.getById(id);
export const createTemplate = (data: TemplateData) => TemplateService.create(data);
export const updateTemplate = (id: number, data: Partial<TemplateData>) =>
  TemplateService.update(id, data);
export const deleteTemplate = (id: number) => TemplateService.delete(id);
export const exportTemplateAsMarkdown = (template: Template) =>
  TemplateService.exportAsMarkdown(template);
export const exportTemplateAsJSON = (template: Template) =>
  TemplateService.exportAsJSON(template);
