#!/bin/bash

# Snippet Manager 一键部署脚本
# 使用方法：
#   wget -O install.sh https://raw.githubusercontent.com/sea-t/ps_html_public/main/snippet-manager/install.sh
#   bash install.sh

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   Snippet Manager 一键部署脚本             ║"
    echo "║   版本: 1.0.0                              ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查 Docker
check_docker() {
    print_info "检查 Docker 安装状态..."
    if ! command_exists docker; then
        print_error "Docker 未安装！"
        print_info "请先安装 Docker: https://docs.docker.com/engine/install/"
        exit 1
    fi

    # 检查 Docker 是否运行
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker 未运行！请启动 Docker 服务"
        print_info "Ubuntu/Debian: sudo systemctl start docker"
        print_info "或者将当前用户添加到 docker 组: sudo usermod -aG docker $USER"
        exit 1
    fi

    print_success "Docker 已安装并运行 ($(docker --version))"
}

# 检查 Docker Compose
check_docker_compose() {
    print_info "检查 Docker Compose 安装状态..."

    # 检查 docker compose (v2) 或 docker-compose (v1)
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
        print_success "Docker Compose 已安装 ($(docker compose version))"
    elif command_exists docker-compose; then
        COMPOSE_CMD="docker-compose"
        print_success "Docker Compose 已安装 ($(docker-compose --version))"
    else
        print_error "Docker Compose 未安装！"
        print_info "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
}

# 创建项目目录
create_project_dir() {
    PROJECT_DIR="$HOME/snippet-manager"

    print_info "创建项目目录: $PROJECT_DIR"

    if [ -d "$PROJECT_DIR" ]; then
        print_warning "目录已存在，将使用现有目录"
        read -p "是否要停止并删除旧的容器？(y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd "$PROJECT_DIR"
            print_info "停止旧的容器..."
            $COMPOSE_CMD down 2>/dev/null || true
        fi
    else
        mkdir -p "$PROJECT_DIR"
    fi

    cd "$PROJECT_DIR"
    print_success "工作目录: $PROJECT_DIR"
}

# 创建 docker-compose.yml
create_docker_compose() {
    print_info "创建 docker-compose.yml 配置文件..."

    cat > docker-compose.yml <<'EOF'
version: '3.8'

# Snippet Manager 生产环境配置

services:
  # 后端服务
  backend:
    image: ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest
    container_name: snippet-manager-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - FLASK_APP=run.py
      - SECRET_KEY=${SECRET_KEY:-your-secret-key-change-in-production}
      - DATABASE_URL=sqlite:///instance/snippets.db
    volumes:
      # 持久化数据库
      - backend-data:/app/instance
    networks:
      - snippet-network
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:5000/api/stats')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # 前端服务
  frontend:
    image: ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest
    container_name: snippet-manager-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - snippet-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  # 后端数据持久化
  backend-data:
    driver: local

networks:
  snippet-network:
    driver: bridge
EOF

    print_success "docker-compose.yml 创建成功"
}

# 创建环境变量文件
create_env_file() {
    if [ ! -f .env ]; then
        print_info "创建环境变量文件 .env..."

        # 生成随机 SECRET_KEY
        SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

        cat > .env <<EOF
# Snippet Manager 环境变量配置
SECRET_KEY=$SECRET_KEY
FLASK_ENV=production
EOF

        print_success ".env 文件创建成功"
    else
        print_info ".env 文件已存在，跳过创建"
    fi
}

# 拉取镜像
pull_images() {
    print_info "从 GitHub Container Registry 拉取最新镜像..."
    print_warning "首次运行可能需要几分钟，请耐心等待..."

    if $COMPOSE_CMD pull; then
        print_success "镜像拉取成功"
    else
        print_error "镜像拉取失败！请检查网络连接"
        exit 1
    fi
}

# 启动服务
start_services() {
    print_info "启动服务..."

    if $COMPOSE_CMD up -d; then
        print_success "服务启动成功！"
    else
        print_error "服务启动失败！"
        exit 1
    fi
}

# 等待服务就绪
wait_for_services() {
    print_info "等待服务启动完成..."

    MAX_WAIT=60
    WAITED=0

    while [ $WAITED -lt $MAX_WAIT ]; do
        if curl -s http://localhost:80 >/dev/null 2>&1; then
            print_success "服务已就绪！"
            return 0
        fi

        sleep 2
        WAITED=$((WAITED + 2))
        echo -n "."
    done

    echo
    print_warning "服务启动时间较长，请手动检查状态: $COMPOSE_CMD logs"
}

# 显示服务状态
show_status() {
    echo
    print_info "服务状态："
    $COMPOSE_CMD ps
    echo
}

# 显示访问信息
show_access_info() {
    # 获取服务器 IP
    SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "YOUR_SERVER_IP")

    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║           部署成功！                       ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo
    echo -e "${BLUE}访问地址：${NC}"
    echo -e "  本地访问:   ${GREEN}http://localhost${NC}"
    echo -e "  远程访问:   ${GREEN}http://$SERVER_IP${NC}"
    echo
    echo -e "${BLUE}常用命令：${NC}"
    echo -e "  查看日志:   ${YELLOW}cd $PROJECT_DIR && $COMPOSE_CMD logs -f${NC}"
    echo -e "  停止服务:   ${YELLOW}cd $PROJECT_DIR && $COMPOSE_CMD stop${NC}"
    echo -e "  启动服务:   ${YELLOW}cd $PROJECT_DIR && $COMPOSE_CMD start${NC}"
    echo -e "  重启服务:   ${YELLOW}cd $PROJECT_DIR && $COMPOSE_CMD restart${NC}"
    echo -e "  更新镜像:   ${YELLOW}cd $PROJECT_DIR && $COMPOSE_CMD pull && $COMPOSE_CMD up -d${NC}"
    echo -e "  完全卸载:   ${YELLOW}cd $PROJECT_DIR && $COMPOSE_CMD down -v${NC}"
    echo
    echo -e "${BLUE}文件位置：${NC}"
    echo -e "  项目目录:   ${GREEN}$PROJECT_DIR${NC}"
    echo -e "  配置文件:   ${GREEN}$PROJECT_DIR/docker-compose.yml${NC}"
    echo -e "  环境变量:   ${GREEN}$PROJECT_DIR/.env${NC}"
    echo -e "  数据持久化: ${GREEN}Docker Volume (backend-data)${NC}"
    echo
    echo -e "${YELLOW}提示：如果无法访问，请检查防火墙设置（需要开放 80 端口）${NC}"
    echo
}

# 主函数
main() {
    print_header

    # 环境检查
    check_docker
    check_docker_compose

    # 创建项目
    create_project_dir
    create_docker_compose
    create_env_file

    # 部署服务
    pull_images
    start_services

    # 等待服务就绪
    wait_for_services

    # 显示信息
    show_status
    show_access_info

    print_success "部署完成！享受使用 Snippet Manager 吧！"
}

# 运行主函数
main
