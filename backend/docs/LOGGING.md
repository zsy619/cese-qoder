# 日志系统配置指南

## 📋 概述

项目使用 **Uber Zap** 高性能日志库，支持结构化日志、日志轮转、多级别输出等功能。

## 🎯 日志特性

- ✅ **结构化日志** - JSON格式，便于日志分析
- ✅ **多输出** - 同时输出到控制台和文件
- ✅ **日志轮转** - 自动按大小、时间轮转
- ✅ **日志压缩** - 自动压缩旧日志节省空间
- ✅ **多级别** - debug/info/warn/error 四个级别
- ✅ **调用栈** - error级别自动记录调用栈

## ⚙️ 配置说明

### 配置文件位置

`backend/config/config.yaml`

### 配置项

```yaml
log:
  level: "debug"                # 日志级别
  file_path: "logs/app.log"     # 日志文件路径
  max_size: 100                 # 单个文件最大大小（MB）
  max_backups: 7                # 保留的旧文件数量
  max_age: 30                   # 保留文件的最大天数（天）
```

### 参数详解

#### 1. level - 日志级别

控制输出的日志详细程度。

| 级别 | 说明 | 包含的日志 | 使用场景 |
|------|------|-----------|---------|
| `debug` | 调试级别 | debug + info + warn + error | 开发环境 |
| `info` | 信息级别 | info + warn + error | 测试环境 |
| `warn` | 警告级别 | warn + error | 预生产环境 |
| `error` | 错误级别 | 仅 error | 生产环境 |

**示例：**
```yaml
# 开发环境
log:
  level: "debug"

# 生产环境
log:
  level: "error"
```

#### 2. file_path - 日志文件路径

指定日志文件的存储位置。

**默认值：** `logs/app.log`

**路径规则：**
- 相对路径：相对于应用运行目录
- 绝对路径：指定完整路径

**示例：**
```yaml
# 相对路径（推荐）
file_path: "logs/app.log"

# 绝对路径
file_path: "/var/log/cese-qoder/app.log"

# 按日期组织
file_path: "logs/2025/10/app.log"
```

#### 3. max_size - 单个文件最大大小

单个日志文件达到此大小后自动轮转。

**单位：** MB（兆字节）
**默认值：** 100
**推荐值：** 50-200

**示例：**
```yaml
# 开发环境（日志量小）
max_size: 50

# 生产环境（日志量大）
max_size: 100

# 高流量环境
max_size: 200
```

#### 4. max_backups - 保留的旧文件数量

保留多少个历史日志文件。

**默认值：** 7
**推荐值：** 3-30

**轮转逻辑：**
```
app.log           # 当前日志
app.log.1         # 最近的备份
app.log.2         # 次近的备份
app.log.3         # ...
app.log.7         # 最旧的备份（超出会被删除）
```

**示例：**
```yaml
# 开发环境（保留少量）
max_backups: 3

# 生产环境（保留更多）
max_backups: 10

# 长期存档
max_backups: 30
```

#### 5. max_age - 保留文件的最大天数

超过此天数的日志文件会被自动删除。

**单位：** 天
**默认值：** 30
**推荐值：** 7-90

**示例：**
```yaml
# 短期保留（1周）
max_age: 7

# 中期保留（1个月）
max_age: 30

# 长期保留（3个月）
max_age: 90
```

**优先级说明：**
- 如果同时配置了 `max_backups` 和 `max_age`
- 满足任一条件的文件都会被删除

## 📊 不同环境配置推荐

### 开发环境

```yaml
log:
  level: "debug"              # 显示所有日志
  file_path: "logs/app.log"
  max_size: 50                # 较小的文件
  max_backups: 3              # 保留较少
  max_age: 7                  # 1周
```

**特点：**
- 详细的调试信息
- 快速轮转，节省磁盘
- 短期保留

### 测试环境

```yaml
log:
  level: "info"               # 过滤调试信息
  file_path: "logs/app.log"
  max_size: 100
  max_backups: 5
  max_age: 14                 # 2周
```

