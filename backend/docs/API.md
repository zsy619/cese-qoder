# CESE-Qoder Backend API 文档

## 基本信息

- **Base URL**: `http://localhost:8080`
- **API 版本**: v1
- **API 前缀**: `/api/v1`

## 认证说明

除了公开接口（注册、登录）外，其他接口都需要在请求头中携带 JWT Token：

```
Authorization: Bearer <your_token_here>
```

## 响应格式

所有接口返回统一的 JSON 格式：

```json
{
  "code": 0,          // 状态码：0 表示成功，非 0 表示失败
  "message": "成功",   // 响应消息
  "data": {}          // 响应数据
}
```

## 错误码说明

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 400 | 参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 501 | 数据库错误 |
| 1001 | 手机号已存在 |
| 1002 | 手机号不存在 |
| 1003 | 密码错误 |
| 1004 | 密码强度不足 |
| 1005 | 手机号格式错误 |
| 1006 | Token 无效 |
| 1007 | Token 过期 |
| 2001 | 模板不存在 |
| 2002 | 无权操作该模板 |

---

## 用户接口

### 1. 用户注册

**接口**: `POST /api/v1/user/register`

**权限**: 公开接口

**请求示例**:
```json
{
  "phone": "13800138000",
  "password": "Test@123456"
}
```

**参数说明**:
- `phone` (string, 必填): 手机号码，11位数字，格式 `1[3-9]\d{9}`
- `password` (string, 必填): 密码，8-16位，必须包含大小写字母、数字和特殊字符

**响应示例**:
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "created_at": "2025-10-21T16:00:00Z",
    "updated_at": "2025-10-21T16:00:00Z"
  }
}
```

### 2. 用户登录

**接口**: `POST /api/v1/user/login`

**权限**: 公开接口

**请求示例**:
```json
{
  "phone": "13800138000",
  "password": "Test@123456"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "created_at": "2025-10-21T16:00:00Z",
      "updated_at": "2025-10-21T16:00:00Z"
    }
  }
}
```

### 3. 修改密码

**接口**: `POST /api/v1/user/change-password`

**权限**: 需要认证

**请求示例**:
```json
{
  "phone": "13800138000",
  "old_password": "Test@123456",
  "new_password": "NewTest@123456"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "密码修改成功",
  "data": null
}
```

### 4. 获取用户信息

**接口**: `GET /api/v1/user/info`

**权限**: 需要认证

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "phone": "13800138000",
    "created_at": "2025-10-21T16:00:00Z",
    "updated_at": "2025-10-21T16:00:00Z"
  }
}
```

---

## 模板接口

### 1. 创建模板

**接口**: `POST /api/v1/template`

**权限**: 需要认证

**请求示例**:
```json
{
  "topic": "写作助手",
  "task_objective": "帮助用户生成高质量的文章内容",
  "ai_role": "写作专家",
  "my_role": "内容创作者",
  "key_information": "需要创作的文章主题和目标读者",
  "behavior_rule": "使用清晰的结构和生动的语言",
  "delivery_format": "Markdown格式"
}
```

**参数说明**:
- `topic` (string, 必填): 主题
- `task_objective` (string): 任务目标
- `ai_role` (string): AI的角色
- `my_role` (string): 我的角色
- `key_information` (string): 关键信息
- `behavior_rule` (string): 行为规则
- `delivery_format` (string): 交付格式

