import React, { useCallback, useEffect, useState } from 'react';
import { AIService, APIProviderService } from '../services';
import '../styles/app.css';
import Toast from './Toast';

/**
 * AI生成组件的Props接口
 */
export interface AICreatingProps {
    /** 是否显示组件 */
    visible: boolean;
    /** 关闭组件的回调 */
    onClose: () => void;
    /** 组件标题（如：任务目标、AI的角色等） */
    title: string;
    /** 提示词模板内容 */
    promptTemplate: string;
    /** 替换占位符的数据 */
    placeholders: Record<string, string>;
    /** 生成成功的回调，返回生成的内容 */
    onSuccess: (content: string) => void;
    /** 是否显示高级设置 */
    showAdvancedSettings?: boolean;
}

/**
 * AI生成状态
 */
type GenerationStatus = 'idle' | 'thinking' | 'generating' | 'success' | 'error';

/**
 * AICreating 组件
 * 负责调用大模型API生成内容，支持流式响应
 * 
 * @component
 */
const AICreating: React.FC<AICreatingProps> = ({
    visible,
    onClose,
    title,
    promptTemplate,
    placeholders,
    onSuccess,
    showAdvancedSettings = false,
}) => {
    // 生成状态
    const [status, setStatus] = useState<GenerationStatus>('idle');

    // 生成的内容
    const [generatedContent, setGeneratedContent] = useState('');

    // 错误信息
    const [errorMessage, setErrorMessage] = useState('');

    // Toast状态
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // 选中的API Provider ID
    const [selectedProviderId, setSelectedProviderId] = useState<number | undefined>();

    // 生成参数
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(2000);

    // 是否显示高级设置面板
    const [showSettings, setShowSettings] = useState(false);

    /**
     * 显示Toast提示
     */
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ message, type });
    };

    /**
     * 替换提示词模板中的占位符
     */
    const replacePlaceholders = (template: string, data: Record<string, string>): string => {
        let result = template;
        Object.entries(data).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            result = result.replace(new RegExp(placeholder, 'g'), value || '');
        });
        return result;
    };

    /**
     * 调用大模型API生成内容
     */
    const generateContent = useCallback(async () => {
        try {
            setStatus('thinking');
            setGeneratedContent('');
            setErrorMessage('');

            console.log('AICreating received props:', {
                title,
                promptTemplate: promptTemplate ? promptTemplate.substring(0, 100) + '...' : 'EMPTY',
                placeholders
            });

            // 1. 验证提示词模板是否存在
            if (!promptTemplate || promptTemplate.trim() === '') {
                throw new Error('提示词模板未加载，请稍后重试');
            }

            // 2. 验证提示词模板是否为HTML内容
            if (promptTemplate.trim().startsWith('<!DOCTYPE html') || promptTemplate.trim().startsWith('<html')) {
                throw new Error('提示词模板加载错误，请检查模板文件');
            }

            // 3. 获取可用的API配置
            let apiProviderId = selectedProviderId;

            if (!apiProviderId) {
                const apiConfigs = await APIProviderService.getEnabled();

                if (!apiConfigs || apiConfigs.length === 0) {
                    throw new Error('未找到可用的API配置，请先在API配置页面添加并启用至少一个Provider');
                }

                apiProviderId = apiConfigs[0].id;
                setSelectedProviderId(apiProviderId);
            }

            // 4. 替换提示词中的占位符
            const finalPrompt = replacePlaceholders(promptTemplate, placeholders);

            console.log('Placeholders replacement result:', {
                originalTemplate: promptTemplate.substring(0, 200),
                finalPrompt: finalPrompt.substring(0, 200)
            });

            console.log('使用API Provider ID:', apiProviderId);
            console.log('生成参数:', { temperature, maxTokens });
            // 确保记录完整的最终提示词，而不仅仅是截断的版本
            console.log('最终提示词:', finalPrompt);

            setStatus('generating');

            // 5. 调用后端统一生成接口
            const result = await AIService.generateViaBackend(
                apiProviderId,
                finalPrompt,
                (chunk: string) => {
                    setGeneratedContent(prev => prev + chunk);
                },
                temperature,
                maxTokens
            );

            if (!result.success) {
                throw new Error(result.error || 'API调用失败');
            }

            setStatus('success');

        } catch (error: any) {
            console.error('AI生成失败:', error);
            setStatus('error');
            setErrorMessage(error.message || '生成失败，请重试');
            showToast(error.message || '生成失败，请重试', 'error');
        }
    }, [promptTemplate, placeholders, title]);

    /**
     * 继续生成
     */
    const handleRegenerate = () => {
        generateContent();
    };

    /**
     * 确定 - 将结果返回给父组件
     */
    const handleConfirm = () => {
        if (generatedContent.trim()) {
            onSuccess(generatedContent);
            onClose();
        } else {
            showToast('生成的内容为空，请先生成内容', 'warning');
        }
    };

    /**
     * 取消
     */
    const handleCancel = () => {
        onClose();
    };

    /**
     * 组件显示时自动开始生成
     */
    useEffect(() => {
        if (visible) {
            generateContent();
        }
    }, [visible, generateContent]);

    /**
     * 重置状态
     */
    useEffect(() => {
        if (!visible) {
            setStatus('idle');
            setGeneratedContent('');
            setErrorMessage('');
            setShowSettings(false);
        }
    }, [visible]);

    if (!visible) {
        return null;
    }

    return (
        <>
            {/* Toast 提示 */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* 全屏模态框 */}
            <div className="fullscreen-modal">
                <div className="fullscreen-content">
                    {/* 头部 */}
                    <div className="fullscreen-header">
                        <h3>{title} - AI生成</h3>
                        <div className="header-actions">
                            {showAdvancedSettings && (
                                <button
                                    className="btn btn-text"
                                    onClick={() => setShowSettings(!showSettings)}
                                >
                                    ⚙️ {showSettings ? '隐藏设置' : '高级设置'}
                                </button>
                            )}
                            <button className="close-button" onClick={handleCancel}>×</button>
                        </div>
                    </div>

                    {/* 高级设置面板 */}
                    {showAdvancedSettings && showSettings && (
                        <div className="ai-settings-panel">
                            <div className="settings-row">
                                <div className="setting-item">
                                    <label>
                                        Temperature: {temperature}
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={temperature}
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            disabled={status === 'generating'}
                                        />
                                    </label>
                                    <span className="setting-hint">控制输出的随机性（0=确定性，2=创造性）</span>
                                </div>
                                <div className="setting-item">
                                    <label>
                                        Max Tokens: {maxTokens}
                                        <input
                                            type="range"
                                            min="100"
                                            max="4000"
                                            step="100"
                                            value={maxTokens}
                                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                            disabled={status === 'generating'}
                                        />
                                    </label>
                                    <span className="setting-hint">最大生成长度</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 内容区域 */}
                    <div className="ai-creating-body">
                        {/* Thinking状态 */}
                        {status === 'thinking' && (
                            <div className="ai-thinking">
                                <div className="thinking-spinner"></div>
                                <p>正在准备...</p>
                            </div>
                        )}

                        {/* 生成中状态 */}
                        {status === 'generating' && (
                            <div className="ai-generating">
                                <div className="generating-indicator">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                                <p>AI正在生成内容...</p>
                            </div>
                        )}

                        {/* 显示生成的内容 */}
                        {(status === 'generating' || status === 'success') && generatedContent && (
                            <div className="ai-content">
                                <textarea
                                    className="fullscreen-textarea"
                                    value={generatedContent}
                                    onChange={(e) => setGeneratedContent(e.target.value)}
                                    placeholder="AI生成的内容将显示在这里..."
                                    readOnly={status === 'generating'}
                                />
                            </div>
                        )}

                        {/* 错误状态 */}
                        {status === 'error' && (
                            <div className="ai-error">
                                <p className="error-icon">⚠️</p>
                                <p className="error-text">{errorMessage}</p>
                            </div>
                        )}
                    </div>

                    {/* 底部按钮 */}
                    <div className="fullscreen-footer">
                        <div className="footer-left">
                            <span className="char-count">{generatedContent.length} 字符</span>
                        </div>
                        <div className="footer-right">
                            {status === 'success' && (
                                <button className="btn btn-secondary" onClick={handleRegenerate}>
                                    继续生成
                                </button>
                            )}
                            {status === 'error' && (
                                <button className="btn btn-secondary" onClick={handleRegenerate}>
                                    重试
                                </button>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirm}
                                disabled={status === 'thinking' || status === 'generating' || !generatedContent.trim()}
                            >
                                确定
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AICreating;
