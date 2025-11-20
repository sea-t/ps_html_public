# 🐳 Docker 快速启动指南

## 📋 简介

本项目配置了自动化 Docker 镜像构建流程。每次代码合并到 main 分支，GitHub Actions 会自动构建并发布 Docker 镜像到 GitHub Container Registry。

## 🚀 快速开始

### 方式一：一键启动（推荐）

```bash
# 克隆仓库
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager

# 一键启动
./docker-run.sh
```

访问：http://localhost

### 方式二：使用 docker-compose

```bash
cd snippet-manager
docker-compose -f docker-compose.prod.yml up -d
```

### 方式三：手动拉取镜像

```bash
# 拉取镜像
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest

# 启动
cd snippet-manager
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 自动化流程

### 触发条件

GitHub Actions 会在以下情况自动构建镜像：

1. **推送到 main/master 分支**
   ```bash
   git push origin main
   ```
   自动构建并推送 `latest` 标签

2. **创建版本标签**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   自动构建并推送多个标签：
   - `v1.0.0`
   - `1.0`
   - `1`
   - `latest`

3. **Pull Request**
   - 构建镜像但不推送
   - 用于测试构建是否成功

4. **手动触发**
   - 访问 GitHub Actions 页面
   - 选择 "Build and Push Docker Images"
   - 点击 "Run workflow"

### 查看构建状态

访问：https://github.com/sea-t/ps_html_public/actions

可以看到：
- ✅ 构建成功/失败状态
- 📊 构建日志
- ⏱️ 构建时长

### 查看已发布的镜像

访问：https://github.com/sea-t?tab=packages

可以看到：
- 📦 所有已发布的包
- 🏷️ 镜像标签
- 💾 镜像大小
- 📈 下载统计

## 🔑 设置镜像为公开（首次需要）

默认情况下，镜像是私有的。要让任何人都能拉取镜像，需要设置为公开：

1. 访问：https://github.com/sea-t?tab=packages
2. 点击包名进入详情页
3. 点击右侧 "Package settings"
4. 在 "Danger Zone" 找到 "Change visibility"
5. 选择 "Public"
6. 确认更改

## 📦 镜像信息

### 镜像地址

- **后端镜像**: `ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest`
- **前端镜像**: `ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest`

### 镜像大小

- 后端：约 200MB（Python 3.11 + Flask）
- 前端：约 50MB（Nginx + Vue.js 构建产物）

### 支持的标签

- `latest` - 最新的 main 分支构建
- `main` - main 分支最新构建
- `v1.0.0` - 具体版本号（需要打标签）
- `1.0` - 主版本.次版本
- `1` - 主版本

## 🛠️ 常用命令

### 拉取最新镜像

```bash
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest
```

### 启动服务

```bash
cd snippet-manager
docker-compose -f docker-compose.prod.yml up -d
```

### 查看日志

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 停止服务

```bash
docker-compose -f docker-compose.prod.yml down
```

### 更新镜像

```bash
# 拉取最新镜像
docker-compose -f docker-compose.prod.yml pull

# 重启服务
docker-compose -f docker-compose.prod.yml up -d
```

或使用脚本：
```bash
./docker-update.sh
```

### 清理旧镜像

```bash
docker image prune -a
```

## 🔍 故障排查

### 问题：无法拉取镜像 (unauthorized)

**解决方案：**
1. 确保镜像已设置为 Public
2. 或使用 GitHub Token 登录：
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u sea-t --password-stdin
   ```

### 问题：镜像不存在 (manifest unknown)

**解决方案：**
1. 检查 GitHub Actions 是否构建成功
2. 等待构建完成（通常需要 5-10 分钟）
3. 确认镜像名称和标签正确

### 问题：容器启动失败

**解决方案：**
1. 查看日志：
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```
2. 检查端口是否被占用：
   ```bash
   lsof -i :80
   lsof -i :5000
   ```
3. 检查环境变量配置

### 问题：前端无法连接后端

**解决方案：**
1. 确认两个容器都在运行：
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```
2. 检查网络配置：
   ```bash
   docker network inspect snippet-manager_snippet-network
   ```

## 📊 性能优化

### 使用缓存加速构建

GitHub Actions 已配置 BuildKit 缓存，后续构建会更快。

### 多阶段构建

前端镜像使用多阶段构建：
1. 第一阶段：Node.js 环境构建
2. 第二阶段：仅复制构建产物到 Nginx

最终镜像大小大幅减小。

### 健康检查

两个镜像都配置了健康检查：
- 后端：每 30 秒检查 `/api/stats` 端点
- 前端：每 30 秒检查首页

## 🎯 版本发布流程

### 开发版本（自动）

```bash
# 正常开发
git add .
git commit -m "feat: 新功能"
git push origin main

# GitHub Actions 自动构建 latest 标签
```

### 正式版本（手动打标签）

```bash
# 打标签
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# GitHub Actions 自动构建多个标签：
# - v1.0.0
# - 1.0
# - 1
# - latest
```

## 📚 相关文档

- [完整安装指南](./snippet-manager/INSTALL.md)
- [GitHub Actions 配置详解](./snippet-manager/GITHUB-ACTIONS-SETUP.md)
- [Docker 部署文档](./snippet-manager/DOCKER.md)
- [开发指南](./snippet-manager/DEVELOPMENT.md)

## 🎉 完成！

现在你可以：

✅ 直接拉取预构建镜像，无需本地构建
✅ 一键启动完整应用
✅ 自动获取最新更新
✅ 快速部署到生产环境

有问题？查看 [Issues](https://github.com/sea-t/ps_html_public/issues) 或提交新 Issue。
