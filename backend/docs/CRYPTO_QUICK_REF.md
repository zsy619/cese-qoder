# 国密加密快速参考

## 🚀 快速开始

### 密码加密（用户注册）

```go
import "github.com/zsy619/cese-qoder/backend/utils"

// 加密密码
hashedPassword, err := utils.HashPassword("User@123456")
if err != nil {
    // 处理错误
}

// 存储到数据库
user.Password = hashedPassword
```

### 密码验证（用户登录）

```go
import "github.com/zsy619/cese-qoder/backend/utils"

// 验证密码
if utils.CheckPassword(user.Password, inputPassword) {
    // 登录成功
} else {
    // 密码错误
}
```

### 数据加密（敏感信息）

```go
import "github.com/zsy619/cese-qoder/backend/utils"

// 生成密钥
key, err := utils.GenerateSM4Key()

// 加密
encrypted, err := utils.EncryptData("敏感数据", key)

// 解密
decrypted, err := utils.DecryptData(encrypted, key)
```

## 📊 核心函数

| 函数 | 用途 | 输入 | 输出 |
|------|------|------|------|
| `HashPassword` | 密码加密 | 明文密码 | 96字符哈希 |
| `CheckPassword` | 密码验证 | 哈希+密码 | true/false |
| `EncryptData` | 数据加密 | 明文+密钥 | 十六进制字符串 |
| `DecryptData` | 数据解密 | 密文+密钥 | 明文字符串 |
| `GenerateSM4Key` | 生成密钥 | 无 | 16字节密钥 |

## 🔐 密码格式

### SM3哈希格式

```
总长度: 96字符
结构: [32字符salt] + [64字符hash]
示例: a1b2c3d4e5f6...（32字符）+ 1a2b3c4d5e6f...（64字符）
```

### 存储要求

```sql
-- 数据库字段
password VARCHAR(96) NOT NULL
```

## ⚡ 性能数据

```
操作             速度          内存
HashPassword     1.9μs         368B
CheckPassword    1.0μs         288B
EncryptData      1.2μs         472B
DecryptData      1.2μs         368B
```

**并发能力**: >100,000 ops/s

## 🧪 测试命令

```bash
# 单元测试
go test ./utils -v

# 性能测试
go test ./utils -bench=.

# 覆盖率
go test ./utils -cover
```

## 🔍 故障排查

### 密码验证失败

```go
// 检查哈希长度
if len(hashedPassword) != 96 {
    log.Printf("错误的哈希长度: %d", len(hashedPassword))
}

// 检查密码格式
if !utils.ValidatePassword(password) {
    log.Println("密码强度不足")
}
```

### 加密错误

```go
// 检查密钥长度
if len(key) != 16 {
    log.Printf("错误的密钥长度: %d（需要16字节）", len(key))
}
```

## 📚 完整文档

- [国密加密详细文档](./CRYPTO_GM.md)
- [迁移指南](./CRYPTO_MIGRATION.md)
- [API文档](./API.md)

## ⚠️ 注意事项

1. **密码长度**: 96字符（不是60或128）
2. **密钥管理**: 使用环境变量或KMS
3. **错误处理**: 总是检查err返回值
4. **测试**: 部署前运行完整测试

---

**快速参考 v1.0** | 国密标准 | 高性能 | 企业级
