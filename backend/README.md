# CESE-Qoder Backend

上下文工程六要素小工具的后端服务，基于 Golang + Hertz + MySQL + GORM 构建。

## 功能特性

- ✅ 用户注册、登录、密码管理
- ✅ 六要素模板的增删改查
- ✅ JWT Token 认证
- ✅ 统一的 API 响应格式
- ✅ 完善的错误处理
- ✅ 日志记录
- ✅ CORS 跨域支持
- ✅ 多条件查询和分页

## 技术栈

- **Web 框架**: [Hertz](https://github.com/cloudwego/hertz) - 高性能 HTTP 框架
- **ORM**: [GORM](https://gorm.io/) - Go 语言 ORM 库
- **数据库**: MySQL 8.0+
- **认证**: JWT (JSON Web Token)
- **密码加密**: bcrypt
- **日志**: Zap - 高性能日志库

## 快速开始

### 环境要求

- Go >= 1.19
- MySQL >= 8.0

### 安装依赖

```bash
go mod tidy
```

### 配置数据库

1. 确保 MySQL 服务已启动
2. 创建数据库：

```sql
CREATE DATABASE context_engine;
```

3. 导入初始化脚本：

```bash
mysql -u root -p context_engine < ../docker/init.sql
```

### 运行服务

```bash
# 开发模式
go run main.go

# 编译运行
go build -o bin/cese-qoder main.go
./bin/cese-qoder
```

服务将在 `http://localhost:8080` 启动。

## 项目结构

```
backend/
├── main.go                 # 主入口文件
├── go.mod                  # 依赖管理
├── config/                 # 配置文件
│   ├── config.go          # 配置结构体
│   └── db.go              # 数据库配置
├── models/                 # 数据模型
│   ├── user.go            # 用户模型
│   └── template.go        # 模板模型
├── api/                    # API 层
│   ├── handlers/          # 处理器
│   │   ├── user_handler.go
│   │   └── template_handler.go
│   └── routes/            # 路由
│       └── routes.go
├── services/               # 业务逻辑
│   ├── user_service.go
│   └── template_service.go
├── middleware/             # 中间件
│   ├── auth.go            # 认证中间件
│   ├── logger.go          # 日志中间件
│   ├── cors.go            # CORS 中间件
│   └── error.go           # 错误处理中间件
├── utils/                  # 工具函数
│   ├── response.go        # 统一响应
│   ├── jwt.go             # JWT 工具
│   ├── crypto.go          # 加密工具
│   ├── validator.go       # 验证工具
│   └── logger.go          # 日志工具
├── bin/                    # 编译输出
├── logs/                   # 日志文件
└── docs/                   # 文档
    └── API.md             # API 文档
```

## API 文档

详细的 API 文档请查看: [API.md](./docs/API.md)

### 主要接口

#### 用户接口
- `POST /api/v1/user/register` - 用户注册
- `POST /api/v1/user/login` - 用户登录
- `POST /api/v1/user/change-password` - 修改密码（需认证）
- `GET /api/v1/user/info` - 获取用户信息（需认证）

#### 模板接口
- `POST /api/v1/template` - 创建模板（需认证）
- `GET /api/v1/template` - 查询模板列表（需认证）
- `GET /api/v1/template/:id` - 获取模板详情（需认证）
- `PUT /api/v1/template/:id` - 更新模板（需认证）
- `DELETE /api/v1/template/:id` - 删除模板（需认证）

## 配置说明

默认配置在 `config/config.go` 中定义：

```go
Server:
  Host: 0.0.0.0
  Port: 8080
  Mode: debug

Database:
  Host: localhost
  Port: 3306
  User: root
  Password: 123456
  DBName: context_engine
  Charset: utf8mb4

JWT:
  Secret: cese-qoder-secret-key-change-in-production
  ExpireHour: 24
```

生产环境建议通过环境变量或配置文件覆盖默认值。

## 开发指南

### 添加新的 API 接口

1. 在 `services/` 中定义业务逻辑
2. 在 `api/handlers/` 中创建处理器
3. 在 `api/routes/routes.go` 中注册路由

### 日志使用

```go
import "github.com/zsy619/cese-qoder/backend/utils"

utils.Info("用户登录", zap.String("phone", phone))
utils.Error("数据库错误", zap.Error(err))
```

### 错误处理

使用统一的响应格式：

```go
utils.ResponseError(&ctx, c, utils.CodeInvalidParams, "参数错误")
utils.Success(&ctx, c, data)
```

## 测试

```bash
# 运行所有测试
go test ./...

# 运行特定包的测试
go test ./services/...

# 带覆盖率
go test -cover ./...
```

## Docker 部署

```bash
# 构建镜像
docker build -t cese-qoder-backend -f ../docker/Dockerfile.backend .

# 运行容器
docker run -p 8080:8080 cese-qoder-backend
```

## 常见问题

### 1. 数据库连接失败

检查数据库配置是否正确，确保 MySQL 服务已启动。

### 2. Token 认证失败

确保请求头中正确设置了 Authorization：`Bearer <token>`

### 3. 密码验证失败

密码必须是 8-16 位，包含大小写字母、数字和特殊字符。

## 许可证

MIT License
