# 快速开始指南

## 🚀 5分钟上手

### 1. 导入服务

```typescript
// 在任何组件中导入需要的服务
import { UserService, TemplateService } from './services';
```

### 2. 用户登录

```typescript
// 登录并自动保存Token
const handleLogin = async () => {
  try {
    const result = await UserService.login({
      mobile: '13800138000',
      password: 'Test@123456'
    });
    console.log('登录成功!');
    // Token已自动保存，可以直接使用其他API
  } catch (error) {
    console.error('登录失败:', error.message);
  }
};
```

### 3. 获取数据

```typescript
// 获取模板列表（会自动带上Token）
const loadTemplates = async () => {
  try {
    const result = await TemplateService.list({
      page: 1,
      page_size: 10
    });
    console.log('模板列表:', result.list);
    console.log('总数:', result.total);
  } catch (error) {
    console.error('获取失败:', error.message);
  }
};
```

### 4. 全局错误处理（可选）

在 `App.tsx` 中添加：

```typescript
import { message } from 'antd';

useEffect(() => {
  // 统一错误提示
  window.addEventListener('error:show', (e: CustomEvent) => {
    message.error(e.detail);
  });
  
  // 登录过期处理
  window.addEventListener('auth:expired', () => {
    message.warning('登录已过期');
    window.location.href = '/login';
  });
}, []);
```

## ✅ 完成！

现在你可以在整个应用中使用这些服务了，所有的认证、错误处理都会自动完成。

更多详细内容请查看 [README.md](./README.md)
