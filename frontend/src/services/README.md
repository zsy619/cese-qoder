# 前端API服务层文档

## 📋 概述

本目录包含了前端与后端交互的所有API服务，采用TypeScript编写，提供完整的类型定义和错误处理机制。

## 🗂️ 文件结构

```
services/
├── common.ts          # 通用定义和工具方法
├── auth.ts           # 统一鉴权机制和HTTP客户端
├── user.ts           # 用户操作相关接口
├── api.ts            # 模板管理API服务
├── index.ts          # 统一导出入口
└── README.md         # 本文档
```

## 📦 核心模块

### 1. common.ts - 通用定义

提供全局统一的类型定义、常量和通用工具方法。

**主要导出**：
- `API_CONFIG` - API配置常量
- `ApiResponse<T>` - 统一的API响应格式
- `PageResponse<T>` - 分页响应格式
- `ErrorCode` - 错误码枚举
- `ApiError` - API错误类
- `Storage` - 本地存储工具类
- 各种工具函数

**使用示例**：
```typescript
import { ErrorCode, getErrorMessage, Storage } from './services';

// 获取错误信息
const message = getErrorMessage(ErrorCode.UNAUTHORIZED);

// 使用本地存储
Storage.set('key', { data: 'value' });
const data = Storage.get('key');
```

### 2. auth.ts - 统一鉴权机制

提供Token管理、HTTP请求客户端和拦截器机制。

**主要导出**：
- `TokenManager` - Token管理类
- `HttpClient` - HTTP请求客户端
- `InterceptorManager` - 拦截器管理器

**使用示例**：
```typescript
import { HttpClient, TokenManager } from './services';

// 检查登录状态
if (TokenManager.isLoggedIn()) {
  console.log('用户已登录');
}

// 发送请求
const data = await HttpClient.get('/api/path', { param: 'value' });
```

### 3. user.ts - 用户服务

提供用户注册、登录、信息管理等功能。

**主要导出**：
- `UserService` - 用户服务类
- `UserInfo` - 用户信息接口
- 各种请求/响应接口

**使用示例**：
```typescript
import { UserService } from './services';

// 用户注册
try {
  const user = await UserService.register({
    mobile: '13800138000',
    password: 'Test@123456'
  });
  console.log('注册成功:', user);
} catch (error) {
  console.error('注册失败:', error.message);
}

// 用户登录
try {
  const result = await UserService.login({
    mobile: '13800138000',
    password: 'Test@123456'
  });
  console.log('登录成功，Token:', result.token);
} catch (error) {
  console.error('登录失败:', error.message);
}

// 获取用户信息
const userInfo = await UserService.getUserInfo();

// 检查登录状态
if (UserService.isLoggedIn()) {
  const mobile = UserService.getCurrentMobile();
  console.log('当前用户:', mobile);
}

// 登出
UserService.logout();
```

### 4. api.ts - 模板服务

提供模板的增删改查、导出等功能。

**主要导出**：
- `TemplateService` - 模板服务类
- `Template` - 模板接口
- `TemplateData` - 模板数据接口

**使用示例**：
```typescript
import { TemplateService } from './services';

// 创建模板
const template = await TemplateService.create({
  topic: '写作助手',
  task_objective: '帮助用户生成高质量的文章内容',
  ai_role: '写作专家',
  my_role: '内容创作者',
  key_information: '需要创作的文章主题和目标读者',
  behavior_rule: '使用清晰的结构和生动的语言',
  delivery_format: 'Markdown格式'
});

// 查询模板列表
const result = await TemplateService.list({
  page: 1,
  page_size: 10,
  topic: '写作'
});
console.log('总数:', result.total);
console.log('列表:', result.list);

// 获取模板详情
const detail = await TemplateService.getById(1);

// 更新模板
const updated = await TemplateService.update(1, {
  topic: '写作助手（更新版）'
});

// 删除模板
await TemplateService.delete(1);

// 导出模板
const markdown = TemplateService.exportAsMarkdown(template);
const json = TemplateService.exportAsJSON(template);
const txt = TemplateService.exportAsTXT(template);

// 下载模板文件
TemplateService.download(template, 'markdown', '我的模板');
```

### 5. api_provider.ts - API Provider服务

提供大模型API Provider配置的管理功能。

**主要导出**：
- `APIProviderService` - API Provider服务类
- `APIProvider` - Provider信息接口
- `APIProviderData` - Provider配置数据接口
- `APIType` - API类型枚举
- `API_TYPE_CONFIGS` - API类型配置

**使用示例**：
```typescript
import { APIProviderService, APIType } from './services';

// 创建API Provider
const provider = await APIProviderService.create({
  name: 'DeepSeek',
  api_key: 'sk-xxxxx',
  api_url: 'https://api.deepseek.com',
  api_type: APIType.DEEPSEEK,
  api_model: 'deepseek-chat',
  api_remark: 'DeepSeek官方API'
});

// 查询Provider列表
const result = await APIProviderService.list({
  api_type: APIType.DEEPSEEK,
  status: 1
});

// 获取启用的Provider
const enabledProviders = await APIProviderService.getEnabled();

// 更新Provider
await APIProviderService.update(1, {
  name: '新名称',
  api_status: 0
});

// 启用/禁用Provider
await APIProviderService.enable(1);
await APIProviderService.disable(1);

// 设置为公开/私有
await APIProviderService.setPublic(1);
await APIProviderService.setPrivate(1);

// 删除Provider
await APIProviderService.delete(1);

// 获取API类型配置
const config = APIProviderService.getTypeConfig(APIType.DEEPSEEK);
console.log('默认URL:', config.defaultURL);
console.log('支持的模型:', config.models);

// 验证API Key
const isValid = APIProviderService.validateAPIKey('sk-xxxxx', APIType.OPENAI);

// 判断Provider状态
if (APIProviderService.isAvailable(provider)) {
  console.log('Provider可用');
}

if (APIProviderService.isPublic(provider)) {
  console.log('这是公开Provider');
}
```

