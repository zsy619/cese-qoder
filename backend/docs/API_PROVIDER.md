# API Provider配置接口文档

## 📋 概述

API Provider配置功能允许用户管理多个大模型API提供商的配置信息，支持OpenAI、DeepSeek、Ollama等多种类型的API。

## 🎯 功能特性

- ✅ 支持多种API Provider（OpenAI、DeepSeek、Ollama等）
- ✅ API Key加密存储（使用SM4国密算法）
- ✅ 按用户隔离数据
- ✅ 支持启用/禁用状态管理
- ✅ 支持按类型过滤查询
- ✅ API Key自动脱敏显示

## 🗄️ 数据库表结构

### cese_api_provider

```sql
CREATE TABLE `cese_api_provider` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT 'Provider名称',
  `api_key` VARCHAR(255) NOT NULL COMMENT 'API密钥（加密存储）',
  `api_secret` VARCHAR(255) DEFAULT NULL COMMENT 'API Secret（可选，加密存储）',
  `api_url` VARCHAR(500) NOT NULL COMMENT 'API访问地址',
  `api_type` VARCHAR(50) NOT NULL COMMENT 'API类型',
  `api_model` VARCHAR(100) NOT NULL COMMENT '使用的模型名称',
  `api_version` VARCHAR(20) DEFAULT 'v1' COMMENT 'API版本',
  `api_status` TINYINT(1) DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `api_remark` TEXT COMMENT '备注说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_api_type` (`api_type`),
  INDEX `idx_status` (`api_status`),
  CONSTRAINT `fk_provider_user` FOREIGN KEY (`user_id`) REFERENCES `cese_user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 📡 API接口

### 1. 创建API Provider

**接口**：`POST /api/v1/api-provider`

**认证**：需要（Bearer Token）

**请求体**：
```json
{
  "name": "DeepSeek",
  "api_key": "sk-xxxxx",
  "api_secret": "optional-secret",
  "api_url": "https://api.deepseek.com",
  "api_type": "deepseek",
  "api_model": "deepseek-chat",
  "api_version": "v1",
  "api_remark": "DeepSeek官方API"
}
```

**响应**：
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "DeepSeek",
    "api_key_mask": "sk-x****xxxx",
    "api_url": "https://api.deepseek.com",
    "api_type": "deepseek",
    "api_model": "deepseek-chat",
    "api_version": "v1",
    "api_status": 1,
    "api_remark": "DeepSeek官方API",
    "created_at": "2025-10-23T10:00:00Z",
    "updated_at": "2025-10-23T10:00:00Z"
  }
}
```

### 2. 获取Provider列表

**接口**：`GET /api/v1/api-provider`

**认证**：需要（Bearer Token）

**查询参数**：
- `api_type`（可选）：按类型过滤（如：openai、deepseek、ollama）
- `status`（可选）：按状态过滤（1-启用，0-禁用）

**请求示例**：
```
GET /api/v1/api-provider?api_type=deepseek&status=1
```

**响应**：
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "total": 2,
    "list": [
      {
        "id": 1,
        "name": "DeepSeek",
        "api_key_mask": "sk-x****xxxx",
        "api_type": "deepseek",
        "api_model": "deepseek-chat",
        "api_status": 1
      },
      {
        "id": 2,
        "name": "Ollama本地",
        "api_key_mask": "loca****",
        "api_type": "ollama",
        "api_model": "llama2",
        "api_status": 1
      }
    ]
  }
}
```

### 3. 获取单个Provider

**接口**：`GET /api/v1/api-provider/:id`

**认证**：需要（Bearer Token）

**路径参数**：
- `id`：Provider ID

**响应**：
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "DeepSeek",
    "api_key_mask": "sk-x****xxxx",
    "api_url": "https://api.deepseek.com",
    "api_type": "deepseek",
    "api_model": "deepseek-chat",
    "api_version": "v1",
    "api_status": 1,
    "created_at": "2025-10-23T10:00:00Z",
    "updated_at": "2025-10-23T10:00:00Z"
  }
}
```

### 4. 更新Provider

**接口**：`PUT /api/v1/api-provider/:id`

**认证**：需要（Bearer Token）

**请求体**（所有字段可选）：
```json
{
  "name": "新名称",
  "api_key": "新密钥",
  "api_model": "gpt-4",
  "api_status": 0
}
```

**响应**：
```json
{
  "code": 0,
  "message": "更新成功",
  "data": null
}
```

### 5. 删除Provider

**接口**：`DELETE /api/v1/api-provider/:id`

**认证**：需要（Bearer Token）

**响应**：
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

## 🔐 安全特性

### API Key加密存储

- 使用SM4国密算法加密存储API Key和Secret
- 数据库中存储的是加密后的密文
- 响应时自动脱敏显示（如：sk-x****xxxx）

### 数据隔离

- 每个用户只能访问自己的Provider配置
- 通过JWT Token识别用户身份
- 数据库外键约束确保数据完整性

## 📊 支持的API类型

| 类型 | api_type | 示例URL | 备注 |
|------|----------|---------|------|
| OpenAI | `openai` | https://api.openai.com | 官方API |
| DeepSeek | `deepseek` | https://api.deepseek.com | 国产大模型 |
| Ollama | `ollama` | http://localhost:11434 | 本地部署 |
| 自定义 | `custom` | 自定义 | 兼容OpenAI格式 |

## 🧪 使用示例

### Curl示例

```bash
# 1. 登录获取Token
TOKEN=$(curl -X POST http://localhost:8080/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"Test@123456"}' \
  | jq -r '.data.token')

# 2. 创建Provider
curl -X POST http://localhost:8080/api/v1/api-provider \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DeepSeek",
    "api_key": "sk-your-key",
    "api_url": "https://api.deepseek.com",
    "api_type": "deepseek",
    "api_model": "deepseek-chat"
  }'

# 3. 查询列表
curl -X GET "http://localhost:8080/api/v1/api-provider?api_type=deepseek" \
  -H "Authorization: Bearer $TOKEN"

# 4. 更新Provider
curl -X PUT http://localhost:8080/api/v1/api-provider/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"api_status": 0}'

# 5. 删除Provider
curl -X DELETE http://localhost:8080/api/v1/api-provider/1 \
  -H "Authorization: Bearer $TOKEN"
```

## 📝 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证 |
| 404 | Provider不存在 |
| 500 | 服务器错误 |

## ✅ 完成清单

- [x] 数据库表设计
- [x] 数据模型定义
- [x] 服务层实现
- [x] API处理器实现
- [x] 路由注册
- [x] API Key加密存储
- [x] 数据脱敏
- [x] 单元测试
- [x] API文档

---

**API Provider配置功能已完成！** 🎉
