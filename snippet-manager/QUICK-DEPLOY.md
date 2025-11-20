# 🚀 快速部署指南

一键部署 Snippet Manager 到你的服务器。

## 📋 前置要求

- Linux 服务器（Ubuntu/Debian/CentOS 等）
- 已安装 Docker 和 Docker Compose
- 开放 80 端口（可选：5000 端口用于后端 API）

## ⚡ 一键安装

在服务器上执行以下命令：

```bash
wget -O install.sh https://raw.githubusercontent.com/sea-t/ps_html_public/main/snippet-manager/install.sh && bash install.sh
```

或者使用 curl：

```bash
curl -fsSL https://raw.githubusercontent.com/sea-t/ps_html_public/main/snippet-manager/install.sh | bash
```

## 📦 安装脚本会自动完成

1. ✅ 检查 Docker 环境
2. ✅ 创建项目目录 `~/snippet-manager`
3. ✅ 生成配置文件（docker-compose.yml 和 .env）
4. ✅ 从 GitHub Container Registry 拉取最新镜像
5. ✅ 启动服务并等待就绪
6. ✅ 显示访问地址和常用命令

## 🌐 访问应用

安装完成后，访问：

- **本地**: http://localhost
- **远程**: http://YOUR_SERVER_IP

## 🔧 常用命令

所有命令需要在项目目录执行：`cd ~/snippet-manager`

### 查看日志
```bash
docker compose logs -f
# 或只看某个服务
docker compose logs -f frontend
docker compose logs -f backend
```

### 停止服务
```bash
docker compose stop
```

### 启动服务
```bash
docker compose start
```

### 重启服务
```bash
docker compose restart
```

### 更新到最新版本
```bash
docker compose pull
docker compose up -d
```

### 查看服务状态
```bash
docker compose ps
```

### 完全卸载
```bash
docker compose down -v  # -v 会删除数据卷
```

## 🔒 安全建议

1. **修改 SECRET_KEY**
   ```bash
   nano ~/snippet-manager/.env
   # 修改 SECRET_KEY 为随机字符串
   ```

2. **配置防火墙**（仅允许必要的端口）
   ```bash
   # Ubuntu/Debian (ufw)
   sudo ufw allow 80/tcp
   sudo ufw enable

   # CentOS/RHEL (firewalld)
   sudo firewall-cmd --permanent --add-port=80/tcp
   sudo firewall-cmd --reload
   ```

3. **使用 HTTPS**
   - 建议配置 Nginx 反向代理
   - 使用 Let's Encrypt 免费证书

## 🐛 故障排查

### 服务无法启动

1. 检查 Docker 是否运行
   ```bash
   docker info
   ```

2. 查看详细日志
   ```bash
   docker compose logs
   ```

3. 检查端口占用
   ```bash
   sudo netstat -tlnp | grep -E '(80|5000)'
   ```

### 无法访问

1. 检查防火墙设置
2. 确认服务已启动：`docker compose ps`
3. 检查容器健康状态：`docker compose ps` 看 Status 列

### 镜像拉取失败

1. 检查网络连接
2. 如果在中国大陆，可能需要配置 Docker 镜像加速器
   ```bash
   # 编辑 /etc/docker/daemon.json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn"
     ]
   }
   # 重启 Docker
   sudo systemctl restart docker
   ```

## 📁 文件位置

- **项目目录**: `~/snippet-manager/`
- **配置文件**: `~/snippet-manager/docker-compose.yml`
- **环境变量**: `~/snippet-manager/.env`
- **数据持久化**: Docker Volume `backend-data`

## 🔄 数据备份

备份数据库：

```bash
# 备份
docker cp snippet-manager-backend:/app/instance/snippets.db ./backup-$(date +%Y%m%d).db

# 恢复
docker cp ./backup-YYYYMMDD.db snippet-manager-backend:/app/instance/snippets.db
docker compose restart backend
```

## 🆘 获取帮助

如果遇到问题：

1. 查看完整文档：[INSTALL.md](./INSTALL.md)
2. 查看 Docker 文档：[DOCKER.md](./DOCKER.md)
3. 提交 Issue：[GitHub Issues](https://github.com/sea-t/ps_html_public/issues)

## 📝 手动安装

如果一键脚本失败，可以手动安装：

```bash
# 1. 创建目录
mkdir -p ~/snippet-manager && cd ~/snippet-manager

# 2. 下载配置文件
wget https://raw.githubusercontent.com/sea-t/ps_html_public/main/snippet-manager/docker-compose.prod.yml -O docker-compose.yml

# 3. 创建环境变量文件
cat > .env << EOF
SECRET_KEY=$(openssl rand -hex 32)
FLASK_ENV=production
EOF

# 4. 启动服务
docker compose pull
docker compose up -d

# 5. 查看状态
docker compose ps
docker compose logs -f
```

## ✨ 特性

- 🎯 零配置部署，开箱即用
- 🐳 基于 Docker，环境隔离
- 📦 使用官方预构建镜像，无需编译
- 🔄 支持一键更新
- 💾 数据自动持久化
- 🏥 内置健康检查
- 🔒 生产环境优化

---

**享受使用 Snippet Manager！** 🎉
