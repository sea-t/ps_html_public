# Docker 部署指南

使用 Docker 可以快速部署代码片段管理器，无需手动配置 Python、Node.js 等环境。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+

安装 Docker: https://docs.docker.com/get-docker/

## 🚀 快速开始

### 生产环境部署（推荐）

1. **启动服务**
```bash
./docker-start.sh
```

或手动执行：
```bash
docker-compose up -d
```

2. **访问应用**
- 前端: http://localhost
- 后端API: http://localhost:5000/api

3. **添加示例数据（可选）**
```bash
./docker-seed.sh
```

### 开发环境部署

1. **启动开发环境**
```bash
./docker-start-dev.sh
```

或手动执行：
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:5000/api

开发环境支持代码热重载，修改代码会自动生效。

## 📦 Docker 架构

### 生产环境

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │   (Nginx)    │◄───│   (Flask)    │  │
│  │   Port 80    │    │  Port 5000   │  │
│  └──────────────┘    └──────────────┘  │
│                             │           │
│                      ┌──────▼───────┐   │
│                      │   SQLite DB  │   │
│                      │   (Volume)   │   │
│                      └──────────────┘   │
└─────────────────────────────────────────┘
```

**特点：**
- 前端使用 Nginx 提供静态文件服务
- 前后端通过 Docker 网络通信
- 数据库使用 Docker Volume 持久化
- 镜像经过多阶段构建优化

### 开发环境

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │  │
│  │    (Vite)    │◄───│   (Flask)    │  │
│  │  Port 3000   │    │  Port 5000   │  │
│  └──────────────┘    └──────────────┘  │
│         │                   │           │
│    ┌────▼────┐        ┌────▼────┐      │
│    │ Volume  │        │ Volume  │      │
│    │  /app   │        │  /app   │      │
│    └─────────┘        └─────────┘      │
└─────────────────────────────────────────┘
```

**特点：**
- 前端使用 Vite 开发服务器（热重载）
- 代码通过 Volume 挂载，支持实时修改
- 适合开发和调试

## 📝 常用命令

### 服务管理

```bash
# 启动服务（生产环境）
docker-compose up -d

# 启动服务（开发环境）
docker-compose -f docker-compose.dev.yml up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 数据管理

```bash
# 添加示例数据
./docker-seed.sh

# 备份数据库
docker cp snippet-manager-backend:/app/instance/snippets.db ./backup.db

# 恢复数据库
docker cp ./backup.db snippet-manager-backend:/app/instance/snippets.db
docker-compose restart backend

# 查看数据库
docker exec -it snippet-manager-backend sqlite3 /app/instance/snippets.db
```

### 清理命令

```bash
# 停止并删除容器
docker-compose down

# 停止并删除容器及数据卷（⚠️ 会删除所有数据）
docker-compose down -v

# 删除所有未使用的镜像
docker image prune -a

# 完全清理（包括网络、缓存等）
docker system prune -a --volumes
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件（从 `.env.example` 复制）：

```bash
cp .env.example .env
```

主要配置项：

```env
# 安全密钥（生产环境必须修改！）
SECRET_KEY=your-super-secret-key-here

# 数据库配置
DATABASE_URL=sqlite:///instance/snippets.db

# Flask 配置
FLASK_ENV=production
FLASK_APP=run.py
```

### 端口映射

默认端口：
- 生产环境前端：80
- 开发环境前端：3000
- 后端API：5000

修改端口（编辑 `docker-compose.yml`）：

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 修改为 8080 端口
```

### Volume 持久化

数据库文件存储在 Docker Volume 中，即使删除容器数据也不会丢失。

查看 Volume：
```bash
docker volume ls
```

备份 Volume：
```bash
docker run --rm -v snippet-manager_backend-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .
```

恢复 Volume：
```bash
docker run --rm -v snippet-manager_backend-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /data
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查容器状态
docker-compose ps

# 重新构建镜像
docker-compose build --no-cache
docker-compose up -d
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :80
lsof -i :5000

# 修改 docker-compose.yml 中的端口映射
```

### 数据库问题

```bash
# 进入后端容器
docker exec -it snippet-manager-backend bash

# 查看数据库文件
ls -la /app/instance/

# 重新初始化数据库
docker-compose down
docker volume rm snippet-manager_backend-data
docker-compose up -d
```

### 前端无法访问后端

检查 Docker 网络：
```bash
docker network ls
docker network inspect snippet-manager_snippet-network
```

确保前端的 nginx 配置中后端地址为 `http://backend:5000`。

## 🔐 安全建议

### 生产环境安全清单

- [ ] 修改 `.env` 中的 `SECRET_KEY`
- [ ] 使用 HTTPS（配置反向代理）
- [ ] 限制容器资源使用
- [ ] 定期备份数据库
- [ ] 使用非 root 用户运行容器
- [ ] 及时更新依赖包

### 添加资源限制

编辑 `docker-compose.yml`：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 使用 HTTPS

推荐使用 Nginx 或 Traefik 作为反向代理：

```yaml
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.snippet.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.snippet.entrypoints=websecure"
      - "traefik.http.routers.snippet.tls.certresolver=myresolver"
```

## 📊 性能优化

### 镜像优化

前端镜像已使用多阶段构建：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
# ... 构建

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

### 缓存优化

利用 Docker 层缓存：

```dockerfile
# 先复制依赖文件
COPY package*.json ./
RUN npm install

# 再复制源代码
COPY . .
```

### 减小镜像大小

```bash
# 查看镜像大小
docker images | grep snippet-manager

# 使用 alpine 基础镜像
# 清理不必要的文件
# 合并 RUN 命令
```

## 🚢 生产部署建议

### 使用 Docker Swarm

```bash
# 初始化 Swarm
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.yml snippet-manager

# 查看服务
docker service ls
```

### 使用 Kubernetes

创建 Kubernetes 部署文件（参考 `k8s/` 目录）。

### 使用云平台

- **AWS**: ECS 或 Fargate
- **Google Cloud**: Cloud Run
- **Azure**: Container Instances
- **DigitalOcean**: App Platform

## 📚 相关文档

- [README.md](./README.md) - 项目介绍
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发文档

## 🆘 获取帮助

使用便捷脚本：

```bash
./docker-start.sh      # 启动生产环境
./docker-start-dev.sh  # 启动开发环境
./docker-stop.sh       # 停止服务
./docker-logs.sh       # 查看日志
./docker-seed.sh       # 添加示例数据
```

查看 Docker Compose 配置：
- 生产环境：`docker-compose.yml`
- 开发环境：`docker-compose.dev.yml`

---

**提示**: 首次使用建议先在开发环境测试，熟悉后再部署生产环境。
