import React, { useEffect, useState } from 'react';
import { APIProvider, APIProviderService } from '../services';
import '../styles/app.css';

/**
 * AI Provider选择器组件的Props接口
 */
export interface AIProviderSelectorProps {
    /** 当前选中的Provider ID */
    selectedProviderId?: number;
    /** 选择变化的回调 */
    onChange: (providerId: number) => void;
    /** 是否显示标签 */
    showLabel?: boolean;
    /** 自定义类名 */
    className?: string;
}

/**
 * AIProviderSelector 组件
 * 用于选择AI Provider
 * 
 * @component
 */
const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({
    selectedProviderId,
    onChange,
    showLabel = true,
    className = '',
}) => {
    const [providers, setProviders] = useState<APIProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    /**
     * 加载可用的API Providers
     */
    useEffect(() => {
        const loadProviders = async () => {
            try {
                setLoading(true);
                const enabledProviders = await APIProviderService.getEnabled();
                setProviders(enabledProviders);

                // 如果没有选中的Provider，自动选择第一个
                if (!selectedProviderId && enabledProviders.length > 0) {
                    onChange(enabledProviders[0].id);
                }

                setError('');
            } catch (err: any) {
                console.error('加载API Providers失败:', err);
                setError('加载失败');
            } finally {
                setLoading(false);
            }
        };

        loadProviders();
    }, []);

    /**
     * 处理选择变化
     */
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const providerId = parseInt(e.target.value);
        onChange(providerId);
    };

    if (loading) {
        return (
            <div className={`provider-selector ${className}`}>
                {showLabel && <label>AI模型：</label>}
                <select disabled>
                    <option>加载中...</option>
                </select>
            </div>
        );
    }

    if (error || providers.length === 0) {
        return (
            <div className={`provider-selector ${className}`}>
                {showLabel && <label>AI模型：</label>}
                <select disabled>
                    <option>无可用模型</option>
                </select>
            </div>
        );
    }

    return (
        <div className={`provider-selector ${className}`}>
            {showLabel && <label>AI模型：</label>}
            <select
                value={selectedProviderId || ''}
                onChange={handleChange}
                className="provider-select"
            >
                {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                        {provider.name} ({provider.api_kind})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AIProviderSelector;