**特点：**
- 过滤过于详细的debug日志
- 保留足够用于问题追踪
- 中等保留时间

### 生产环境

```yaml
log:
  level: "error"              # 仅记录错误
  file_path: "logs/app.log"
  max_size: 100
  max_backups: 10
  max_age: 30                 # 1个月
```

**特点：**
- 仅记录错误和警告
- 减少磁盘I/O
- 长期保留用于审计

### 高流量生产环境

```yaml
log:
  level: "error"
  file_path: "logs/app.log"
  max_size: 200               # 更大的文件
  max_backups: 20             # 更多备份
  max_age: 60                 # 2个月
```

**特点：**
- 应对大量日志
- 更多历史备份
- 更长保留期

## 🔧 日志格式

### 控制台输出

易读的彩色格式（开发时友好）：

```
2025-10-22T17:29:24.752+0800    info    utils/logger.go:96      Starting CESE-Qoder Backend Service...
2025-10-22T17:29:24.755+0800    info    utils/logger.go:96      Configuration loaded from file  {"path": "config/config.yaml"}
```

### 文件输出

结构化JSON格式（便于日志分析）：

```json
{"level":"info","time":"2025-10-22T17:29:24.752+0800","caller":"utils/logger.go:96","msg":"Starting CESE-Qoder Backend Service..."}
{"level":"info","time":"2025-10-22T17:29:24.755+0800","caller":"utils/logger.go:96","msg":"Configuration loaded from file","path":"config/config.yaml"}
```

### 字段说明

| 字段 | 说明 | 示例 |
|-----|------|------|
| level | 日志级别 | info, error |
| time | 时间戳 | 2025-10-22T17:29:24.752+0800 |
| caller | 调用位置 | utils/logger.go:96 |
| msg | 日志消息 | Configuration loaded |
| ... | 附加字段 | {"path": "config/config.yaml"} |

## 📝 使用方法

### 基本使用

```go
package main

import (
    "github.com/zsy619/cese-qoder/backend/utils"
    "go.uber.org/zap"
)

func main() {
    // 初始化日志
    utils.InitLogger()
    defer utils.Sync()

    // 使用日志
    utils.Info("应用启动")
    utils.Debug("调试信息", zap.String("key", "value"))
    utils.Warn("警告信息", zap.Int("count", 10))
    utils.Error("错误信息", zap.Error(err))
}
```

### 日志函数

#### Debug - 调试日志

```go
utils.Debug("用户查询", 
    zap.String("phone", "13800138000"),
    zap.String("action", "query"))
```

#### Info - 信息日志

```go
utils.Info("数据库连接成功",
    zap.String("host", "localhost"),
    zap.Int("port", 3306))
```

#### Warn - 警告日志

```go
utils.Warn("性能警告",
    zap.Duration("elapsed", time.Since(start)))
```

#### Error - 错误日志

```go
utils.Error("数据库错误",
    zap.Error(err),
    zap.String("operation", "insert"))
```

#### Fatal - 致命错误

```go
utils.Fatal("无法启动服务", zap.Error(err))
// 程序会退出
```

### 结构化字段

使用 zap 提供的类型安全字段：

```go
import "go.uber.org/zap"

utils.Info("用户操作",
    zap.String("user_id", "123"),          // 字符串
    zap.Int("age", 25),                    // 整数
    zap.Float64("score", 98.5),            // 浮点数
    zap.Bool("active", true),              // 布尔值
    zap.Duration("elapsed", duration),     // 时长
    zap.Time("created_at", time.Now()),    // 时间
    zap.Error(err),                        // 错误
    zap.Any("data", complexObject),        // 任意类型
)
```

## 🔍 日志轮转说明

### 轮转触发条件

日志文件会在以下情况自动轮转：

1. **文件大小** - 当前文件达到 `max_size` 大小
2. **每次启动** - 应用重启时创建新文件

