# 🚀 快速安装指南

使用预构建的 Docker 镜像，**无需构建**，一键启动！

## ⚡ 超快速启动（推荐）

### 方式一：一键运行脚本

```bash
# 1. 下载项目
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager

# 2. 一键启动（自动拉取镜像）
./docker-run.sh
```

访问：http://localhost

### 方式二：手动命令

```bash
# 1. 下载项目
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager

# 2. 拉取镜像并启动
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

访问：http://localhost

## 📦 镜像信息

镜像自动从 GitHub Actions 构建并发布到 GitHub Container Registry：

- **前端镜像**: `ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest`
- **后端镜像**: `ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest`

镜像特点：
- ✅ 自动构建，始终最新
- ✅ 多平台支持（amd64/arm64）
- ✅ 经过优化，体积小
- ✅ 包含所有依赖，开箱即用

## 🎯 完整使用流程

### 1. 首次安装

```bash
# 克隆仓库
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager

# 一键启动
./docker-run.sh

# 添加示例数据（可选）
./docker-seed.sh
```

### 2. 日常使用

```bash
# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 停止服务
docker-compose -f docker-compose.prod.yml down

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 重启服务
docker-compose -f docker-compose.prod.yml restart
```

### 3. 更新到最新版本

```bash
# 使用更新脚本
./docker-update.sh

# 或手动执行
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 配置说明

### 环境变量

首次运行 `./docker-run.sh` 会自动创建 `.env` 文件。

如需自定义配置，编辑 `.env` 文件：

```env
# 安全密钥（推荐修改）
SECRET_KEY=your-super-secret-key

# 数据库路径
DATABASE_URL=sqlite:///instance/snippets.db

# Flask 环境
FLASK_ENV=production
```

### 端口配置

默认端口：
- 前端：80
- 后端API：5000

修改端口（编辑 `docker-compose.prod.yml`）：

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # 改为 8080 端口
```

## 📊 访问应用

启动后访问：
- 🌐 前端界面：http://localhost
- 🔌 后端API：http://localhost:5000/api
- 📈 统计接口：http://localhost:5000/api/stats

## 💾 数据管理

### 备份数据

```bash
# 备份数据库
docker cp snippet-manager-backend:/app/instance/snippets.db ./backup-$(date +%Y%m%d).db
```

### 恢复数据

```bash
# 恢复数据库
docker cp ./backup.db snippet-manager-backend:/app/instance/snippets.db
docker-compose -f docker-compose.prod.yml restart backend
```

### 清空数据

```bash
# 停止并删除所有数据（⚠️ 谨慎操作）
docker-compose -f docker-compose.prod.yml down -v
```

## 🐛 故障排查

### 端口被占用

```bash
# 查看端口占用
lsof -i :80
lsof -i :5000

# 修改 docker-compose.prod.yml 中的端口
```

### 镜像拉取失败

```bash
# 检查网络连接
ping ghcr.io

# 如果是私有仓库，需要登录
docker login ghcr.io

# 手动拉取镜像
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest
```

### 服务无法启动

```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yml logs

# 重新拉取并启动
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🆚 部署方式对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| **预构建镜像** | ✅ 无需构建<br>✅ 启动极快<br>✅ 环境一致 | ⚠️ 需要网络下载 |
| **本地构建** | ✅ 完全离线<br>✅ 可自定义 | ❌ 构建耗时<br>❌ 依赖本地环境 |
| **传统安装** | ✅ 完全可控 | ❌ 配置复杂<br>❌ 环境依赖多 |

## 📚 相关文档

- [README.md](./README.md) - 项目介绍
- [DOCKER.md](./DOCKER.md) - Docker 完整指南
- [DOCKER-CHEATSHEET.md](./DOCKER-CHEATSHEET.md) - Docker 快速参考
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发文档

## 💡 常见问题

**Q: 需要安装 Python 或 Node.js 吗？**
A: 不需要！只需安装 Docker 即可。

**Q: 数据会丢失吗？**
A: 不会。数据存储在 Docker Volume 中，即使删除容器也不会丢失。

**Q: 如何更新到最新版本？**
A: 运行 `./docker-update.sh` 即可。

**Q: 可以在服务器上运行吗？**
A: 可以！支持任何安装了 Docker 的 Linux 服务器。

**Q: 镜像是公开的吗？**
A: 是的，镜像发布在 GitHub Container Registry，任何人都可以拉取。

## 🔐 安全建议

✅ 修改 `.env` 中的 `SECRET_KEY`
✅ 使用强密码（如果添加用户认证）
✅ 定期备份数据库
✅ 生产环境建议配置 HTTPS
✅ 限制容器资源使用

## 🎉 开始使用

现在只需一条命令：

```bash
./docker-run.sh
```

就可以开始使用代码片段管理器了！

---

**遇到问题？** 查看 [DOCKER.md](./DOCKER.md) 获取更多帮助。
