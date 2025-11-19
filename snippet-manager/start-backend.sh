#!/bin/bash

# 启动后端服务

echo "正在启动后端服务..."

cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "检查并安装依赖..."
pip install -r requirements.txt

# 创建实例目录
mkdir -p instance

# 运行应用
echo "启动 Flask 应用..."
python run.py