**响应示例**:
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "topic": "写作助手",
    "task_objective": "帮助用户生成高质量的文章内容",
    "ai_role": "写作专家",
    "my_role": "内容创作者",
    "key_information": "需要创作的文章主题和目标读者",
    "behavior_rule": "使用清晰的结构和生动的语言",
    "delivery_format": "Markdown格式",
    "created_at": "2025-10-21T16:00:00Z",
    "updated_at": "2025-10-21T16:00:00Z"
  }
}
```

### 2. 查询模板列表

**接口**: `GET /api/v1/template`

**权限**: 需要认证

**查询参数**:
- `page` (int): 页码，默认 1
- `page_size` (int): 每页数量，默认 15，最大 100
- `topic` (string): 主题（模糊匹配）
- `task_objective` (string): 任务目标（模糊匹配）
- `ai_role` (string): AI角色（模糊匹配）
- `my_role` (string): 我的角色（模糊匹配）
- `key_information` (string): 关键信息（模糊匹配）
- `behavior_rule` (string): 行为规则（模糊匹配）
- `delivery_format` (string): 交付格式（模糊匹配）

**请求示例**:
```
GET /api/v1/template?page=1&page_size=10&topic=写作
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "topic": "写作助手",
        "task_objective": "帮助用户生成高质量的文章内容",
        "ai_role": "写作专家",
        "my_role": "内容创作者",
        "key_information": "需要创作的文章主题和目标读者",
        "behavior_rule": "使用清晰的结构和生动的语言",
        "delivery_format": "Markdown格式",
        "created_at": "2025-10-21T16:00:00Z",
        "updated_at": "2025-10-21T16:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10
  }
}
```

### 3. 获取模板详情

**接口**: `GET /api/v1/template/:id`

**权限**: 需要认证

**路径参数**:
- `id` (int): 模板ID

**请求示例**:
```
GET /api/v1/template/1
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "user_id": 1,
    "topic": "写作助手",
    "task_objective": "帮助用户生成高质量的文章内容",
    "ai_role": "写作专家",
    "my_role": "内容创作者",
    "key_information": "需要创作的文章主题和目标读者",
    "behavior_rule": "使用清晰的结构和生动的语言",
    "delivery_format": "Markdown格式",
    "created_at": "2025-10-21T16:00:00Z",
    "updated_at": "2025-10-21T16:00:00Z"
  }
}
```

### 4. 更新模板

**接口**: `PUT /api/v1/template/:id`

**权限**: 需要认证（仅能更新自己的模板）

**路径参数**:
- `id` (int): 模板ID

**请求示例**:
```json
{
  "topic": "写作助手（更新版）",
  "task_objective": "帮助用户生成更高质量的文章内容",
  "ai_role": "资深写作专家",
  "my_role": "内容创作者",
  "key_information": "文章主题、目标读者、写作风格",
  "behavior_rule": "使用清晰的结构、生动的语言和丰富的案例",
  "delivery_format": "Markdown格式"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1,
    "user_id": 1,
    "topic": "写作助手（更新版）",
    "task_objective": "帮助用户生成更高质量的文章内容",
    "ai_role": "资深写作专家",
    "my_role": "内容创作者",
    "key_information": "文章主题、目标读者、写作风格",
    "behavior_rule": "使用清晰的结构、生动的语言和丰富的案例",
    "delivery_format": "Markdown格式",
    "created_at": "2025-10-21T16:00:00Z",
    "updated_at": "2025-10-21T16:30:00Z"
  }
}
```

### 5. 删除模板

**接口**: `DELETE /api/v1/template/:id`

**权限**: 需要认证（仅能删除自己的模板）

**路径参数**:
- `id` (int): 模板ID

**请求示例**:
```
DELETE /api/v1/template/1
```

**响应示例**:
```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

---

## 健康检查

### 健康检查

**接口**: `GET /health`

**权限**: 公开接口

**响应示例**:
```json
{
  "status": "ok"
}
```

---

## 测试示例

### 使用 curl 测试

#### 1. 用户注册
```bash
curl -X POST http://localhost:8080/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "Test@123456"
  }'
```

#### 2. 用户登录
```bash
curl -X POST http://localhost:8080/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "Test@123456"
  }'
```

#### 3. 创建模板（需要先登录获取 token）
```bash
TOKEN="your_token_here"

curl -X POST http://localhost:8080/api/v1/template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "topic": "写作助手",
    "task_objective": "帮助用户生成高质量的文章内容",
    "ai_role": "写作专家",
    "my_role": "内容创作者",
    "key_information": "需要创作的文章主题和目标读者",
    "behavior_rule": "使用清晰的结构和生动的语言",
    "delivery_format": "Markdown格式"
  }'
```

#### 4. 查询模板列表
```bash
curl -X GET "http://localhost:8080/api/v1/template?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. 获取模板详情
```bash
curl -X GET http://localhost:8080/api/v1/template/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### 6. 更新模板
```bash
curl -X PUT http://localhost:8080/api/v1/template/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "topic": "写作助手（更新版）",
    "task_objective": "帮助用户生成更高质量的文章内容",
    "ai_role": "资深写作专家",
    "my_role": "内容创作者",
    "key_information": "文章主题、目标读者、写作风格",
    "behavior_rule": "使用清晰的结构、生动的语言和丰富的案例",
    "delivery_format": "Markdown格式"
  }'
```

#### 7. 删除模板
```bash
curl -X DELETE http://localhost:8080/api/v1/template/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 注意事项

1. **密码要求**：密码必须是 8-16 位，包含大写字母、小写字母、数字和特殊字符（!@#$%^&*）
2. **手机号格式**：必须是中国大陆手机号格式，1[3-9]开头 + 9位数字
3. **Token 有效期**：Token 默认有效期为 24 小时
4. **分页限制**：每页最多返回 100 条数据
5. **权限控制**：用户只能操作自己创建的模板
