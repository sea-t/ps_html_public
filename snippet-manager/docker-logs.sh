#!/bin/bash

# Docker 日志查看脚本

echo "📝 查看服务日志..."
echo ""
echo "选择要查看的环境："
echo "1) 生产环境"
echo "2) 开发环境"
echo ""
read -p "请选择 (1 或 2): " choice

case $choice in
    1)
        echo "📊 生产环境日志（Ctrl+C 退出）："
        docker-compose logs -f
        ;;
    2)
        echo "📊 开发环境日志（Ctrl+C 退出）："
        docker-compose -f docker-compose.dev.yml logs -f
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
