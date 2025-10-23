import React from 'react';
import '../styles/confirm.css';

interface ConfirmProps {
  /** 对话框标题 */
  title?: string;
  /** 确认消息内容 */
  message: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认按钮类型 */
  type?: 'primary' | 'danger' | 'warning';
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 确认对话框组件
 * @description 用于需要用户确认的操作，替代系统的confirm
 */
const Confirm: React.FC<ConfirmProps> = ({
  title = '确认',
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'primary',
  onConfirm,
  onCancel,
}) => {
  /**
   * 处理背景点击
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  /**
   * 获取图标
   */
  const getIcon = (): React.ReactElement => {
    switch (type) {
      case 'danger':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        );
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <div className="confirm-overlay" onClick={handleBackdropClick}></div>

      {/* 确认对话框 */}
      <div className="confirm-container">
        <div className="confirm-dialog">
          {/* 头部 */}
          <div className="confirm-header">
            <div className={`confirm-icon confirm-icon-${type}`}>
              {getIcon()}
            </div>
            <h3 className="confirm-title">{title}</h3>
          </div>

          {/* 内容 */}
          <div className="confirm-body">
            <p className="confirm-message">{message}</p>
          </div>

          {/* 底部按钮 */}
          <div className="confirm-footer">
            <button
              className="confirm-btn confirm-btn-cancel"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className={`confirm-btn confirm-btn-confirm confirm-btn-${type}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Confirm;
