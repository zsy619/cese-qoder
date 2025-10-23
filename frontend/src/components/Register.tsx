import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services';
import '../styles/login.css';
import Toast from './Toast';

/**
 * 注册组件属性接口
 */
interface RegisterProps {
  /** 是否显示注册窗口 */
  visible: boolean;
  /** 关闭注册窗口的回调 */
  onClose: () => void;
  /** 注册成功后的回调 */
  onSuccess?: () => void;
}

/**
 * 注册组件
 * @description 提供用户注册功能，支持手机号+密码注册
 */
const Register: React.FC<RegisterProps> = ({ visible, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    mobile?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

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
    // 密码强度验证：包含大小写字母、数字和特殊字符
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*]/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return '密码必须包含大小写字母、数字和特殊字符';
    }
    return undefined;
  };

  /**
   * 验证确认密码
   */
  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) {
      return '请再次输入密码';
    }
    if (value !== password) {
      return '两次输入的密码不一致';
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
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    if (mobileError || passwordError || confirmPasswordError) {
      setErrors({
        mobile: mobileError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    // 清除之前的错误
    setErrors({});
    setLoading(true);

    try {
      // 调用注册API
      await UserService.register({
        mobile: mobile.trim(),
        password: password,
      });

      // 注册成功
      setMobile('');
      setPassword('');
      setConfirmPassword('');
      
      // 显示成功提示
      setToast({ message: '注册成功！欢迎使用', type: 'success' });
      
      // 延迟后关闭窗口并跳转
      setTimeout(() => {
        // 触发成功回调
        if (onSuccess) {
          onSuccess();
        }
        
        // 关闭注册窗口
        onClose();

        // 跳转到模板生成页面
        navigate('/template');
      }, 2000);
    } catch (error: any) {
      // 注册失败 - 使用Toast提示
      setToast({ message: error.message || '注册失败，请稍后重试', type: 'error' });
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
    
    // 如果确认密码已输入，同时验证确认密码
    if (confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== confirmPassword ? '两次输入的密码不一致' : undefined,
      }));
    }
  };

  /**
   * 处理确认密码输入变化
   */
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    // 实时验证
    if (errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value),
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
          <h2 className="login-title">用户注册</h2>
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
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {errors.password && (
              <div className="login-error-message">{errors.password}</div>
            )}
          </div>

          {/* 确认密码输入框 */}
          <div className="login-form-group">
            <div className="login-input-wrapper">
              <span className="login-input-icon">🔐</span>
              <input
                type="password"
                className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                maxLength={16}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && (
              <div className="login-error-message">{errors.confirmPassword}</div>
            )}
          </div>

          {/* 注册按钮 */}
          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </button>

          {/* 提示信息 */}
          <div className="login-footer">
            <p className="login-hint">
              密码应为8-16位，必须包含大小写字母、数字和特殊字符
            </p>
          </div>
        </form>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={2000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Register;
