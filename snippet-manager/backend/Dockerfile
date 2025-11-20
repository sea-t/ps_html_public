# Python 后端 Dockerfile - 优化版：避免编译，使用预编译包
FROM python:3.11

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=run.py

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖 - 强制使用预编译包
# --prefer-binary: 优先使用预编译的 wheel
# --only-binary: 对指定包强制使用二进制版本，避免编译
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
        --prefer-binary \
        --only-binary psycopg2-binary,bcrypt \
        -r requirements.txt

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p /app/instance

# 暴露端口
EXPOSE 5000

# 健康检查 - 使用不需要认证的健康检查端点
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/api/health')" || exit 1

# 启动应用
CMD ["python", "run.py"]
