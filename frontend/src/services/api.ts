/**
 * API服务
 */

import { TemplateData } from '../utils/validation';

const API_BASE_URL = 'http://localhost:8080/api';

// API响应接口
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

// 模板响应接口
export interface TemplateResponse extends TemplateData {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 获取所有模板
 */
export const getTemplates = async (): Promise<TemplateResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates`);
    if (!response.ok) {
      throw new Error('获取模板失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取模板错误:', error);
    throw error;
  }
};

/**
 * 根据ID获取模板
 */
export const getTemplateById = async (id: string): Promise<TemplateResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`);
    if (!response.ok) {
      throw new Error('获取模板失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取模板错误:', error);
    throw error;
  }
};

/**
 * 创建新模板
 */
export const createTemplate = async (templateData: TemplateData): Promise<TemplateResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) {
      throw new Error('创建模板失败');
    }
    return await response.json();
  } catch (error) {
    console.error('创建模板错误:', error);
    throw error;
  }
};

/**
 * 更新模板
 */
export const updateTemplate = async (id: string, templateData: TemplateData): Promise<TemplateResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });
    if (!response.ok) {
      throw new Error('更新模板失败');
    }
    return await response.json();
  } catch (error) {
    console.error('更新模板错误:', error);
    throw error;
  }
};

/**
 * 删除模板
 */
export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除模板失败');
    }
    return true;
  } catch (error) {
    console.error('删除模板错误:', error);
    throw error;
  }
};

/**
 * 导出模板为Markdown
 */
export const exportTemplateAsMarkdown = async (id: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}/export/markdown`);
    if (!response.ok) {
      throw new Error('导出Markdown失败');
    }
    return await response.text();
  } catch (error) {
    console.error('导出Markdown错误:', error);
    throw error;
  }
};

/**
 * 导出模板为JSON
 */
export const exportTemplateAsJSON = async (id: string): Promise<TemplateResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/templates/${id}/export/json`);
    if (!response.ok) {
      throw new Error('导出JSON失败');
    }
    return await response.json();
  } catch (error) {
    console.error('导出JSON错误:', error);
    throw error;
  }
};
