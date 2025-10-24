#!/bin/bash

# 测试生成接口
echo "测试生成接口..."

# 先登录获取token（这里使用示例数据，实际使用时需要替换为真实的用户名和密码）
# curl -X POST http://localhost:8080/api/v1/user/login \
#   -H "Content-Type: application/json" \
#   -d '{"mobile": "13800138000", "password": "password123"}'

# 使用已知的token和provider_id进行测试
curl -X POST http://localhost:8080/api/v1/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -d '{
    "provider_id": 42,
    "prompt": "请为我生成一个关于人工智能的简短介绍",
    "temperature": 0.7,
    "max_tokens": 1000,
    "stream": true
  }'