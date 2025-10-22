# 后端开发任务清单 (TodoList-后端)

## 📋 项目概述

基于 Golang + Hertz + MySQL + GORM 构建上下文工程六要素小工具的后端服务，提供用户管理和六要素模板管理的完整功能。

---

## 🎯 总体目标

- ✅ 完成用户注册、登录、密码管理功能
- ✅ 完成上下文工程六要素的增删改查功能
- ✅ 实现统一的 API 返回格式和错误处理
- ✅ 实现登录拦截器和权限验证
- ✅ 实现统一的日志处理
- ✅ 数据库表设计符合规范

---

## 📦 阶段一：项目基础架构搭建

### 1.1 项目初始化与依赖管理
- [ ] 初始化 Go Module，项目名称: `github.com/zsy619/cese-qoder/backend`，Go 版本 >= 1.19
- [ ] 安装核心依赖：Hertz、GORM、MySQL驱动、bcrypt、JWT、Viper、Zap、Validator

### 1.2 项目目录结构
- [ ] 创建目录：`config/`、`models/`、`api/handlers/`、`api/routes/`、`services/`、`middleware/`、`utils/`、`docs/`
- [ ] 创建核心文件：`main.go`、`config/config.go`、`config/db.go`等

---

## 📊 阶段二：数据库设计与初始化

### 2.1 用户表 (cese_user)
```sql
DROP TABLE IF EXISTS `cese_user`;
CREATE TABLE `cese_user` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(11) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 2.2 六要素模板表 (cese_template)
```sql
DROP TABLE IF EXISTS `cese_template`;
CREATE TABLE `cese_template` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `task_objective` TEXT,
  `ai_role` TEXT,
  `my_role` TEXT,
  `key_information` TEXT,
  `behavior_rule` TEXT,
  `delivery_format` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_topic` (`topic`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `cese_user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='六要素模板表';
