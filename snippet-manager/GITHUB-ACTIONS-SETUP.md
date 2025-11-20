# GitHub Actions 自动构建配置指南

## 📋 概述

本项目已配置 GitHub Actions 工作流，可以自动构建 Docker 镜像并推送到 GitHub Container Registry (ghcr.io)。

## 🔄 工作流程

```
代码推送 → GitHub Actions 触发 → 构建镜像 → 推送到 ghcr.io → 用户拉取使用
```

## ✅ 已配置内容

1. **GitHub Actions 工作流**
   - 文件位置：`.github/workflows/docker-build.yml`
   - 自动构建前后端镜像
   - 支持多种触发方式

2. **预构建镜像配置**
   - `docker-compose.prod.yml` - 使用预构建镜像
   - `docker-run.sh` - 一键启动脚本
   - `docker-update.sh` - 一键更新脚本

3. **文档**
   - `INSTALL.md` - 安装指南
   - `README-SIMPLE.md` - 极简说明

## 🚀 激活步骤

### 步骤 1: 合并分支到主分支

```bash
# 在 GitHub 网页上操作：
# 1. 进入 Pull Requests
# 2. 创建 PR: claude/snippet-prompt-manager-01QpuXuFaXMjDHvU6dbb41j3 → main
# 3. 合并 PR
```

或使用命令行：

```bash
# 切换到主分支
git checkout main

# 合并功能分支
git merge claude/snippet-prompt-manager-01QpuXuFaXMjDHvU6dbb41j3

# 推送到远程
git push origin main
```

### 步骤 2: 等待 GitHub Actions 构建

1. 推送后，访问：https://github.com/sea-t/ps_html_public/actions
2. 查看 "Build and Push Docker Images" 工作流
3. 等待构建完成（通常需要 5-10 分钟）

### 步骤 3: 设置包访问权限（重要！）

GitHub Container Registry 的镜像默认是私有的，需要设置为公开：

1. 访问：https://github.com/sea-t?tab=packages
2. 找到以下两个包：
   - `ps_html_public/snippet-manager-backend`
   - `ps_html_public/snippet-manager-frontend`
3. 点击每个包进入设置页面
4. 在右侧 "Package settings" → "Danger Zone"
5. 点击 "Change visibility" → 选择 "Public"
6. 确认更改

### 步骤 4: 测试拉取镜像

```bash
# 拉取前端镜像
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest

# 拉取后端镜像
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest

# 验证镜像
docker images | grep snippet-manager
```

### 步骤 5: 测试一键启动

```bash
cd snippet-manager
./docker-run.sh
```

打开浏览器访问：http://localhost

## 🔧 配置说明

### GitHub Actions 工作流

**文件**: `.github/workflows/docker-build.yml`

**触发条件**:
- 推送到 `main` 或 `master` 分支
- 创建标签（如 `v1.0.0`）
- Pull Request
- 手动触发

**构建内容**:
- 后端镜像：`ghcr.io/sea-t/ps_html_public/snippet-manager-backend`
- 前端镜像：`ghcr.io/sea-t/ps_html_public/snippet-manager-frontend`

**标签策略**:
- `latest` - 最新的 main 分支构建
- `<branch>` - 分支名称
- `v1.0.0` - 版本标签（需要手动打标签）

### 权限配置

工作流使用 `GITHUB_TOKEN` 自动推送镜像，无需额外配置。

该 token 具有以下权限：
- `contents: read` - 读取代码
- `packages: write` - 推送镜像到 GHCR

## 📦 镜像使用

### 公开访问

设置为 Public 后，任何人都可以拉取：

```bash
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest
```

### 私有访问（如果保持私有）

需要先登录：

```bash
# 创建 Personal Access Token (需要 read:packages 权限)
# 访问：https://github.com/settings/tokens

# 登录
echo $GITHUB_TOKEN | docker login ghcr.io -u sea-t --password-stdin

# 拉取镜像
docker pull ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest
```

## 🎯 版本发布流程

### 开发版本（自动）

每次推送到 main 分支都会自动构建 `latest` 标签：

```bash
git push origin main
# 自动构建 latest 镜像
```

### 正式版本（手动打标签）

发布正式版本：

```bash
# 打标签
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# GitHub Actions 自动构建并推送：
# - ghcr.io/.../snippet-manager-frontend:v1.0.0
# - ghcr.io/.../snippet-manager-frontend:1.0
# - ghcr.io/.../snippet-manager-frontend:latest
```

## 🔍 查看构建状态

### GitHub Actions 页面

访问：https://github.com/sea-t/ps_html_public/actions

可以看到：
- 构建历史
- 构建日志
- 构建时长
- 成功/失败状态

### 查看已发布的镜像

访问：https://github.com/sea-t?tab=packages

可以看到：
- 所有已发布的包
- 镜像标签
- 镜像大小
- 下载统计

## 📊 使用统计

设置为 Public 后，可以在包页面查看：
- 总下载次数
- 各版本下载量
- 使用情况

## 🐛 故障排查

### 构建失败

查看 Actions 日志：
1. 访问 https://github.com/sea-t/ps_html_public/actions
2. 点击失败的工作流
3. 查看详细日志

常见问题：
- Dockerfile 路径错误
- 依赖安装失败
- 磁盘空间不足

### 无法拉取镜像

**错误**: `unauthorized: unauthenticated`

解决方案：
- 确保镜像已设置为 Public
- 或使用 GitHub Token 登录

**错误**: `manifest unknown`

解决方案：
- 等待 GitHub Actions 构建完成
- 检查镜像标签是否正确

## 📈 后续优化

可以考虑的优化：

1. **多平台构建**
   - 添加 ARM64 支持
   - 添加更多平台

2. **构建优化**
   - 使用分层缓存
   - 优化依赖安装

3. **安全扫描**
   - 添加漏洞扫描
   - 添加安全检查

4. **自动化测试**
   - 添加单元测试
   - 添加集成测试

## 🎉 完成检查清单

- [ ] 合并分支到 main
- [ ] GitHub Actions 构建成功
- [ ] 设置包为 Public
- [ ] 成功拉取镜像
- [ ] 成功运行 `./docker-run.sh`
- [ ] 访问 http://localhost 正常

完成后，你的用户就可以直接使用：

```bash
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager
./docker-run.sh
```

一键启动应用了！🚀

## 📚 相关链接

- GitHub Actions 文档：https://docs.github.com/actions
- GitHub Container Registry：https://docs.github.com/packages
- Docker Buildx：https://docs.docker.com/buildx/
