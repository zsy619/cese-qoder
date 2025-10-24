import React, { useEffect, useState } from 'react';
import ImagePreview from '../components/ImagePreview';
import Toast, { ToastType } from '../components/Toast';
import '../styles/app.css';

/**
 * Coze 智能体展示页面
 * @description 展示上下文工程六要素提示词生成的 Coze 智能体信息
 */
/**
 * Toast 状态接口
 */
interface ToastState {
  message: string;
  type: ToastType;
}

const CozeAgent: React.FC = () => {
  const [promptContent, setPromptContent] = useState<string>('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  /**
   * 显示 Toast 提示
   */
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  };

  /**
   * 关闭 Toast 提示
   */
  const closeToast = () => {
    setToast(null);
  };

  /**
   * 加载提示词内容
   */
  useEffect(() => {
    fetch('/docs/coze智能体提示词.md')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((text) => setPromptContent(text))
      .catch((error) => {
        console.error('加载提示词失败:', error);
        showToast('提示词加载失败，请刷新页面重试', 'error');
      });
  }, []);

  /**
   * 复制提示词到剪贴板
   */
  const handleCopyPrompt = () => {
    if (!promptContent) {
      showToast('提示词内容为空，无法复制', 'warning');
      return;
    }

    navigator.clipboard.writeText(promptContent)
      .then(() => {
        showToast('提示词已复制到剪贴板', 'success');
      })
      .catch((error) => {
        console.error('复制失败:', error);
        showToast('复制失败，请手动复制', 'error');
      });
  };

  /**
   * 打开图片预览
   */
  const handleImageClick = () => {
    setShowImagePreview(true);
  };

  /**
   * 关闭图片预览
   */
  const handleClosePreview = () => {
    setShowImagePreview(false);
  };

  return (
    <>
      {/* Toast 提示 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={closeToast}
        />
      )}

      {/* 图片预览 */}
      {showImagePreview && (
        <ImagePreview
          src="/docs/coze智能体上下文六要素.png"
          alt="Coze智能体截图"
          onClose={handleClosePreview}
        />
      )}

      <div className="container">
      <div className="coze-agent-page">
        {/* 页面标题 */}
        <div className="page-header">
          <h1 className="page-title">
            <span className="icon">🤖</span>
            Coze 智能体 - 上下文六要素提示词生成器
          </h1>
          <p className="page-subtitle">
            基于上下文工程六要素理念构建的智能提示词生成助手
          </p>
        </div>

        {/* 智能体信息卡片 */}
        <div className="flat-card agent-info-card">
          <h2 className="card-title">
            <span className="icon">✨</span>
            智能体介绍
          </h2>
          <div className="agent-description">
            <p>
              这是一个专业的提示词生成智能体，能够根据您输入的主题，
              自动生成符合"上下文工程六要素"规范的完整提示词模板。
            </p>
            <p className="highlight-text">
              六要素包括：<strong>任务目标</strong>、<strong>AI的角色</strong>、
              <strong>我的角色</strong>、<strong>关键信息</strong>、
              <strong>行为规则</strong>、<strong>交付格式</strong>
            </p>
          </div>

          {/* 智能体链接 */}
          <div className="agent-link-section">
            <h3 className="section-subtitle">🔗 智能体访问地址</h3>
            <a 
              href="https://www.coze.cn/space/7493337623675584547/bot/7556876900287873062"
              target="_blank"
              rel="noopener noreferrer"
              className="agent-link"
            >
              <span className="link-icon">🚀</span>
              https://www.coze.cn/space/7493337623675584547/bot/7556876900287873062
              <span className="external-icon">↗</span>
            </a>
            <p className="link-hint">点击链接在新窗口中打开 Coze 智能体</p>
          </div>
        </div>

        {/* 智能体截图 */}
        <div className="flat-card screenshot-card">
          <h2 className="card-title">
            <span className="icon">📸</span>
            智能体界面预览
          </h2>
          <div className="screenshot-container" onClick={handleImageClick}>
            <img 
              src="/docs/coze智能体上下文六要素.png"
              alt="Coze智能体截图"
              className="agent-screenshot clickable"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect width="800" height="600" fill="%23f0f0f0"/%3E%3Ctext x="400" y="300" font-family="Arial" font-size="20" fill="%23999" text-anchor="middle"%3E智能体截图加载失败%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="image-overlay">
              <span className="overlay-icon">🔍</span>
              <span className="overlay-text">点击查看大图</span>
            </div>
          </div>
        </div>

        {/* 提示词展示 */}
        <div className="flat-card prompt-card">
          <div className="prompt-header">
            <h2 className="card-title">
              <span className="icon">📝</span>
              智能体提示词模板
            </h2>
            <button 
              className="btn btn-secondary copy-btn"
              onClick={handleCopyPrompt}
              disabled={!promptContent}
            >
              📋 复制提示词
            </button>
          </div>
          {promptContent ? (
            <textarea
              className="prompt-textarea"
              value={promptContent}
              readOnly
              spellCheck={false}
            />
          ) : (
            <div className="loading-placeholder">
              <div className="loading-spinner"></div>
              <p>加载提示词中...</p>
            </div>
          )}
          <div className="prompt-footer">
            <p className="hint-text">
              💡 提示：您可以将此提示词用于创建自己的智能体，或在其他 AI 对话中使用
            </p>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="flat-card usage-card">
          <h2 className="card-title">
            <span className="icon">📖</span>
            使用指南
          </h2>
          <div className="usage-grid">
            <div className="usage-item">
              <div className="usage-icon">🚀</div>
              <h3>访问智能体</h3>
              <p>点击上方链接，在 Coze 平台打开智能体页面</p>
            </div>
            <div className="usage-item">
              <div className="usage-icon">✏️</div>
              <h3>输入主题</h3>
              <p>在对话框中输入您想要生成提示词的主题</p>
            </div>
            <div className="usage-item">
              <div className="usage-icon">✨</div>
              <h3>获取结果</h3>
              <p>智能体将自动生成符合六要素规范的完整提示词</p>
            </div>
            <div className="usage-item">
              <div className="usage-icon">🎯</div>
              <h3>应用使用</h3>
              <p>将生成的提示词应用到您的 AI 工作流程中</p>
            </div>
          </div>
        </div>

        {/* 功能特点 */}
        <div className="flat-card features-card">
          <h2 className="card-title">
            <span className="icon">⭐</span>
            核心特点
          </h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>结构化输出</h3>
              <p>严格遵循六要素框架，确保提示词结构完整</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <h3>快速生成</h3>
              <p>只需输入主题，即可秒级生成专业提示词</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💡</div>
              <h3>智能优化</h3>
              <p>AI 自动优化每个要素的内容表述</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <h3>即用即拷</h3>
              <p>生成的提示词可直接复制使用</p>
            </div>
          </div>
        </div>

        {/* 返回链接 */}
        <div className="back-section">
          <a href="/template" className="btn btn-primary">
            ← 返回模板生成页面
          </a>
        </div>
      </div>
      </div>
    </>
  );
};

export default CozeAgent;
