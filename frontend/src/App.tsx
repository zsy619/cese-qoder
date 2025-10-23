import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import APIConfig from './pages/APIConfig';
import HomePage from './pages/HomePage';
import MyTemplate from './pages/MyTemplate';
import TemplatePage from './pages/TemplatePage';
import './styles/app.css';

/**
 * 主应用组件
 * 负责路由配置和整体布局
 * 包含头部、主要内容区域和底部
 */
const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/template" element={<TemplatePage />} />
            <Route path="/my-template" element={<MyTemplate />} />
            <Route path="/api-config" element={<APIConfig />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