### 轮转过程

```
1. app.log 达到 100MB
2. app.log → app.log.1
3. app.log.1 → app.log.2
4. ...
5. 创建新的 app.log
6. 删除超过 max_backups 的旧文件
```

### 文件压缩

旧日志文件会自动压缩为 `.gz` 格式：

```
logs/
├── app.log           # 当前日志（未压缩）
├── app.log.1.gz      # 备份1（已压缩）
├── app.log.2.gz      # 备份2（已压缩）
└── app.log.3.gz      # 备份3（已压缩）
```

**压缩比：** 通常可压缩到原大小的 10-20%

## 📈 日志分析

### 查看实时日志

```bash
# 查看最新日志
tail -f logs/app.log

# 查看最近100行
tail -100 logs/app.log

# 查看所有error日志
grep '"level":"error"' logs/app.log
```

### JSON日志分析

使用 `jq` 工具分析：

```bash
# 提取error级别的消息
cat logs/app.log | jq 'select(.level=="error") | .msg'

# 统计各级别日志数量
cat logs/app.log | jq -r '.level' | sort | uniq -c

# 查看特定时间段的日志
cat logs/app.log | jq 'select(.time > "2025-10-22T17:00:00")'

# 提取错误消息和堆栈
cat logs/app.log | jq 'select(.level=="error") | {msg, error, stacktrace}'
```

### 日志聚合

生产环境建议使用日志聚合工具：

- **ELK Stack** (Elasticsearch + Logstash + Kibana)
- **Grafana Loki**
- **Fluentd**
- **云服务** (阿里云SLS、AWS CloudWatch)

## 🔐 安全建议

### 1. 敏感信息过滤

❌ **不要记录：**
- 密码
- Token
- API密钥
- 个人身份信息

✅ **正确做法：**
```go
// 错误
utils.Info("用户登录", zap.String("password", password))

// 正确
utils.Info("用户登录", zap.String("phone", phone))
```

### 2. 日志访问控制

```bash
# 设置日志文件权限
chmod 640 logs/app.log
chown app:app logs/app.log
```

### 3. 日志清理

定期清理或归档旧日志：

```bash
# crontab 示例：每月清理6个月前的日志
0 0 1 * * find /path/to/logs -name "*.log.*.gz" -mtime +180 -delete
```

## 🧪 测试日志配置

### 验证日志级别

```bash
# 测试不同级别
cd backend

# debug 级别应输出所有日志
go run main.go  # 查看是否有 debug 日志

# 修改配置为 error
# 重新运行，应该只有error日志
```

### 验证日志轮转

```bash
# 创建大日志文件测试轮转
cd backend
for i in {1..1000}; do
  echo '{"level":"info","msg":"test"}' >> logs/app.log
done

# 检查是否创建了备份文件
ls -lh logs/
```

## 📚 更多资源

- [Uber Zap 文档](https://github.com/uber-go/zap)
- [Lumberjack 文档](https://github.com/natefinch/lumberjack)
- [配置文件说明](../config/README.md)
- [项目总览](./SUMMARY.md)

## ❓ 常见问题

### Q: 日志文件太大怎么办？

A: 调整配置参数：
```yaml
max_size: 50      # 减小单文件大小
max_backups: 5    # 减少保留数量
max_age: 7        # 减少保留天数
```

### Q: 生产环境应该用什么级别？

A: 推荐使用 `error` 级别，减少磁盘I/O和存储成本。

### Q: 如何查找特定错误？

A: 使用 grep 或 jq：
```bash
grep "特定错误" logs/app.log
cat logs/app.log | jq 'select(.msg | contains("特定错误"))'
```

### Q: 日志压缩会影响性能吗？

A: 压缩是异步进行的，对应用性能影响极小。

### Q: 如何在Docker中使用日志？

A: 挂载日志目录：
```yaml
volumes:
  - ./logs:/app/logs
```

---

**日志系统配置完成！** 🎉
