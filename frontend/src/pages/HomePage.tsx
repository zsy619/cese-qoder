import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/app.css';

/**
 * 首页组件
 * 展示项目介绍和功能特点，提供进入模板生成页面的入口
 */
const HomePage: React.FC = () => {
  return (
    <div className="container">
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-icon">🧠</div>
          <h1 className="home-title">上下文工程六要素小工具</h1>
          <p className="home-subtitle">
            基于"上下文工程六要素"理念构建的主题六要素生成工具，帮助您快速创建结构化的提示词模板
          </p>
        </div>

        <div className="features-section">
          <h2 className="section-title">核心功能</h2>
          <div className="features-grid">
            <div className="feature-card flat-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">六要素模板生成</h3>
              <p className="feature-description">根据主题自动生成完整的六要素提示词模板</p>
            </div>
            <div className="feature-card flat-card">
              <div className="feature-icon">💾</div>
              <h3 className="feature-title">模板保存与管理</h3>
              <p className="feature-description">保存模板到本地数据库，便于后续查阅和重复使用</p>
            </div>
            <div className="feature-card flat-card">
              <div className="feature-icon">📤</div>
              <h3 className="feature-title">多格式导出</h3>
              <p className="feature-description">支持导出为Markdown、JSON、TXT等多种格式</p>
            </div>
            <div className="feature-card flat-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">历史搜索</h3>
              <p className="feature-description">快速查找和复用历史生成的模板</p>
            </div>
            <div className="feature-card flat-card">
              <div className="feature-icon">📋</div>
              <h3 className="feature-title">实时预览</h3>
              <p className="feature-description">实时预览生成的提示词效果</p>
            </div>
            <div className="feature-card flat-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI辅助生成</h3>
              <p className="feature-description">集成AI模型提供智能辅助生成功能</p>
            </div>
          </div>
        </div>

        <div className="benefits-section">
          <h2 className="section-title">为什么选择我们</h2>
          <div className="benefits-grid">
            <div className="benefit-card flat-card">
              <div className="benefit-icon">⚡</div>
              <h3 className="benefit-title">高效快捷</h3>
              <p className="benefit-description">一键生成结构化提示词模板，大幅提升工作效率</p>
            </div>
            <div className="benefit-card flat-card">
              <div className="benefit-icon">🔄</div>
              <h3 className="benefit-title">可复用性</h3>
              <p className="benefit-description">模板可保存和复用，避免重复劳动</p>
            </div>
            <div className="benefit-card flat-card">
              <div className="benefit-icon">🎯</div>
              <h3 className="benefit-title">精准定位</h3>
              <p className="benefit-description">六要素结构确保提示词的完整性和准确性</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <Link to="/template" className="btn btn-primary btn-large">
            开始生成模板
          </Link>
          <p className="cta-description">点击上方按钮开始创建您的第一个提示词模板</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;