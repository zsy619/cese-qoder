# 配置文件说明

## 配置文件位置

配置文件位于 `backend/config/config.yaml`

## 配置文件结构

### 1. 服务器配置 (server)

```yaml
server:
  host: "0.0.0.0"      # 监听地址
  port: 8080           # 监听端口
  mode: "debug"        # 运行模式: debug | release
```

- **host**: 服务器监听地址
  - `0.0.0.0`: 监听所有网卡（推荐用于生产环境）
  - `127.0.0.1`: 仅本地访问
  - `192.168.x.x`: 指定网卡地址

- **port**: 服务器端口号，默认 8080

- **mode**: 运行模式
  - `debug`: 开发模式，输出详细日志
  - `release`: 生产模式，优化性能

### 2. 数据库配置 (database)

```yaml
database:
  host: "localhost"           # 数据库主机
  port: 3306                  # 数据库端口
  user: "root"                # 用户名
  password: "123456"          # 密码
  dbname: "context_engine"    # 数据库名
  charset: "utf8mb4"          # 字符集
  max_idle_conns: 10          # 最大空闲连接数
  max_open_conns: 100         # 最大打开连接数
  conn_max_lifetime: 3600     # 连接最大生命周期（秒）
```

- **连接池配置**:
  - `max_idle_conns`: 连接池中最大空闲连接数
  - `max_open_conns`: 最大打开连接数
  - `conn_max_lifetime`: 连接可复用的最长时间（秒）

### 3. JWT 配置 (jwt)

```yaml
jwt:
  secret: "your-secret-key"   # JWT 密钥（必须修改）
  expire_hour: 24             # Token 过期时间（小时）
```

**⚠️ 安全提示**:
- 生产环境必须修改 `secret` 为强随机字符串
- 建议使用至少 32 位的随机字符串
- 不要将生产环境的密钥提交到代码仓库

### 4. 日志配置 (log)

```yaml
log:
  level: "debug"              # 日志级别
  file_path: "logs/app.log"   # 日志文件路径
  max_size: 100               # 单个文件最大大小（MB）
  max_backups: 7              # 保留的旧文件数量
  max_age: 30                 # 保留文件的最大天数
```

- **level**: 日志级别
  - `debug`: 调试信息（开发环境）
  - `info`: 一般信息
  - `warn`: 警告信息
  - `error`: 错误信息（生产环境推荐）

## 环境配置示例

### 开发环境

```yaml
server:
  host: "0.0.0.0"
  port: 8080
  mode: "debug"

database:
  host: "localhost"
  port: 3306
  user: "root"
  password: "123456"
  dbname: "context_engine"
  charset: "utf8mb4"
  max_idle_conns: 5
  max_open_conns: 50
  conn_max_lifetime: 3600

jwt:
  secret: "dev-secret-key"
  expire_hour: 24

log:
  level: "debug"
  file_path: "logs/app.log"
  max_size: 50
  max_backups: 3
  max_age: 7
```

### 生产环境

```yaml
server:
  host: "0.0.0.0"
  port: 8080
  mode: "release"

database:
  host: "prod-db.example.com"
  port: 3306
  user: "app_user"
  password: "STRONG_PASSWORD_HERE"
  dbname: "context_engine"
  charset: "utf8mb4"
  max_idle_conns: 20
  max_open_conns: 200
  conn_max_lifetime: 7200

jwt:
  secret: "CHANGE_THIS_TO_RANDOM_STRING_32_CHARS_OR_MORE"
  expire_hour: 24

log:
  level: "error"
  file_path: "logs/app.log"
  max_size: 100
  max_backups: 10
  max_age: 30
```

## 使用方式

### 1. 默认配置

如果 `config/config.yaml` 文件不存在，系统会使用内置的默认配置。

### 2. 从文件加载

将配置文件放在 `backend/config/config.yaml`，系统启动时会自动加载。

### 3. 配置优先级

1. 配置文件 (`config/config.yaml`)
2. 默认配置（代码中定义）

## 配置更新

修改配置文件后，需要重启服务才能生效。

## 安全建议

1. **不要将生产环境配置提交到代码仓库**
2. **使用环境变量或密钥管理服务存储敏感信息**
3. **定期更换 JWT 密钥**
4. **使用强密码保护数据库**
5. **生产环境使用 `release` 模式**
