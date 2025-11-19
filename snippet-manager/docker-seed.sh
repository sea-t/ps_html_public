#!/bin/bash

# 添加示例数据到 Docker 容器中的数据库

echo "🌱 添加示例数据..."

# 检查后端容器是否在运行
if ! docker ps | grep -q "snippet-manager-backend"; then
    echo "❌ 后端容器未运行，请先启动服务"
    exit 1
fi

# 在容器中执行 seed_data.py
docker exec snippet-manager-backend python seed_data.py

echo "✅ 示例数据添加完成！"
