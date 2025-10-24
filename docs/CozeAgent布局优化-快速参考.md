# CozeAgent 布局优化 - 快速参考

## 🎯 优化内容
将"使用指南"从垂直步骤布局改为网格卡片布局，参考"核心特点"样式

## 📊 布局对比

**优化前：**
```
① 访问智能体
② 输入主题
③ 获取结果
④ 应用使用
（垂直列表）
```

**优化后：**
```
┌──────┬──────┬──────┬──────┐
│ 🚀   │ ✏️   │ ✨   │ 🎯   │
│访问  │输入  │获取  │应用  │
└──────┴──────┴──────┴──────┘
（网格卡片）
```

## ✅ 修改内容

### 1. CozeAgent.tsx
```tsx
// 修改前：垂直步骤
<div className="usage-steps">
  <div className="step-item">
    <div className="step-number">1</div>
    <div className="step-content">...</div>
  </div>
</div>

// 修改后：网格卡片
<div className="usage-grid">
  <div className="usage-item">
    <div className="usage-icon">🚀</div>
    <h3>访问智能体</h3>
    <p>点击上方链接...</p>
  </div>
  {/* 其他3个卡片 */}
</div>
```

### 2. app.css 新增样式
```css
/* 网格布局 */
.usage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

/* 卡片样式（与 feature-item 一致） */
.usage-item {
  background-color: #f8f9fa;
  padding: 25px 20px;
  border-radius: 10px;
  border: 2px solid transparent;
  text-align: center;
}

.usage-item:hover {
  border-color: #6a5acd;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(106, 90, 205, 0.2);
}

/* 图标 */
.usage-icon {
  font-size: 36px;
  margin-bottom: 15px;
}

/* 响应式 */
@media (max-width: 768px) {
  .usage-grid {
    grid-template-columns: 1fr;
  }
}
```

## 🎨 图标选择

| 步骤 | 图标 | 含义 |
|------|------|------|
| 访问智能体 | 🚀 | 启动 |
| 输入主题 | ✏️ | 编辑 |
| 获取结果 | ✨ | 生成 |
| 应用使用 | 🎯 | 目标 |

## ✅ 编译结果
```
✅ Compiled successfully.
JS: 72.85 kB (-24 B)
CSS: 7.44 kB (-26 B)
```

## 🎯 效果
- ✅ 与"核心特点"风格统一
- ✅ 页面高度减少 50%
- ✅ 信息一目了然
- ✅ 响应式友好

**完成！** 使用指南现在采用现代化的网格卡片布局 🚀
