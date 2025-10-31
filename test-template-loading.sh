#!/bin/bash

# E085 模板加载测试脚本
# 用于快速验证模板加载是否正常

echo "🧪 E085 模板加载测试脚本"
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试函数
test_template_file() {
    local filename=$1
    local url="http://localhost:3000/docs/${filename}"
    
    echo -e "${BLUE}测试文件: ${filename}${NC}"
    
    # 使用curl测试
    response=$(curl -s -w "%{http_code}" -o /tmp/template_test.txt "$url")
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        # 检查内容是否为HTML
        if grep -q "<!DOCTYPE\|<html" /tmp/template_test.txt; then
            echo -e "${RED}❌ 返回HTML内容（错误）${NC}"
            echo "   内容预览: $(head -1 /tmp/template_test.txt)"
            return 1
        else
            echo -e "${GREEN}✅ 返回Markdown内容（正确）${NC}"
            echo "   内容预览: $(head -1 /tmp/template_test.txt)"
            return 0
        fi
    else
        echo -e "${RED}❌ HTTP错误: ${http_code}${NC}"
        return 1
    fi
}

# 检查服务是否运行
echo -e "${BLUE}1. 检查服务状态${NC}"

# 检查前端服务
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务运行正常 (localhost:3000)${NC}"
else
    echo -e "${RED}❌ 前端服务未运行，请启动: cd frontend && npm start${NC}"
    exit 1
fi

# 检查后端服务
if curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务运行正常 (localhost:8080)${NC}"
else
    echo -e "${RED}❌ 后端服务未运行，请启动: cd backend && go run main.go${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}2. 测试模板文件访问${NC}"

# 测试所有模板文件
template_files=(
    "提示词-任务目标.md"
    "提示词-AI的角色.md"
    "提示词-我的角色.md"
    "提示词-关键信息.md"
    "提示词-行为规则.md"
    "提示词-交付格式.md"
)

success_count=0
total_count=${#template_files[@]}

for file in "${template_files[@]}"; do
    if test_template_file "$file"; then
        ((success_count++))
    fi
    echo ""
done

echo "================================"
echo -e "${BLUE}测试结果总结${NC}"
echo -e "成功: ${GREEN}${success_count}${NC}/${total_count}"

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}🎉 所有模板文件加载正常！${NC}"
    echo ""
    echo -e "${YELLOW}下一步：${NC}"
    echo "1. 打开浏览器访问: http://localhost:3000"
    echo "2. 输入主题并点击AI生成按钮"
    echo "3. 检查浏览器控制台日志"
    echo ""
    echo -e "${GREEN}预期看到：${NC}"
    echo "✅ Template loaded successfully"
    echo "📝 Replacing placeholders..."
    echo "✨ Final result after replacement..."
else
    echo -e "${RED}❌ 部分模板文件加载失败${NC}"
    echo ""
    echo -e "${YELLOW}故障排查：${NC}"
    echo "1. 确保后端和前端服务都已重启"
    echo "2. 检查文件是否存在: ls frontend/public/docs/提示词-*.md"
    echo "3. 清除浏览器缓存或使用无痕模式"
    echo "4. 查看后端日志输出"
fi

# 清理临时文件
rm -f /tmp/template_test.txt

echo ""
echo -e "${BLUE}测试完成${NC}"