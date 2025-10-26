import React, { useState } from 'react';
import { UserService } from '../services';
import '../styles/login.css';

/**
 * 登录组件属性接口
 */
interface LoginProps {
  /** 是否显示登录窗口 */
  visible: boolean;
  /** 关闭登录窗口的回调 */
  onClose: () => void;
  /** 登录成功后的回调 */
  onSuccess?: () => void;
}

/**
 * 登录组件
 * @description 提供用户登录功能，支持手机号+密码登录
 */
const Login: React.FC<LoginProps> = ({ visible, onClose, onSuccess }) => {
  const [mobile, setMobile] = useState('13800138000');
  const [password, setPassword] = useState('Test@123456');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    mobile?: string;
    password?: string;
    general?: string;
  }>({});

  /**
   * 验证手机号格式
   */
  const validateMobile = (value: string): string | undefined => {
    if (!value) {
      return '请输入手机号';
    }
    if (!/^1[3-9]\d{9}$/.test(value)) {
      return '请输入有效的手机号';
    }
    return undefined;
  };

  /**
   * 验证密码格式
   */
  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return '请输入密码';
    }
    if (value.length < 8 || value.length > 16) {
      return '密码长度应为8-16位';
    }
    return undefined;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    const mobileError = validateMobile(mobile);
    const passwordError = validatePassword(password);

    if (mobileError || passwordError) {
      setErrors({
        mobile: mobileError,
        password: passwordError,
      });
      return;
    }

    // 清除之前的错误
    setErrors({});
    setLoading(true);

    try {
      // 调用登录API
      await UserService.login({
        mobile: mobile.trim(),
        password: password,
      });

      // 登录成功
      setMobile('');
      setPassword('');
      
      // 触发成功回调
      if (onSuccess) {
        onSuccess();
      }
      
      // 关闭登录窗口
      onClose();
    } catch (error: any) {
      // 登录失败
      setErrors({
        general: error.message || '登录失败，请检查手机号和密码',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理手机号输入变化
   */
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMobile(value);
    
    // 实时验证
    if (errors.mobile) {
      setErrors((prev) => ({
        ...prev,
        mobile: validateMobile(value),
      }));
    }
  };

  /**
   * 处理密码输入变化
   */
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // 实时验证
    if (errors.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  /**
   * 处理背景点击，关闭弹窗
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 如果不可见，不渲染
  if (!visible) {
    return null;
  }

  return (
    <div className="login-modal" onClick={handleBackdropClick}>
      <div className="login-content">
        <div className="login-header">
          <h2 className="login-title">用户登录</h2>
          <button
            className="login-close-button"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* 通用错误提示 */}
          {errors.general && (
            <div className="login-error-banner">
              <span className="error-icon">⚠️</span>
              {errors.general}
            </div>
          )}

          {/* 手机号输入框 */}
          <div className="login-form-group">
            <div className="login-input-wrapper">
              <span className="login-input-icon">📱</span>
              <input
                type="tel"
                className={`login-input ${errors.mobile ? 'error' : ''}`}
                placeholder="请输入手机号"
                value={mobile}
                onChange={handleMobileChange}
                maxLength={11}
                autoComplete="tel"
                disabled={loading}
              />
            </div>
            {errors.mobile && (
              <div className="login-error-message">{errors.mobile}</div>
            )}
          </div>

          {/* 密码输入框 */}
          <div className="login-form-group">
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔒</span>
              <input
                type="password"
                className={`login-input ${errors.password ? 'error' : ''}`}
                placeholder="请输入密码"
                value={password}
                onChange={handlePasswordChange}
                maxLength={16}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            {errors.password && (
              <div className="login-error-message">{errors.password}</div>
            )}
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          {/* 提示信息 */}
          <div className="login-footer">
            <p className="login-hint">
              密码应为8-16位，包含大小写字母、数字和特殊字符
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
