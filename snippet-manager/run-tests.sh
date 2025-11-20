#!/bin/bash

# 代码片段管理器测试套件运行脚本

set -e

echo "================================"
echo "代码片段管理器 - 测试套件"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否安装了pytest
check_pytest() {
    if ! command -v pytest &> /dev/null; then
        echo -e "${RED}❌ pytest 未安装${NC}"
        echo "正在安装测试依赖..."
        pip install -r backend/requirements-test.txt
    fi
}

# 运行后端单元测试
run_backend_tests() {
    echo -e "${BLUE}📋 运行后端单元测试...${NC}"
    echo ""

    cd backend

    # 安装测试依赖
    if [ -f requirements-test.txt ]; then
        pip install -q -r requirements-test.txt
    fi

    # 运行测试
    python -m pytest test_api.py -v --tb=short

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 后端单元测试通过${NC}"
    else
        echo -e "${RED}✗ 后端单元测试失败${NC}"
        exit 1
    fi

    cd ..
    echo ""
}

# 运行集成测试
run_integration_tests() {
    echo -e "${BLUE}📋 运行集成测试...${NC}"
    echo ""

    # 检查服务是否运行
    if ! curl -s http://localhost:5000/api/stats > /dev/null 2>&1; then
        echo -e "${RED}⚠️  后端服务未运行，跳过集成测试${NC}"
        echo "提示: 先运行 './docker-start.sh' 启动服务"
        echo ""
        return 0
    fi

    # 运行集成测试
    python -m pytest tests/test_integration.py -v --tb=short

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 集成测试通过${NC}"
    else
        echo -e "${RED}✗ 集成测试失败${NC}"
        exit 1
    fi

    echo ""
}

# 测试数据库持久化
test_database_mount() {
    echo -e "${BLUE}📋 测试数据库挂载...${NC}"
    echo ""

    if [ -d "./data/database" ]; then
        echo -e "${GREEN}✓ 数据库目录存在: ./data/database${NC}"

        if [ -f "./data/database/snippets.db" ]; then
            echo -e "${GREEN}✓ 数据库文件存在: ./data/database/snippets.db${NC}"
            ls -lh ./data/database/snippets.db
        else
            echo -e "${BLUE}ℹ️  数据库文件尚未创建（首次运行时会自动创建）${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️  数据库目录尚未创建（首次运行时会自动创建）${NC}"
    fi

    echo ""
}

# 显示测试摘要
show_summary() {
    echo ""
    echo "================================"
    echo -e "${GREEN}测试完成！${NC}"
    echo "================================"
    echo ""
    echo "测试覆盖的功能："
    echo "  ✓ 创建片段 (POST /api/snippets)"
    echo "  ✓ 获取片段列表 (GET /api/snippets)"
    echo "  ✓ 获取单个片段 (GET /api/snippets/<id>)"
    echo "  ✓ 更新片段 (PUT /api/snippets/<id>)"
    echo "  ✓ 删除片段 (DELETE /api/snippets/<id>)"
    echo "  ✓ 搜索和过滤 (GET /api/snippets?search=...)"
    echo "  ✓ 获取标签 (GET /api/tags)"
    echo "  ✓ 获取统计 (GET /api/stats)"
    echo "  ✓ 数据持久化"
    echo ""
}

# 主函数
main() {
    # 检查参数
    case "${1:-all}" in
        unit)
            check_pytest
            run_backend_tests
            ;;
        integration)
            check_pytest
            run_integration_tests
            ;;
        database)
            test_database_mount
            ;;
        all)
            check_pytest
            test_database_mount
            run_backend_tests
            run_integration_tests
            show_summary
            ;;
        *)
            echo "用法: $0 [unit|integration|database|all]"
            echo ""
            echo "  unit        - 只运行单元测试"
            echo "  integration - 只运行集成测试（需要服务运行）"
            echo "  database    - 只测试数据库挂载"
            echo "  all         - 运行所有测试（默认）"
            exit 1
            ;;
    esac
}

main "$@"