```

### 2.3 更新初始化脚本
- [ ] 更新 `docker/init.sql`，删除旧表，创建新的 `cese_user` 和 `cese_template` 表

---

## 🛠️ 阶段三：核心工具类开发

### 3.1 统一响应格式 (`utils/response.go`)
- [ ] 定义 Response 结构体（Code、Message、Data）
- [ ] 实现 Success()、Error()、PageSuccess() 方法

### 3.2 JWT 工具 (`utils/jwt.go`)
- [ ] 定义 Claims 结构体（UserID 使用手机号码）
- [ ] 实现 GenerateToken()、ParseToken()、RefreshToken()

### 3.3 密码加密工具 (`utils/crypto.go`)
- [ ] 实现 HashPassword()（使用 bcrypt）
- [ ] 实现 CheckPassword()

### 3.4 参数验证工具 (`utils/validator.go`)
- [ ] 实现 ValidatePhone()：正则 `^1[3-9]\d{9}$`
- [ ] 实现 ValidatePassword()：8-16位，包含大小写、数字、特殊字符

### 3.5 日志工具 (`utils/logger.go`)
- [ ] 初始化 Zap 日志，支持文件和控制台输出
- [ ] 实现日志轮转，支持 Debug/Info/Warn/Error 级别

---

## 🗄️ 阶段四：数据库配置与模型定义

### 4.1 数据库连接 (`config/db.go`)
- [ ] 定义 DBConfig 结构体
- [ ] 实现 InitDB()、AutoMigrate()、CloseDB()

### 4.2 配置管理 (`config/config.go`)
- [ ] 定义 AppConfig（Server、DB、JWT、Log）
- [ ] 使用 Viper 读取 `config.yaml`

### 4.3 用户模型 (`models/user.go`)
- [ ] 定义 User 结构体（ID、Phone、Password、CreatedAt、UpdatedAt）
- [ ] 实现 TableName() 返回 `cese_user`
- [ ] 实现 BeforeCreate Hook 进行密码加密

### 4.4 模板模型 (`models/template.go`)
- [ ] 定义 Template 结构体（ID、UserID、Topic、六要素字段、时间字段）
- [ ] 实现 TableName() 返回 `cese_template`

---

## 💼 阶段五：业务逻辑层开发

### 5.1 用户服务 (`services/user_service.go`)
- [ ] **注册 (Register)**：验证手机号和密码强度、检查重复、加密密码、插入数据库
- [ ] **登录 (Login)**：验证手机号、查询用户、验证密码、生成 JWT Token
- [ ] **修改密码 (ChangePassword)**：验证旧密码、验证新密码强度、加密并更新
- [ ] **获取用户信息 (GetUserInfo)**：从 Token 获取用户ID、查询并返回信息

### 5.2 模板服务 (`services/template_service.go`)
- [ ] **创建模板 (CreateTemplate)**：获取用户ID、验证字段、插入数据库
- [ ] **查询模板 (GetTemplates)**：支持多条件模糊查询、用户ID精确匹配、分页（默认15条）、按创建时间倒序
- [ ] **获取详情 (GetTemplateByID)**：根据ID查询、验证归属
- [ ] **更新模板 (UpdateTemplate)**：验证归属、更新数据
- [ ] **删除模板 (DeleteTemplate)**：验证归属、执行删除

---

## 🌐 阶段六：API 处理器开发

### 6.1 用户处理器 (`api/handlers/user_handler.go`)
- [ ] **POST /api/v1/user/register**：RegisterHandler
- [ ] **POST /api/v1/user/login**：LoginHandler
- [ ] **POST /api/v1/user/change-password**：ChangePasswordHandler（需认证）
- [ ] **GET /api/v1/user/info**：GetUserInfoHandler（需认证）

### 6.2 模板处理器 (`api/handlers/template_handler.go`)
- [ ] **POST /api/v1/template**：CreateTemplateHandler（需认证）
- [ ] **GET /api/v1/template**：GetTemplatesHandler（需认证，支持分页和多条件查询）
- [ ] **GET /api/v1/template/:id**：GetTemplateByIDHandler（需认证）
- [ ] **PUT /api/v1/template/:id**：UpdateTemplateHandler（需认证）
- [ ] **DELETE /api/v1/template/:id**：DeleteTemplateHandler（需认证）

---

## 🔐 阶段七：中间件开发

### 7.1 认证中间件 (`middleware/auth.go`)
- [ ] 实现 JWT 认证中间件：验证 Token、解析用户信息、存入 Context

### 7.2 日志中间件 (`middleware/logger.go`)
- [ ] 记录请求方法、路径、IP、响应状态码、耗时

### 7.3 CORS 中间件 (`middleware/cors.go`)
- [ ] 允许前端跨域访问（localhost:3000）

### 7.4 错误处理中间件 (`middleware/error.go`)
- [ ] 全局捕获 panic、记录错误、返回统一响应

---

## 🚀 阶段八：路由注册与主程序

### 8.1 路由注册 (`api/routes/routes.go`)
- [ ] 定义 API 版本分组 `/api/v1`
- [ ] 注册用户路由（公开 + 认证）
- [ ] 注册模板路由（需认证）

### 8.2 主程序 (`main.go`)
- [ ] 加载配置、初始化日志、初始化数据库、执行迁移
- [ ] 创建 Hertz 实例、注册中间件、注册路由
- [ ] 启动服务器（监听 8080）、优雅关闭

---

## 🧪 阶段九：测试与验证

### 9.1 单元测试
- [ ] 编写工具函数测试：`validator_test.go`、`crypto_test.go`、`jwt_test.go`
- [ ] 编写服务层测试：`user_service_test.go`、`template_service_test.go`

### 9.2 集成测试
- [ ] 使用 Postman/curl 测试用户注册、登录、修改密码、获取信息
- [ ] 测试模板的创建、查询、更新、删除

### 9.3 性能测试
- [ ] 使用 Apache Bench 或 wrk 进行压力测试
- [ ] 优化慢查询

---

## 📝 阶段十：文档与部署

### 10.1 API 文档
- [ ] 编写 API 接口文档 `docs/api.md`
- [ ] 包含请求示例、响应示例、错误码说明

### 10.2 Docker 部署
- [ ] 编写 `backend/Dockerfile`
- [ ] 更新 `docker-compose.yml` 配置后端服务
- [ ] 测试 Docker 环境启动

### 10.3 部署验证
- [ ] 验证 Docker 环境下前后端联调
- [ ] 验证数据库连接和数据持久化

---

## ✅ 验收标准

1. **功能完整性**
   - ✅ 用户注册、登录、修改密码、获取信息功能正常
   - ✅ 模板的增删改查功能正常
   - ✅ 分页查询、多条件筛选正常

2. **安全性**
   - ✅ 密码使用 bcrypt 加密存储
   - ✅ JWT Token 认证机制正常
   - ✅ 手机号和密码验证规则符合要求

3. **代码质量**
   - ✅ 统一的错误处理和响应格式
   - ✅ 完善的日志记录
   - ✅ 代码符合 Go 规范

4. **性能要求**
   - ✅ API 响应时间 < 200ms
   - ✅ 支持并发 100+ 请求

5. **部署要求**
   - ✅ Docker 环境一键启动
   - ✅ 配置文件外部化
   - ✅ 数据库初始化自动执行

---

## 📌 注意事项

1. **表命名规范**：表名使用单数，前缀为 `cese_`
2. **用户ID使用手机号**：登录后使用手机号码作为用户标识
3. **密码安全**：8-16位，包含大小写字母、数字、特殊字符
4. **手机号验证**：符合中国大陆手机号格式 `1[3-9]\d{9}`
5. **分页默认值**：每页15条记录
6. **排序规则**：默认按创建时间倒序

---

## 🔗 相关文档

- [API 接口文档](./api.md)
- [数据库设计文档](./database.md)
- [部署指南](../README.md#部署指南)
- [提示词文档](./C001-提示词-后端.md)
