import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/app.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container header-content">
        <div className="logo">
          上下文工程六要素小工具
        </div>
        <nav className="nav-links">
          <Link to="/" className="nav-link">首页</Link>
          <Link to="/template" className="nav-link">模板生成</Link>
        </nav>
      </div>
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
    </header>
  );
};

export default Header;
