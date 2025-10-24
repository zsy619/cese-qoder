/**
 * AI生成服务
 * 负责调用各种大模型API生成内容
 */

import { APIProvider } from './api_provider';
import { getApiUrl } from './common';

/**
 * AI生成请求参数
 */
export interface AIGenerateRequest {
  /** API Provider配置 */
  provider: APIProvider;
  /** API密钥（原始完整的，由于后端返回的是脱敏后的，需要调用方传入） */
  apiKey: string;
  /** 提示词内容 */
  prompt: string;
  /** 流式响应回调 */
  onStream?: (chunk: string) => void;
  /** 温度参数 0-2，默认0.7 */
  temperature?: number;
  /** 最大token数，默认2000 */
  maxTokens?: number;
}

/**
 * 后端统一生成接口请求参数
 */
export interface BackendGenerateRequest {
  /** API Provider ID */
  provider_id: number;
  /** 提示词内容 */
  prompt: string;
  /** 温度参数 0-2，默认0.7 */
  temperature?: number;
  /** 最大token数，默认2000 */
  max_tokens?: number;
  /** 是否流式响应，默认true */
  stream?: boolean;
  /** 可选：覆盖Provider配置的模型 */
  model?: string;
}

/**
 * AI生成响应
 */
export interface AIGenerateResponse {
  /** 生成的完整内容 */
  content: string;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * AI生成服务类
 */
export class AIService {
  /**
   * 生成内容
   * @param request 生成请求参数
   * @returns Promise<AIGenerateResponse>
   */
  static async generate(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    const { provider, apiKey, prompt, onStream, temperature = 0.7, maxTokens = 2000 } = request;

    try {
      // 根据API类型选择不同的调用方式
      if (provider.api_kind === 'Ollama') {
        return await this.generateWithOllama(provider, apiKey, prompt, onStream, temperature, maxTokens);
      } else {
        // 其他类型都使用 OpenAI 兼容格式
        return await this.generateWithOpenAI(provider, apiKey, prompt, onStream, temperature, maxTokens);
      }
    } catch (error: any) {
      console.error('AI生成失败:', error);
      return {
        content: '',
        success: false,
        error: error.message || '生成失败，请重试',
      };
    }
  }

  /**
   * 使用 OpenAI 兼容格式生成内容
   */
  private static async generateWithOpenAI(
    provider: APIProvider,
    apiKey: string,
    prompt: string,
    onStream?: (chunk: string) => void,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIGenerateResponse> {
    const url = `${provider.api_url}/chat/completions`;
    
    const requestBody = {
      model: provider.api_model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      stream: !!onStream, // 如果有 onStream 回调，则使用流式响应
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API调用失败: ${response.status}`);
      }

      // 流式响应
      if (onStream && response.body) {
        return await this.handleStreamResponse(response, onStream);
      }
      
      // 非流式响应
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      return {
        content,
        success: true,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * 使用 Ollama 格式生成内容
   */
  private static async generateWithOllama(
    provider: APIProvider,
    apiKey: string,
    prompt: string,
    onStream?: (chunk: string) => void,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIGenerateResponse> {
    // Ollama 也支持 OpenAI 兼容格式
    // 如果 api_url 包含 /v1，直接使用 OpenAI 格式
    if (provider.api_url.includes('/v1')) {
      return await this.generateWithOpenAI(provider, apiKey, prompt, onStream, temperature, maxTokens);
    }

    // 使用 Ollama 原生格式
    const url = `${provider.api_url}/api/generate`;
    
    const requestBody = {
      model: provider.api_model,
      prompt,
      temperature,
      stream: !!onStream,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ollama API调用失败: ${response.status}`);
      }

      // 流式响应
      if (onStream && response.body) {
        return await this.handleOllamaStreamResponse(response, onStream);
      }
      
      // 非流式响应
      const data = await response.json();
      const content = data.response || '';
      
      return {
        content,
        success: true,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * 处理 OpenAI 格式的流式响应
   */
  private static async handleStreamResponse(
    response: Response,
    onStream: (chunk: string) => void
  ): Promise<AIGenerateResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content || '';
              
              if (content) {
                fullContent += content;
                onStream(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
      
      return {
        content: fullContent,
        success: true,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * 处理 Ollama 原生格式的流式响应
   */
  private static async handleOllamaStreamResponse(
    response: Response,
    onStream: (chunk: string) => void
  ): Promise<AIGenerateResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            const content = json.response || '';
            
            if (content) {
              fullContent += content;
              onStream(content);
            }
            
            if (json.done) {
              break;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
      
      return {
        content: fullContent,
        success: true,
      };
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * 使用后端统一接口生成内容（推荐使用）
   * @param request 生成请求参数
   * @returns Promise<AIGenerateResponse>
   */
  static async generateViaBackend(
    providerId: number,
    prompt: string,
    onStream?: (chunk: string) => void,
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<AIGenerateResponse> {
    try {
      // 构建请求URL，使用全局配置
      const url = getApiUrl('generate');
      
      // 获取Token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('未登录，请先登录');
      }

      // 构建请求体
      const requestBody: BackendGenerateRequest = {
        provider_id: providerId,
        prompt,
        temperature,
        max_tokens: maxTokens,
        stream: !!onStream,
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API调用失败: ${response.status}`);
      }

      // 流式响应
      if (onStream && response.body) {
        return await this.handleBackendStreamResponse(response, onStream);
      }
      
      // 非流式响应
      const data = await response.json();
      const content = data.data?.content || '';
      // 清理HTML标签，防止XSS攻击和显示问题
      const cleanContent = content.replace(/<[^>]*>/g, '');
      
      return {
        content: cleanContent,
        success: true,
      };
    } catch (error: any) {
      console.error('AI生成失败:', error);
      return {
        content: '',
        success: false,
        error: error.message || '生成失败，请重试',
      };
    }
  }

  /**
   * 处理后端的流式响应
   */
  private static async handleBackendStreamResponse(
    response: Response,
    onStream: (chunk: string) => void
  ): Promise<AIGenerateResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const json = JSON.parse(data);
              
              // 检查是否有错误
              if (json.error) {
                throw new Error(json.error);
              }
              
              // 检查是否完成
              if (json.done) {
                break;
              }
              
              // 提取内容并清理HTML标签
              const content = json.content || '';
              // 清理HTML标签，防止XSS攻击和显示问题
              const cleanContent = content.replace(/<[^>]*>/g, '');
              if (cleanContent) {
                fullContent += cleanContent;
                onStream(cleanContent);
              }
            } catch (e) {
              // 忽略解析错误
              console.warn('Failed to parse SSE data:', data, e);
            }
          }
        }
      }
      
      return {
        content: fullContent,
        success: true,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
