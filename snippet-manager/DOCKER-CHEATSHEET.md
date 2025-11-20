# Docker 快速参考

## 🚀 快速命令

### 启动服务

```bash
# 生产环境（推荐）
./docker-start.sh
# 或
docker-compose up -d

# 开发环境
./docker-start-dev.sh
# 或
docker-compose -f docker-compose.dev.yml up -d
```

### 停止服务

```bash
./docker-stop.sh
# 或
docker-compose down
```

### 查看日志

```bash
./docker-logs.sh
# 或
docker-compose logs -f
```

### 添加示例数据

```bash
./docker-seed.sh
# 或
docker exec snippet-manager-backend python seed_data.py
```

## 📊 访问地址

**生产环境：**
- 前端: http://localhost
- API: http://localhost:5000/api

**开发环境：**
- 前端: http://localhost:3000
- API: http://localhost:5000/api

## 🔧 常用操作

### 重启服务

```bash
docker-compose restart
```

### 查看运行状态

```bash
docker-compose ps
```

### 查看特定服务日志

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 进入容器

```bash
# 后端容器
docker exec -it snippet-manager-backend bash

# 前端容器
docker exec -it snippet-manager-frontend sh
```

### 重新构建

```bash
docker-compose build --no-cache
docker-compose up -d
```

## 💾 数据管理

### 备份数据库

```bash
docker cp snippet-manager-backend:/app/instance/snippets.db ./backup-$(date +%Y%m%d).db
```

### 恢复数据库

```bash
docker cp ./backup.db snippet-manager-backend:/app/instance/snippets.db
docker-compose restart backend
```

### 查看数据库

```bash
docker exec -it snippet-manager-backend sqlite3 /app/instance/snippets.db
# 在 SQLite shell 中：
# .tables          - 查看所有表
# .schema snippets - 查看表结构
# SELECT * FROM snippets; - 查询数据
# .quit            - 退出
```

## 🧹 清理命令

### 停止并删除容器

```bash
docker-compose down
```

### 删除容器和数据（⚠️ 危险）

```bash
docker-compose down -v
```

### 清理未使用的镜像

```bash
docker image prune -a
```

### 完全清理系统

```bash
docker system prune -a --volumes
```

## 🐛 故障排查

### 查看详细错误

```bash
docker-compose logs backend
docker-compose logs frontend
```

### 检查容器健康状态

```bash
docker ps
docker inspect snippet-manager-backend
```

### 端口冲突

```bash
# 查看端口占用
lsof -i :80
lsof -i :5000

# 修改端口（编辑 docker-compose.yml）
```

### 重新初始化

```bash
docker-compose down -v
docker-compose up -d
./docker-seed.sh
```

## 📈 性能监控

### 查看资源使用

```bash
docker stats
```

### 查看容器大小

```bash
docker ps -s
```

### 查看镜像大小

```bash
docker images | grep snippet-manager
```

## 🔐 安全提示

- 修改 `.env` 中的 `SECRET_KEY`
- 不要提交 `.env` 文件到版本控制
- 定期更新依赖和基础镜像
- 使用 HTTPS（配置反向代理）
- 定期备份数据库

## 📚 相关链接

- [完整 Docker 文档](./DOCKER.md)
- [项目 README](./README.md)
- [开发文档](./DEVELOPMENT.md)
- [快速开始](./QUICKSTART.md)

## 💡 提示

- 首次启动可能需要下载镜像（较慢）
- 数据存储在 Docker Volume 中，容器删除不影响数据
- 开发环境支持代码热重载
- 生产环境使用 Nginx 优化性能