## 🔐 认证机制

### Token管理

系统使用JWT Token进行身份认证，Token会自动存储在localStorage中。

```typescript
import { TokenManager } from './services';

// 获取Token
const token = TokenManager.getToken();

// 设置Token
TokenManager.setToken('your-jwt-token');

// 移除Token
TokenManager.removeToken();

// 检查是否已登录
if (TokenManager.isLoggedIn()) {
  console.log('已登录');
}

// 清除所有认证信息
TokenManager.clearAuth();
```

### 自动Token注入

使用`HttpClient`发送请求时，会自动在请求头中添加Token：

```typescript
// 需要认证的请求（默认）
await HttpClient.get('/api/protected', params);

// 不需要认证的请求
await HttpClient.post('/api/public', data, { requireAuth: false });
```

### Token过期处理

当Token过期或无效时，系统会：
1. 自动清除本地认证信息
2. 触发`auth:expired`事件
3. 抛出认证错误

可以监听该事件来处理跳转：

```typescript
window.addEventListener('auth:expired', () => {
  // 跳转到登录页
  window.location.href = '/login';
});
```

## 🔧 错误处理

### 统一的错误格式

所有API错误都会包装为`ApiError`类：

```typescript
import { ApiError, ErrorCode } from './services';

try {
  await UserService.login(data);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('错误码:', error.code);
    console.log('错误信息:', error.message);
    
    // 判断错误类型
    if (error.isAuthError()) {
      console.log('认证错误');
    } else if (error.isForbiddenError()) {
      console.log('权限错误');
    } else if (error.isServerError()) {
      console.log('服务器错误');
    }
  }
}
```

### 自动错误提示

默认情况下，所有API错误都会触发`error:show`事件：

```typescript
window.addEventListener('error:show', (event: CustomEvent) => {
  const message = event.detail;
  // 显示错误提示（例如使用Ant Design的message组件）
  console.error(message);
});
```

可以在请求时禁用自动错误提示：

```typescript
await HttpClient.get('/api/path', params, { showError: false });
```

## 🔄 加载状态

可以通过事件监听请求的加载状态：

```typescript
window.addEventListener('loading:start', () => {
  // 显示加载提示
  console.log('加载中...');
});

window.addEventListener('loading:end', () => {
  // 隐藏加载提示
  console.log('加载完成');
});
```

在请求时启用加载提示：

```typescript
await HttpClient.post('/api/path', data, { showLoading: true });
```

## 📊 拦截器

可以添加请求/响应拦截器：

```typescript
import { InterceptorManager } from './services';

// 添加请求拦截器
InterceptorManager.addRequestInterceptor((url, options) => {
  console.log('请求:', url);
  return { url, options };
});

// 添加响应拦截器
InterceptorManager.addResponseInterceptor((response) => {
  console.log('响应:', response);
  return response;
});

// 添加错误拦截器
InterceptorManager.addErrorInterceptor((error) => {
  console.error('错误:', error);
});
```

## 🎯 完整使用示例

### React组件中使用

```tsx
import React, { useState, useEffect } from 'react';
import { UserService, TemplateService, ApiError } from './services';

function MyComponent() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // 加载模板列表
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await TemplateService.list({ page: 1, page_size: 10 });
      setTemplates(result.list);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('加载失败:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 用户登录
  const handleLogin = async (mobile: string, password: string) => {
    try {
      const result = await UserService.login({ mobile, password });
      console.log('登录成功');
      // 刷新页面或跳转
    } catch (error) {
      console.error('登录失败');
    }
  };

  return (
    <div>
      {loading ? <div>加载中...</div> : <TemplateList templates={templates} />}
    </div>
  );
}
```

### 全局事件监听（在App.tsx中）

```tsx
import React, { useEffect } from 'react';
import { message } from 'antd';

function App() {
  useEffect(() => {
    // 监听错误提示
    const handleError = (event: CustomEvent) => {
      message.error(event.detail);
    };

    // 监听认证过期
    const handleAuthExpired = () => {
      message.warning('登录已过期，请重新登录');
      // 跳转到登录页
      window.location.href = '/login';
    };

    window.addEventListener('error:show', handleError as EventListener);
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('error:show', handleError as EventListener);
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  return <YourAppContent />;
}
```

## 📝 注意事项

1. **API地址配置**：默认为`http://localhost:8080`，生产环境需要修改`common.ts`中的`API_CONFIG.BASE_URL`

2. **Token存储**：Token存储在localStorage中，请确保HTTPS环境下使用

3. **错误处理**：建议在全局添加错误事件监听，统一处理错误提示

4. **类型安全**：所有接口都提供了完整的TypeScript类型定义，请充分利用类型检查

5. **向后兼容**：保留了旧版本的函数导出，但建议使用新的Service类

## 🔗 相关文档

- [后端API文档](../../../backend/docs/API.md)
- [JWT认证说明](../../../backend/docs/JWT_REFACTOR_SUMMARY.md)
- [数据库设计](../../../backend/docs/DATABASE_REFACTOR_SUMMARY.md)

## 📮 联系方式

如有问题，请联系开发团队。
