# Confirm 确认对话框组件使用指南

**创建时间**: 2025-10-23  
**组件版本**: 1.0

---

## 📋 组件概述

Confirm 是一个自定义的确认对话框组件，用于替代系统的 `window.confirm()`，提供更好的用户体验和视觉效果。

### 特点

- ✅ 优雅的UI设计（参考Toast组件风格）
- ✅ 支持3种类型（primary/danger/warning）
- ✅ 可自定义标题、消息和按钮文字
- ✅ 带遮罩层，点击遮罩可取消
- ✅ 平滑的动画效果
- ✅ 响应式设计
- ✅ TypeScript类型支持

---

## 🚀 快速开始

### 基础用法

```typescript
import { useState } from 'react';
import Confirm from './components/Confirm';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAction = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    console.log('用户确认了操作');
    setShowConfirm(false);
    // 执行确认后的操作
  };

  const handleCancel = () => {
    console.log('用户取消了操作');
    setShowConfirm(false);
  };

  return (
    <>
      <button onClick={handleAction}>执行操作</button>
      
      {showConfirm && (
        <Confirm
          title="确认操作"
          message="确定要执行此操作吗？"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
```

---

## 📋 API 参数

```typescript
interface ConfirmProps {
  title?: string;           // 对话框标题（默认："确认"）
  message: string;          // 确认消息内容（必填）
  confirmText?: string;     // 确认按钮文字（默认："确定"）
  cancelText?: string;      // 取消按钮文字（默认："取消"）
  type?: 'primary' | 'danger' | 'warning';  // 类型（默认："primary"）
  onConfirm: () => void;    // 确认回调（必填）
  onCancel: () => void;     // 取消回调（必填）
}
```

### 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | 否 | "确认" | 对话框标题 |
| message | string | 是 | - | 确认消息内容 |
| confirmText | string | 否 | "确定" | 确认按钮文字 |
| cancelText | string | 否 | "取消" | 取消按钮文字 |
| type | string | 否 | "primary" | 对话框类型 |
| onConfirm | function | 是 | - | 确认回调函数 |
| onCancel | function | 是 | - | 取消回调函数 |

---

## 🎨 类型样式

### 1. Primary（主要）

```typescript
<Confirm
  type="primary"
  title="确认操作"
  message="确定要执行此操作吗？"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>
```

**视觉效果**：
- 图标：蓝紫色圆形背景 + 信息图标
- 确认按钮：紫色渐变

**适用场景**：一般性确认操作

### 2. Danger（危险）

```typescript
<Confirm
  type="danger"
  title="删除确认"
  message="确定要删除此项吗？删除后无法恢复。"
  confirmText="删除"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

**视觉效果**：
- 图标：红色圆形背景 + 警告图标
- 确认按钮：红色渐变

**适用场景**：删除、清空等不可逆操作

### 3. Warning（警告）

```typescript
<Confirm
  type="warning"
  title="退出登录"
  message="确定要退出登录吗？退出后需要重新登录才能使用完整功能。"
  confirmText="退出"
  onConfirm={handleLogout}
  onCancel={handleCancel}
/>
```

**视觉效果**：
- 图标：橙色圆形背景 + 警告图标
- 确认按钮：橙色渐变

**适用场景**：退出登录、放弃更改等需要提醒的操作

---

## 💡 使用场景示例

### 场景1：删除确认

```typescript
const [deleteConfirm, setDeleteConfirm] = useState({
  show: false,
  id: 0,
  name: ''
});

// 点击删除按钮
const handleDelete = (id: number, name: string) => {
  setDeleteConfirm({ show: true, id, name });
};

// 确认删除
const confirmDelete = async () => {
  await deleteItem(deleteConfirm.id);
  setDeleteConfirm({ show: false, id: 0, name: '' });
};

// 取消删除
const cancelDelete = () => {
  setDeleteConfirm({ show: false, id: 0, name: '' });
};

// 渲染
{deleteConfirm.show && (
  <Confirm
    title="删除确认"
    message={`确定要删除"${deleteConfirm.name}"吗？此操作不可恢复。`}
    confirmText="删除"
    cancelText="取消"
    type="danger"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />
)}
```

### 场景2：退出登录确认

```typescript
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

// 点击退出按钮
const handleLogout = () => {
  setShowLogoutConfirm(true);
};

// 确认退出
const confirmLogout = () => {
  logout();
  setShowLogoutConfirm(false);
};

// 取消退出
const cancelLogout = () => {
  setShowLogoutConfirm(false);
};

// 渲染
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
```

### 场景3：提交前确认

```typescript
const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

