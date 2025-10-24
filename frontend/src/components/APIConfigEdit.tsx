import React, { useEffect, useState } from 'react';
import { APIProvider, APIProviderData, APIProviderService, APIProviderUpdateData } from '../services';
import '../styles/login.css'; // 复用登录页面样式

interface APIConfigEditProps {
  /** 是否显示对话框 */
  visible: boolean;
  /** 关闭对话框 */
  onClose: () => void;
  /** 编辑模式下的Provider数据 */
  provider?: APIProvider;
  /** 保存成功回调 */
  onSuccess: () => void;
}

/**
 * 常用API Provider配置
 */
const COMMON_PROVIDERS = [
  {
    kind: 'OpenRouter',
    name: 'OpenRouter',
    api_url: 'https://openrouter.ai/api/v1',
    models: ['openai/gpt-4', 'anthropic/claude-3-opus', 'google/gemini-pro'],
  },
  {
    kind: 'Google Gemini',
    name: 'Google Gemini',
    api_url: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
  },
  {
    kind: 'OpenAI Compatible',
    name: 'OpenAI Compatible',
    api_url: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o'],
  },
  {
    kind: 'Anthropic',
    name: 'Anthropic Claude',
    api_url: 'https://api.anthropic.com/v1',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  },
  {
    kind: 'Amazon Bedrock',
    name: 'Amazon Bedrock',
    api_url: 'https://bedrock-runtime.us-east-1.amazonaws.com',
    models: ['anthropic.claude-3', 'amazon.titan-text-express'],
  },
  {
    kind: 'DeepSeek',
    name: 'DeepSeek',
    api_url: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-coder'],
  },
  {
    kind: 'Ollama',
    name: 'Ollama',
    api_url: 'http://localhost:11434/v1',
    models: ['llama2', 'llama3', 'mistral', 'codellama', 'qwen'],
  },
  {
    kind: 'Claude Code',
    name: 'Claude Code',
    api_url: 'https://api.anthropic.com/v1',
    models: ['claude-code'],
  },
  {
    kind: '阿里千问',
    name: '阿里千问',
    api_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  },
  {
    kind: '豆包',
    name: '豆包',
    api_url: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-pro', 'doubao-lite'],
  },
  {
    kind: '智普',
    name: '智景 AI',
    api_url: 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4', 'glm-3-turbo'],
  },
  {
    kind: '讯飞星火',
    name: '讯飞星火',
    api_url: 'https://spark-api.xf-yun.com/v1',
    models: ['spark-3.5', 'spark-3.0', 'spark-2.0'],
  },
  {
    kind: '百度千帆',
    name: '百度千帆',
    api_url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1',
    models: ['ernie-4.0', 'ernie-3.5', 'ernie-turbo'],
  },
  {
    kind: '腾讯混元',
    name: '腾讯混元',
    api_url: 'https://api.hunyuan.cloud.tencent.com/v1',
    models: ['hunyuan-pro', 'hunyuan-standard', 'hunyuan-lite'],
  },
];

/**
 * API Provider 添加/编辑组件
 */
