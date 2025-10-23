#!/bin/bash

# ============================================
# 后端性能测试脚本
# ============================================

set -e

echo "=========================================="
echo "CESE-Qoder 后端性能测试"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 单元测试
echo -e "\n${YELLOW}[1/5] 运行单元测试...${NC}"
go test ./utils/... -v -cover

# 2. 基准测试
echo -e "\n${YELLOW}[2/5] 运行基准测试...${NC}"
go test ./tests/... -bench=. -benchmem -run=^$

# 3. 性能分析（CPU）
echo -e "\n${YELLOW}[3/5] 生成 CPU 性能分析文件...${NC}"
go test ./tests/... -bench=BenchmarkUserLogin -cpuprofile=cpu.prof -run=^$
if [ -f cpu.prof ]; then
    echo -e "${GREEN}✓ CPU 性能分析文件已生成: cpu.prof${NC}"
    echo "  使用命令查看: go tool pprof cpu.prof"
fi

# 4. 性能分析（内存）
echo -e "\n${YELLOW}[4/5] 生成内存性能分析文件...${NC}"
go test ./tests/... -bench=BenchmarkUserLogin -memprofile=mem.prof -run=^$
if [ -f mem.prof ]; then
    echo -e "${GREEN}✓ 内存性能分析文件已生成: mem.prof${NC}"
    echo "  使用命令查看: go tool pprof mem.prof"
fi

# 5. 代码覆盖率
echo -e "\n${YELLOW}[5/5] 生成代码覆盖率报告...${NC}"
go test ./... -coverprofile=coverage.out -covermode=atomic
if [ -f coverage.out ]; then
    go tool cover -html=coverage.out -o coverage.html
    echo -e "${GREEN}✓ 覆盖率报告已生成:${NC}"
    echo "  - coverage.out (数据文件)"
    echo "  - coverage.html (HTML报告)"
    
    # 显示覆盖率统计
    echo -e "\n${YELLOW}覆盖率统计:${NC}"
    go tool cover -func=coverage.out | tail -1
fi

echo -e "\n${GREEN}=========================================="
echo "测试完成！"
echo "==========================================${NC}"

# 清理临时文件（可选）
# rm -f *.prof *.out

echo -e "\n${YELLOW}提示：${NC}"
echo "1. 查看 CPU 性能: go tool pprof -http=:8090 cpu.prof"
echo "2. 查看内存性能: go tool pprof -http=:8090 mem.prof"
echo "3. 查看覆盖率: open coverage.html"
