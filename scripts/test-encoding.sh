#!/bin/bash

# ============================================
# 乱码问题修复验证脚本
# ============================================

echo "=========================================="
echo "  我的模板乱码问题修复验证"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查后端服务是否运行
echo "1. 检查后端服务..."
if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 后端服务正在运行 (端口8080)"
else
    echo -e "${RED}✗${NC} 后端服务未运行"
    echo "   请先启动后端服务: cd backend && go run main.go"
    exit 1
fi
echo ""

# 2. 检查健康检查端点
echo "2. 检查健康检查端点..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 健康检查通过 (HTTP $HEALTH_RESPONSE)"
else
    echo -e "${RED}✗${NC} 健康检查失败 (HTTP $HEALTH_RESPONSE)"
    exit 1
fi
echo ""

# 3. 测试登录获取Token
echo "3. 测试登录..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "13800138000",
    "password": "Test@123456"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗${NC} 登录失败"
    echo "   响应: $LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✓${NC} 登录成功"
    echo "   Token: ${TOKEN:0:20}..."
fi
echo ""

# 4. 测试获取模板列表
echo "4. 测试获取模板列表..."
TEMPLATE_RESPONSE=$(curl -s -i -X GET "http://localhost:8080/api/v1/template?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# 检查Content-Type头
CONTENT_TYPE=$(echo "$TEMPLATE_RESPONSE" | grep -i "Content-Type:" | tr -d '\r')
echo "   响应头: $CONTENT_TYPE"

if echo "$CONTENT_TYPE" | grep -q "charset=utf-8"; then
    echo -e "${GREEN}✓${NC} Content-Type包含charset=utf-8"
else
    echo -e "${RED}✗${NC} Content-Type缺少charset=utf-8"
    echo ""
    echo "完整响应头:"
    echo "$TEMPLATE_RESPONSE" | grep -i "^[A-Za-z-]*:"
    exit 1
fi
echo ""

# 5. 检查中文内容
echo "5. 检查中文内容..."
BODY=$(echo "$TEMPLATE_RESPONSE" | sed -n '/^$/,$p' | tail -n +2)

# 提取topic字段
TOPICS=$(echo "$BODY" | grep -o '"topic":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOPICS" ]; then
    echo -e "${YELLOW}!${NC} 没有找到模板数据"
    echo "   可能是数据库中没有测试数据"
else
    echo "   找到的模板主题:"
    echo "$TOPICS" | while read -r topic; do
        # 检查是否包含中文字符（UTF-8编码）
        if echo "$topic" | grep -qP '[\x{4e00}-\x{9fa5}]' 2>/dev/null || echo "$topic" | grep -q '[一-龥]' 2>/dev/null; then
            echo -e "   ${GREEN}✓${NC} $topic (包含中文)"
        else
            echo "     $topic"
        fi
    done
fi
echo ""

# 6. 完整性测试
echo "6. 完整响应示例..."
echo "$BODY" | head -c 500
echo ""
echo "..."
echo ""

# 7. 总结
echo "=========================================="
echo "  验证结果总结"
echo "=========================================="
echo -e "${GREEN}✓${NC} 后端服务运行正常"
echo -e "${GREEN}✓${NC} 健康检查通过"
echo -e "${GREEN}✓${NC} 登录功能正常"
echo -e "${GREEN}✓${NC} Content-Type包含charset=utf-8"
echo -e "${GREEN}✓${NC} API响应正常"
echo ""
echo "建议下一步："
echo "1. 在浏览器中访问前端页面测试"
echo "2. 登录后查看'我的模板'页面"
echo "3. 确认中文显示正常，无乱码"
echo ""