// 提交表单
const handleSubmit = () => {
  setShowSubmitConfirm(true);
};

// 确认提交
const confirmSubmit = async () => {
  await submitForm();
  setShowSubmitConfirm(false);
};

// 渲染
{showSubmitConfirm && (
  <Confirm
    title="提交确认"
    message="请确认您的信息无误后提交。"
    confirmText="确认提交"
    type="primary"
    onConfirm={confirmSubmit}
    onCancel={() => setShowSubmitConfirm(false)}
  />
)}
```

---

## 🎯 替换系统confirm

### 之前（使用系统confirm）

```typescript
const handleDelete = async (id: number) => {
  if (window.confirm('确定要删除吗？')) {
    await deleteItem(id);
  }
};
```

**缺点**：
- ❌ UI样式无法自定义
- ❌ 不同浏览器样式不一致
- ❌ 无法添加详细说明
- ❌ 用户体验差

### 之后（使用Confirm组件）

```typescript
const [deleteId, setDeleteId] = useState<number | null>(null);

const handleDelete = (id: number) => {
  setDeleteId(id);
};

const confirmDelete = async () => {
  if (deleteId !== null) {
    await deleteItem(deleteId);
    setDeleteId(null);
  }
};

// 渲染
{deleteId !== null && (
  <Confirm
    title="删除确认"
    message="确定要删除此项吗？删除后将无法恢复。"
    type="danger"
    confirmText="删除"
    onConfirm={confirmDelete}
    onCancel={() => setDeleteId(null)}
  />
)}
```

**优点**：
- ✅ 统一的UI风格
- ✅ 可自定义样式
- ✅ 更好的用户体验
- ✅ 支持详细说明

---

## 🎨 样式定制

### 修改主题色

```css
/* confirm.css */

/* 修改primary类型颜色 */
.confirm-icon-primary {
  background-color: rgba(YOUR_COLOR, 0.1);
  color: #YOUR_COLOR;
}

.confirm-btn-confirm.confirm-btn-primary {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR2 100%);
}

/* 修改danger类型颜色 */
.confirm-icon-danger {
  background-color: rgba(YOUR_COLOR, 0.1);
  color: #YOUR_COLOR;
}

.confirm-btn-confirm.confirm-btn-danger {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR2 100%);
}
```

---

## 📱 响应式设计

组件已内置响应式设计：

- **桌面端**：固定宽度（380-500px）
- **移动端**：自适应宽度（90vw），按钮垂直排列

```css
@media (max-width: 768px) {
  .confirm-footer {
    flex-direction: column-reverse;
  }
  
  .confirm-btn {
    width: 100%;
  }
}
```

---

## 🔧 高级用法

### 带状态管理的确认

```typescript
interface ConfirmState {
  show: boolean;
  type: 'delete' | 'logout' | 'submit';
  data?: any;
}

const [confirm, setConfirm] = useState<ConfirmState>({
  show: false,
  type: 'delete'
});

const getConfirmConfig = () => {
  switch (confirm.type) {
    case 'delete':
      return {
        title: '删除确认',
        message: '确定要删除吗？',
        type: 'danger' as const,
        confirmText: '删除'
      };
    case 'logout':
      return {
        title: '退出登录',
        message: '确定要退出吗？',
        type: 'warning' as const,
        confirmText: '退出'
      };
    default:
      return {
        title: '确认',
        message: '确定要执行此操作吗？',
        type: 'primary' as const,
        confirmText: '确定'
      };
  }
};

// 渲染
{confirm.show && (
  <Confirm
    {...getConfirmConfig()}
    onConfirm={() => {
      // 根据类型执行不同操作
      handleConfirm(confirm.type, confirm.data);
      setConfirm({ show: false, type: 'delete' });
    }}
    onCancel={() => setConfirm({ show: false, type: 'delete' })}
  />
)}
```

---

## 📞 常见问题

### Q1: 如何同时显示多个确认框？

建议使用队列管理，一次只显示一个确认框。

### Q2: 如何在确认后执行异步操作？

```typescript
const confirmDelete = async () => {
  try {
    await deleteItem(id);
    setShowConfirm(false);
    // 成功提示
  } catch (error) {
    // 错误处理
  }
};
```

### Q3: 如何禁用点击遮罩关闭？

修改组件，移除遮罩层的 `onClick` 事件。

---

## 📚 相关文档

- [Toast组件文档](/frontend/src/components/Toast.tsx)
- [Header组件示例](/frontend/src/components/Header.tsx)
- [MyTemplate组件示例](/frontend/src/pages/MyTemplate.tsx)

---

**更新时间**: 2025-10-23  
**维护者**: AI React+TypeScript工程师
