import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserService } from '../services';
import '../styles/app.css';
import Confirm from './Confirm';
import Login from './Login';
import Register from './Register';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userMobile, setUserMobile] = useState<string>('');

  /**
   * 检查登录状态
   */
  const checkLoginStatus = () => {
    const loggedIn = UserService.isLoggedIn();
    setIsLoggedIn(loggedIn);
    if (loggedIn) {
      const mobile = UserService.getCurrentMobile();
      setUserMobile(mobile || '');
    }
  };

  /**
   * 处理注册成功
   */
  const handleRegisterSuccess = () => {
    // 注册成功后会自动跳转到模板生成页面
    // 这里可以显示成功提示
    alert('注册成功！欢迎使用');
  };

  /**
   * 处理登录成功
   */
  const handleLoginSuccess = () => {
    checkLoginStatus();
    // 刷新当前页面
    window.location.reload();
  };

  /**
   * 处理登出
   */
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  /**
   * 确认登出
   */
  const confirmLogout = () => {
    UserService.logout();
    setIsLoggedIn(false);
    setUserMobile('');
    setShowLogoutConfirm(false);
    // 跳转到首页
    navigate('/');
    // 刷新页面
    window.location.reload();
  };

  /**
   * 取消登出
   */
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  /**
   * 监听登录状态变化
   */
  useEffect(() => {
    checkLoginStatus();

    // 监听登出事件
    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
      setUserMobile('');
    };

    window.addEventListener('user:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('user:logout', handleLogoutEvent);
    };
  }, []);

  return (
    <>
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            上下文工程六要素小工具
          </div>
          <nav className="nav-links">
            <Link to="/" className="nav-link">首页</Link>
            <Link to="/template" className="nav-link">模板生成</Link>
            {isLoggedIn && (
              <>
                <Link to="/my-template" className="nav-link">我的模板</Link>
                <Link to="/api-config" className="nav-link">API Config</Link>
              </>
            )}
            {isLoggedIn ? (
              <button
                className="nav-link logout-btn"
                onClick={handleLogout}
                title={`当前用户: ${userMobile}`}
              >
                退出登录
              </button>
            ) : (
              <>
                <button
                  className="nav-link register-btn"
                  onClick={() => setShowRegister(true)}
                >
                  注册
                </button>
                <button
                  className="nav-link login-btn"
                  onClick={() => setShowLogin(true)}
                >
                  登录
                </button>
              </>
            )}
          </nav>
        </div>
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </header>

      {/* 登录弹窗 */}
      <Login
        visible={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* 注册弹窗 */}
      <Register
        visible={showRegister}
        onClose={() => setShowRegister(false)}
        onSuccess={handleRegisterSuccess}
      />

      {/* 退出登录确认对话框 */}
      {showLogoutConfirm && (
        <Confirm
          title="退出登录"
          message="确定要退出登录吗？退出后需要重新登录才能使用完整功能。"
          confirmText="退出"
          cancelText="取消"
          type="warning"
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
    </>
  );
};

export default Header;
