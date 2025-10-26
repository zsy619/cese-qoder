import React, { useCallback, useEffect, useState } from 'react';
import { AIService, APIProviderService } from '../services';
import '../styles/app.css';
import { ElementType, ELEMENT_NAMES, generatePlaceholders, getPromptTemplate } from '../utils/promptTemplates';
import Toast from './Toast';

/**
 * 批量AI生成组件的Props接口
 */
export interface BatchAIGeneratingProps {
    /** 是否显示组件 */
    visible: boolean;
    /** 关闭组件的回调 */
    onClose: () => void;
    /** 主题 */
    topic: string;
    /** 生成成功的回调，返回生成的所有内容 */
    onSuccess: (results: Record<string, string>) => void;
}

/**
 * 单个要素的生成状态
 */
interface ElementStatus {
    status: 'pending' | 'generating' | 'success' | 'error';
    content: string;
    error?: string;
}

/**
 * BatchAIGenerating 组件
 * 负责批量生成所有六要素内容
 * 
 * @component
 */
const BatchAIGenerating: React.FC<BatchAIGeneratingProps> = ({
    visible,
    onClose,
    topic,
    onSuccess,
}) => {
    // 各要素的生成状态
    const [elementStatuses, setElementStatuses] = useState<Record<ElementType, ElementStatus>>({
        task: { status: 'pending', content: '' },
        ai_role: { status: 'pending', content: '' },
        my_role: { status: 'pending', content: '' },
        key_info: { status: 'pending', content: '' },
        behavior: { status: 'pending', content: '' },
        delivery: { status: 'pending', content: '' },
    });

    // Toast状态
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

    // 当前正在生成的要素
    const [currentElement, setCurrentElement] = useState<ElementType | null>(null);

    // 是否正在生成
    const [isGenerating, setIsGenerating] = useState(false);

    /**
     * 显示Toast提示
     */
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setToast({ message, type });
    };

    /**
     * 更新单个要素的状态
     */
    const updateElementStatus = (element: ElementType, update: Partial<ElementStatus>) => {
        setElementStatuses(prev => ({
            ...prev,
            [element]: { ...prev[element], ...update }
        }));
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
     * 生成单个要素
     */
    const generateElement = async (
        elementType: ElementType,
        apiProviderId: number,
        currentResults: Record<string, string>
    ): Promise<string> => {
        try {
            // 获取提示词模板
            const template = await getPromptTemplate(elementType);
            if (!template) {
                throw new Error('提示词模板未加载');
            }

            // 生成占位符数据
            const placeholders = generatePlaceholders(elementType, {
                topic,
                task: currentResults.task,
                ai_role: currentResults.ai_role,
                my_role: currentResults.my_role,
                key_info: currentResults.key_info,
                behavior: currentResults.behavior,
                delivery: currentResults.delivery,
            });

            // 替换占位符
            const finalPrompt = replacePlaceholders(template, placeholders);

            console.log(`生成 ${ELEMENT_NAMES[elementType]}，提示词:`, finalPrompt);

            // 调用AI生成
            let content = '';
            const result = await AIService.generateViaBackend(
                apiProviderId,
                finalPrompt,
                (chunk: string) => {
                    content += chunk;
                    updateElementStatus(elementType, { content });
                },
                0.7,
                2000
            );

            if (!result.success) {
                throw new Error(result.error || 'API调用失败');
            }

            return content;
        } catch (error: any) {
            console.error(`生成 ${ELEMENT_NAMES[elementType]} 失败:`, error);
            throw error;
        }
    };

    /**
     * 批量生成所有要素
     */
    const batchGenerate = useCallback(async () => {
        try {
            setIsGenerating(true);

            // 验证主题
            if (!topic || topic.trim() === '') {
                throw new Error('请先输入主题');
            }

            // 获取可用的API配置
            const apiConfigs = await APIProviderService.getEnabled();
            if (!apiConfigs || apiConfigs.length === 0) {
                throw new Error('未找到可用的API配置，请先在API配置页面添加并启用至少一个Provider');
            }

            const apiProviderId = apiConfigs[0].id;

            // 按照依赖顺序生成各要素
            const elementOrder: ElementType[] = ['task', 'ai_role', 'my_role', 'key_info', 'behavior', 'delivery'];
            const results: Record<string, string> = {};

            for (const elementType of elementOrder) {
                setCurrentElement(elementType);
                updateElementStatus(elementType, { status: 'generating' });

                try {
                    const content = await generateElement(elementType, apiProviderId, results);
                    results[elementType] = content;
                    updateElementStatus(elementType, { status: 'success', content });
                } catch (error: any) {
                    updateElementStatus(elementType, {
                        status: 'error',
                        error: error.message || '生成失败'
                    });
                    throw new Error(`生成 ${ELEMENT_NAMES[elementType]} 失败: ${error.message}`);
                }
            }

            setCurrentElement(null);
            setIsGenerating(false);
            showToast('所有要素生成完成！', 'success');

        } catch (error: any) {
            console.error('批量生成失败:', error);
            setIsGenerating(false);
            setCurrentElement(null);
            showToast(error.message || '批量生成失败', 'error');
        }
    }, [topic]);

    /**
     * 确定 - 将结果返回给父组件
     */
    const handleConfirm = () => {
        const results: Record<string, string> = {};
        Object.entries(elementStatuses).forEach(([key, status]) => {
            if (status.status === 'success' && status.content) {
                results[key] = status.content;
            }
        });

        if (Object.keys(results).length === 0) {
            showToast('没有成功生成的内容', 'warning');
            return;
        }

        onSuccess(results);
        onClose();
    };

    /**
     * 取消
     */
    const handleCancel = () => {
        if (isGenerating) {
            if (!window.confirm('正在生成中，确定要取消吗？')) {
                return;
            }
        }
        onClose();
    };

    /**
     * 组件显示时自动开始生成
     */
    useEffect(() => {
        if (visible) {
            batchGenerate();
        }
    }, [visible, batchGenerate]);

    if (!visible) {
        return null;
    }

    // 计算进度
    const totalElements = 6;
    const completedElements = Object.values(elementStatuses).filter(
        s => s.status === 'success' || s.status === 'error'
    ).length;
    const progress = Math.round((completedElements / totalElements) * 100);

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
                        <h3>批量生成六要素</h3>
                        <button className="close-button" onClick={handleCancel}>×</button>
                    </div>

                    {/* 内容区域 */}
                    <div className="ai-creating-body">
                        {/* 进度条 */}
                        <div className="batch-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="progress-text">{progress}% ({completedElements}/{totalElements})</div>
                        </div>

                        {/* 各要素的生成状态 */}
                        <div className="batch-elements">
                            {(['task', 'ai_role', 'my_role', 'key_info', 'behavior', 'delivery'] as ElementType[]).map(elementType => {
                                const status = elementStatuses[elementType];
                                const isCurrent = currentElement === elementType;

                                return (
                                    <div key={elementType} className={`batch-element ${status.status} ${isCurrent ? 'current' : ''}`}>
                                        <div className="element-header">
                                            <span className="element-name">{ELEMENT_NAMES[elementType]}</span>
                                            <span className="element-status">
                                                {status.status === 'pending' && '⏳ 等待中'}
                                                {status.status === 'generating' && '🔄 生成中...'}
                                                {status.status === 'success' && '✅ 完成'}
                                                {status.status === 'error' && '❌ 失败'}
                                            </span>
                                        </div>
                                        {status.content && (
                                            <div className="element-content">
                                                <textarea
                                                    value={status.content}
                                                    readOnly
                                                    rows={3}
                                                />
                                            </div>
                                        )}
                                        {status.error && (
                                            <div className="element-error">{status.error}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 底部按钮 */}
                    <div className="fullscreen-footer">
                        <div className="footer-left">
                            <span className="char-count">
                                已完成 {completedElements} / {totalElements} 个要素
                            </span>
                        </div>
                        <div className="footer-right">
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirm}
                                disabled={isGenerating || completedElements === 0}
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

export default BatchAIGenerating;