const APIConfigEdit: React.FC<APIConfigEditProps> = ({
  visible,
  onClose,
  provider,
  onSuccess,
}) => {
  const isEditMode = !!provider;

  // 表单状态
  const [selectedKind, setSelectedKind] = useState('OpenAI Compatible');
  const [formData, setFormData] = useState<APIProviderData>({
    name: '',
    api_kind: 'OpenAI Compatible',
    api_key: '',
    api_url: '',
    api_model: '',
    api_version: 'v1',
    api_open: 0,
    api_remark: '',
  });

  // UI状态
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (visible) {
      if (provider) {
        // 编辑模式：填充现有数据
        setFormData({
          name: provider.name,
          api_kind: provider.api_kind || 'OpenAI Compatible',
          api_key: '', // API Key不回显，需要重新输入
          api_url: provider.api_url,
          api_model: provider.api_model,
          api_version: provider.api_version || 'v1',
          api_open: provider.api_open,
          api_remark: provider.api_remark || '',
        });
        
        // 设置模型类型
        setSelectedKind(provider.api_kind || 'OpenAI Compatible');
      } else {
        // 新建模式：重置表单
        resetForm();
      }
      setErrors({});
    }
  }, [visible, provider]);

  /**
   * 重置表单
   */
  const resetForm = () => {
    setSelectedKind('OpenAI Compatible');
    setFormData({
      name: '',
      api_kind: 'OpenAI Compatible',
      api_key: '',
      api_url: '',
      api_model: '',
      api_version: 'v1',
      api_open: 0,
      api_remark: '',
    });
    setErrors({});
  };

  /**
   * 模型类型选择变化
   */
  const handleKindChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kind = e.target.value;
    setSelectedKind(kind);

    const config = COMMON_PROVIDERS.find(p => p.kind === kind);
    if (config) {
      setFormData(prev => ({
        ...prev,
        api_kind: kind,
        name: prev.name || config.name,
        api_url: config.api_url || prev.api_url,
      }));
    }
  };

  /**
   * 表单字段变化
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value,
    }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Provider名称不能为空';
    }

    if (!formData.api_kind?.trim()) {
      newErrors.api_kind = '模型类型不能为空';
    }

    // API密钥改为非必填，但新建模式下建议填写
    // 编辑模式下可以留空（不修改原密钥）

    if (!formData.api_url?.trim()) {
      newErrors.api_url = 'API地址不能为空';
    } else {
      try {
        new URL(formData.api_url);
      } catch {
        newErrors.api_url = 'API地址格式不正确';
      }
    }

    if (!formData.api_model?.trim()) {
      newErrors.api_model = '模型名称不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && provider) {
        // 编辑模式
        const updateData: APIProviderUpdateData = {
          name: formData.name,
          api_kind: formData.api_kind,
          api_url: formData.api_url,
          api_model: formData.api_model,
          api_version: formData.api_version,
          api_open: formData.api_open,
          api_remark: formData.api_remark,
        };

        // 只有当输入了新的API Key时才更新
        if (formData.api_key?.trim()) {
          updateData.api_key = formData.api_key;
        }

        await APIProviderService.update(provider.id, updateData);
      } else {
        // 新建模式
        await APIProviderService.create(formData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({
        submit: error.message || '保存失败，请重试',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 关闭对话框
   */
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="login-modal" onClick={handleClose}>
      <div className="login-content" style={{ maxWidth: '756px' }} onClick={(e) => e.stopPropagation()}>
        <div className="login-header">
          <h2 className="login-title">
            {isEditMode ? '编辑 API Provider' : '添加 API Provider'}
          </h2>
          <button className="login-close-button" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* 两列布局容器 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* 模型类型选择 */}
            <div className="login-form-group" style={{ marginBottom: '0' }}>
              <label htmlFor="api-kind" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
                <span style={{ marginRight: '6px' }}>🔌</span>
                模型类型
              </label>
              <select
                id="api-kind"
                name="api_kind"
                value={selectedKind}
                onChange={handleKindChange}
                className="login-input"
                style={{ paddingLeft: '16px' }}
                disabled={loading}
              >
                {COMMON_PROVIDERS.map((p) => (
                  <option key={p.kind} value={p.kind}>
                    {p.kind}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider名称 */}
            <div className="login-form-group" style={{ marginBottom: '0' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
                <span style={{ marginRight: '6px' }}>📝</span>
                Provider名称
              </label>
              <div className="login-input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="如：DeepSeek、OpenAI、My Ollama"
                  className={`login-input ${errors.name ? 'error' : ''}`}
                  style={{ paddingLeft: '16px' }}
                  disabled={loading}
                />
              </div>
              {errors.name && <div className="login-error-message">{errors.name}</div>}
            </div>
          </div>

          {/* API密钥 - 单独一行 */}
          <div className="login-form-group">
            <label htmlFor="api_key" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
              <span style={{ marginRight: '6px' }}>🔑</span>
              API密钥
              <span style={{ marginLeft: '6px', fontSize: '12px', color: '#999', fontWeight: 'normal' }}>(可选)</span>
            </label>
            <div className="login-input-wrapper">
              <input
                type="password"
                id="api_key"
                name="api_key"
                value={formData.api_key}
                onChange={handleChange}
                placeholder={isEditMode ? "留空表示不修改" : "可选：sk-xxxxxx 或 API Key"}
                className={`login-input ${errors.api_key ? 'error' : ''}`}
                style={{ paddingLeft: '16px' }}
                disabled={loading}
              />
            </div>
            {errors.api_key && <div className="login-error-message">{errors.api_key}</div>}
            <p className="login-hint" style={{ marginTop: '6px' }}>
              {isEditMode ? '提示：留空表示保持原密钥不变' : '提示：如果不需要认证可以留空'}
            </p>
          </div>

          {/* API地址 - 独占一行两列 */}
          <div className="login-form-group">
            <label htmlFor="api_url" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
              <span style={{ marginRight: '6px' }}>🌐</span>
              API地址
            </label>
            <div className="login-input-wrapper">
              <input
                type="url"
                id="api_url"
                name="api_url"
                value={formData.api_url}
                onChange={handleChange}
                placeholder="https://api.openai.com/v1"
                className={`login-input ${errors.api_url ? 'error' : ''}`}
                style={{ paddingLeft: '16px' }}
                disabled={loading}
              />
            </div>
            {errors.api_url && <div className="login-error-message">{errors.api_url}</div>}
          </div>

          {/* 两列布局 - 模型名称和API版本 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* 模型名称 */}
            <div className="login-form-group" style={{ marginBottom: '0' }}>
              <label htmlFor="api_model" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
                <span style={{ marginRight: '6px' }}>🤖</span>
                模型名称
              </label>
              <div className="login-input-wrapper">
                <input
                  type="text"
                  id="api_model"
                  name="api_model"
                  value={formData.api_model}
                  onChange={handleChange}
                  placeholder="gpt-4, deepseek-chat, llama2"
                  className={`login-input ${errors.api_model ? 'error' : ''}`}
                  style={{ paddingLeft: '16px' }}
                  disabled={loading}
                  list="model-suggestions"
                />
                <datalist id="model-suggestions">
                  {COMMON_PROVIDERS.find(p => p.kind === selectedKind)?.models.map((model) => (
                    <option key={model} value={model} />
                  ))}
                </datalist>
              </div>
              {errors.api_model && <div className="login-error-message">{errors.api_model}</div>}
            </div>

            {/* API版本 */}
            <div className="login-form-group" style={{ marginBottom: '0' }}>
              <label htmlFor="api_version" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
                <span style={{ marginRight: '6px' }}>📌</span>
                API版本
              </label>
              <div className="login-input-wrapper">
                <input
                  type="text"
                  id="api_version"
                  name="api_version"
                  value={formData.api_version}
                  onChange={handleChange}
                  placeholder="v1"
                  className="login-input"
                  style={{ paddingLeft: '16px' }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* 开放类型 - 单独一行 */}
          <div className="login-form-group">
            <label htmlFor="api_open" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
              <span style={{ marginRight: '6px' }}>🔓</span>
              开放类型
            </label>
            <select
              id="api_open"
              name="api_open"
              value={formData.api_open}
              onChange={handleChange}
              className="login-input"
              style={{ paddingLeft: '16px' }}
              disabled={loading}
            >
              <option value={0}>私有</option>
              <option value={1}>公开</option>
            </select>
          </div>

          {/* 备注说明 - 独占一行两列 */}
          <div className="login-form-group">
            <label htmlFor="api_remark" style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '14px', fontWeight: '500' }}>
              <span style={{ marginRight: '6px' }}>💬</span>
              备注说明
            </label>
            <textarea
              id="api_remark"
              name="api_remark"
              value={formData.api_remark}
              onChange={handleChange}
              placeholder="可选：添加一些说明信息..."
              className="login-input"
              style={{ paddingLeft: '16px', resize: 'vertical', minHeight: '80px' }}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* 错误提示 */}
          {errors.submit && (
            <div className="login-error-banner">
              <span className="error-icon">⚠️</span>
              {errors.submit}
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#333',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
              }}
              disabled={loading}
              onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            >
              取消
            </button>
            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? '保存中...' : isEditMode ? '保存修改' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default APIConfigEdit;
