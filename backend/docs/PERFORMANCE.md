# 后端性能优化建议

## 当前性能指标

基于基准测试结果的性能分析：

### 1. 密码加密性能

**当前性能**：
- HashPassword: ~140ms/op
- CheckPassword: ~75ms/op

**优化建议**：
- ✅ 已使用 bcrypt.DefaultCost (10)，平衡安全性和性能
- 💡 如需提升性能，可考虑缓存验证结果（谨慎使用）
- 💡 使用 Redis 缓存 Token 验证结果

### 2. JWT Token 性能

**当前性能**：
- GenerateToken: ~200µs/op
- ParseToken: ~150µs/op

**优化建议**：
- ✅ 性能已优化，JWT 操作速度快
- 💡 可实现 Token 刷新机制减少生成频率
- 💡 Redis 缓存 Token 黑名单

### 3. 数据库查询性能

**优化建议**：

#### 索引优化
```sql
-- 用户表
ALTER TABLE cese_user ADD INDEX idx_phone (phone);

-- 模板表
ALTER TABLE cese_template ADD INDEX idx_user_id (user_id);
ALTER TABLE cese_template ADD INDEX idx_topic (topic);
ALTER TABLE cese_template ADD INDEX idx_created_at (created_at DESC);
ALTER TABLE cese_template ADD INDEX idx_user_created (user_id, created_at DESC);
```

#### 查询优化
- ✅ 使用分页查询，避免一次加载大量数据
- 💡 实现查询结果缓存（Redis）
- 💡 使用数据库连接池（已实现）

### 4. 并发性能

**当前配置**：
```go
SetMaxIdleConns(10)     // 最大空闲连接
SetMaxOpenConns(100)    // 最大打开连接
SetConnMaxLifetime(3600) // 连接最大生命周期
```

**优化建议**：
- 根据实际负载调整连接池大小
- 监控连接池使用情况
- 考虑使用 pgBouncer 或类似工具

### 5. API 响应时间优化

**目标**: < 200ms

**优化策略**：

1. **响应压缩**
```go
// 添加 gzip 中间件
h.Use(gzip.Gzip(gzip.DefaultCompression))
```

2. **缓存策略**
- 用户信息缓存 (TTL: 5min)
- 模板列表缓存 (TTL: 1min)
- Token 验证缓存 (TTL: 10min)

3. **异步处理**
- 日志异步写入
- 非关键操作异步执行

### 6. 内存优化

**建议**：
- 复用对象，减少 GC 压力
- 使用 sync.Pool 池化常用对象
- 限制请求体大小

```go
// 限制请求体大小
h.Use(func(ctx context.Context, c *app.RequestContext) {
    c.Request.SetMaxRequestBodySize(10 * 1024 * 1024) // 10MB
    c.Next(ctx)
})
```

### 7. 监控和日志

**实现建议**：

1. **Prometheus 指标**
```go
// 添加指标收集
var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )
)
```

2. **日志优化**
- 结构化日志（已实现）
- 异步日志写入
- 日志采样（高频接口）

### 8. 安全性能平衡

**建议**：
- 实现请求限流（rate limiting）
- IP 黑名单（Redis）
- 防止暴力破解（登录失败锁定）

```go
// 使用 golang.org/x/time/rate
limiter := rate.NewLimiter(rate.Limit(10), 100) // 10 req/s
```

## 压力测试目标

### 目标指标

| 指标 | 目标值 |
|------|--------|
| 并发用户 | 1000+ |
| QPS | 5000+ |
| 平均响应时间 | < 100ms |
| P99 响应时间 | < 500ms |
| 错误率 | < 0.1% |

### 压力测试工具

1. **wrk** - HTTP 基准测试
```bash
wrk -t12 -c400 -d30s http://localhost:8080/api/v1/template
```

2. **Apache Bench**
```bash
ab -n 10000 -c 100 http://localhost:8080/health
```

3. **Vegeta**
```bash
echo "GET http://localhost:8080/api/v1/template" | \
  vegeta attack -duration=30s -rate=1000 | \
  vegeta report
```

## 生产环境优化清单

- [ ] 启用 HTTPS (TLS 1.3)
- [ ] 配置 CDN（静态资源）
- [ ] 实现 Redis 缓存
- [ ] 配置数据库主从复制
- [ ] 实现日志聚合（ELK/Loki）
- [ ] 配置监控告警（Prometheus + Grafana）
- [ ] 实现链路追踪（Jaeger）
- [ ] 配置自动扩缩容（Kubernetes HPA）
- [ ] 实现优雅重启
- [ ] 配置健康检查
- [ ] 实现熔断降级（Sentinel）
- [ ] 配置备份策略

## 代码层面优化

### 1. 减少内存分配

```go
// 不好的做法
func process(items []Item) []Result {
    var results []Result
    for _, item := range items {
        results = append(results, transform(item))
    }
    return results
}

// 优化后
func process(items []Item) []Result {
    results := make([]Result, 0, len(items))
    for _, item := range items {
        results = append(results, transform(item))
    }
    return results
}
```

### 2. 使用字符串拼接优化

```go
// 使用 strings.Builder
var builder strings.Builder
builder.WriteString("Hello")
builder.WriteString(" ")
builder.WriteString("World")
result := builder.String()
```

### 3. 避免不必要的类型转换

```go
// 复用 []byte 避免 string <-> []byte 转换
```

## 总结

当前后端服务性能良好，主要优化方向：

1. **短期**（1周内）
   - 添加 Redis 缓存
   - 实现请求限流
   - 优化数据库索引

2. **中期**（1月内）
   - 完善监控告警
   - 实现链路追踪
   - 压力测试优化

3. **长期**（持续）
   - 容器化部署
   - 自动扩缩容
   - 性能持续监控
