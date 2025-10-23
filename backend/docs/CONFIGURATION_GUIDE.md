# 系统配置文件使用指南

## 🎯 快速开始

### 1. 使用默认配置（开发环境）

配置文件已经创建在 `backend/config/config.yaml`，包含适合开发环境的默认设置。

直接运行：
```bash
cd backend
go run main.go
```

### 2. 自定义配置

编辑 `backend/config/config.yaml` 修改配置项。

## 📋 配置项说明

### 服务器配置

```yaml
server:
  host: "0.0.0.0"    # 监听地址
  port: 8080         # 端口号
  mode: "debug"      # debug 或 release
```

**host 选项：**
- `0.0.0.0` - 监听所有网卡（推荐）
- `127.0.0.1` - 仅本地访问
- `192.168.x.x` - 指定网卡

**mode 选项：**
- `debug` - 开发模式，详细日志
- `release` - 生产模式，性能优化

### 数据库配置

```yaml
database:
  host: "localhost"
  port: 3306
  user: "root"
  password: "123456"
  dbname: "context_engine"
  charset: "utf8mb4"
  max_idle_conns: 10       # 空闲连接数
  max_open_conns: 100      # 最大连接数
  conn_max_lifetime: 3600  # 连接生命周期（秒）
```

**连接池调优：**

| 环境 | max_idle_conns | max_open_conns | conn_max_lifetime |
|-----|---------------|----------------|-------------------|
| 开发 | 5-10 | 50-100 | 3600 (1小时) |
| 生产 | 10-20 | 100-200 | 7200 (2小时) |
| 高负载 | 20-50 | 200-500 | 3600 (1小时) |

### JWT 配置

```yaml
jwt:
  secret: "your-secret-key"  # ⚠️ 生产环境必须修改
  expire_hour: 24            # Token 有效期（小时）
```

**⚠️ 安全警告：**
- 生产环境必须修改默认密钥
- 建议使用 32+ 位随机字符串
- 定期更换密钥

生成随机密钥：
```bash
# macOS/Linux
openssl rand -base64 32

# 或使用在线工具
https://www.random.org/strings/
```

### 日志配置

```yaml
log:
  level: "debug"              # 日志级别
  file_path: "logs/app.log"   # 日志文件
  max_size: 100               # 单文件大小（MB）
  max_backups: 7              # 保留文件数
  max_age: 30                 # 保留天数
```

**日志级别：**
- `debug` - 所有信息（开发）
- `info` - 一般信息
- `warn` - 警告信息
- `error` - 仅错误（生产推荐）

## 🔧 不同环境配置

### 开发环境

使用现有的 `config.yaml`，已包含适合开发的配置。

### 测试环境

创建 `config.test.yaml`：
```yaml
server:
  port: 8081
  mode: "debug"

database:
  host: "test-db"
  dbname: "context_engine_test"
  max_idle_conns: 5
  max_open_conns: 50

log:
  level: "info"
```

### 生产环境

从模板创建：
```bash
cp backend/config/config.yaml.example backend/config/config.yaml
```

修改关键配置：
```yaml
server:
  mode: "release"

database:
  host: "prod-db.example.com"
  user: "app_user"
  password: "STRONG_PASSWORD"  # ⚠️ 修改
  max_idle_conns: 20
  max_open_conns: 200

jwt:
  secret: "RANDOM_32_CHAR_STRING"  # ⚠️ 修改

log:
  level: "error"
```

## 🐳 Docker 部署

### 方式一：挂载配置文件

`docker-compose.yml`:
```yaml
services:
  backend:
    image: cese-qoder-backend
    volumes:
      - ./config/config.yaml:/app/config/config.yaml:ro
```

### 方式二：环境变量（待实现）

```yaml
services:
  backend:
    image: cese-qoder-backend
    environment:
      - DB_HOST=mysql
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
```

## ⚙️ 配置加载机制

### 加载顺序

1. 尝试加载 `config/config.yaml`
2. 如果失败或不存在，使用默认配置
3. 记录配置来源到日志

### 启动日志示例

```json
{"level":"info","msg":"Configuration loaded from file","path":"config/config.yaml"}
{"level":"info","msg":"JWT configuration initialized"}
{"level":"info","msg":"Database connected successfully"}
```

### 使用默认配置时

```json
{"level":"info","msg":"Config file not found, using default config"}
```

## 🔍 故障排查

### 问题：配置文件未生效

**检查：**
1. 文件路径是否正确：`backend/config/config.yaml`
2. YAML 格式是否正确（注意缩进）
3. 查看启动日志确认配置来源

**验证 YAML 格式：**
```bash
# 使用 yamllint（如已安装）
yamllint backend/config/config.yaml

# 或在线验证
https://www.yamllint.com/
```

### 问题：数据库连接失败

**检查：**
1. 数据库是否运行
2. host 和 port 是否正确
3. 用户名和密码是否正确
4. 数据库是否存在

**测试连接：**
```bash
mysql -h localhost -P 3306 -u root -p context_engine
```

### 问题：JWT Token 无效

**检查：**
1. secret 是否与生成 Token 时一致
2. Token 是否过期（检查 expire_hour）

## 📊 性能调优

### 数据库连接池

**低并发（<100 QPS）：**
```yaml
max_idle_conns: 5
max_open_conns: 50
```

**中并发（100-1000 QPS）：**
```yaml
max_idle_conns: 10
max_open_conns: 100
```

**高并发（>1000 QPS）：**
```yaml
max_idle_conns: 20
max_open_conns: 200
```

### 日志优化

**生产环境：**
```yaml
log:
  level: "error"      # 减少日志量
  max_size: 100       # 控制文件大小
  max_backups: 10     # 保留足够历史
```

## 🔐 安全最佳实践

### 1. 保护配置文件

✅ **已做：**
- 添加到 `.gitignore`
- 提供 `.example` 模板

❌ **不要做：**
- 将生产配置提交到代码仓库
- 在日志中输出敏感信息
- 使用弱密码

### 2. JWT 密钥管理

✅ **推荐：**
- 使用 32+ 字符随机字符串
- 定期更换（如每季度）
- 使用密钥管理服务

❌ **避免：**
- 使用默认密钥
- 在多个环境共用密钥
- 硬编码在代码中

### 3. 数据库安全

✅ **推荐：**
- 使用强密码
- 限制数据库用户权限
- 启用 SSL 连接（生产环境）

## 🧪 验证配置

### 启动测试

```bash
cd backend
go run main.go
```

查看日志确认：
- ✅ "Configuration loaded from file"
- ✅ "JWT configuration initialized"
- ✅ "Database connected successfully"
- ✅ "Server started"

### 配置测试

创建测试脚本：
```bash
#!/bin/bash
# test-config.sh

echo "Testing configuration..."

# 测试服务器启动
timeout 5 go run main.go &
PID=$!
sleep 3

# 检查进程是否运行
if ps -p $PID > /dev/null; then
   echo "✅ Server started successfully"
   kill $PID
else
   echo "❌ Server failed to start"
   exit 1
fi
```

## 📚 更多资源

- [配置文件结构说明](./README.md)
- [集成文档](./CONFIG_INTEGRATION.md)
- [项目总结](./SUMMARY.md)

## 🆘 获取帮助

遇到问题？

1. 查看启动日志
2. 验证 YAML 格式
3. 检查文档中的故障排查章节
4. 查看项目 Issues

---

**配置系统已准备就绪！** 🎉
