#!/bin/bash
# 502 错误诊断脚本

echo "=== 检查所有容器状态 ==="
docker compose ps

echo -e "\n=== 后端容器最近日志 ==="
docker compose logs --tail=100 backend

echo -e "\n=== 数据库容器日志 ==="
docker compose logs --tail=50 postgres

echo -e "\n=== 前端容器日志 ==="
docker compose logs --tail=30 frontend

echo -e "\n=== 检查容器网络连通性 ==="
echo "测试前端到后端的连接："
docker compose exec -T frontend curl -s http://backend:5000/api/health || echo "连接失败"

echo -e "\n测试后端到数据库的连接："
docker compose exec -T postgres pg_isready -U snippets_user || echo "数据库未就绪"

echo -e "\n=== 检查环境变量配置 ==="
if [ -f .env ]; then
    echo ".env 文件存在"
    echo "DATABASE_URL: $(grep DATABASE_URL .env || echo '未配置')"
else
    echo "警告: .env 文件不存在!"
fi

echo -e "\n=== 诊断完成 ==="
