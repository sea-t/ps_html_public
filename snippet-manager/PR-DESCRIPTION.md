# 代码片段 & 提示词管理工具 - Docker 容器化部署

## 📝 PR 概述

这个 PR 添加了一个功能完整的**代码片段和 AI 提示词管理工具**，支持 Docker 容器化部署，包含自动化 CI/CD 流程。

## 🎯 主要功能

### 核心功能
- ✅ 代码片段管理（支持 12+ 编程语言，语法高亮）
- ✅ AI 提示词模板管理
- ✅ 智能搜索和全文检索
- ✅ 灵活的标签分类系统
- ✅ 一键复制到剪贴板
- ✅ 数据持久化存储

### 技术栈
- **前端**: Vue 3 + Element Plus + Vite
- **后端**: Flask 3.0 + SQLAlchemy + SQLite
- **容器**: Docker + Nginx + Gunicorn
- **CI/CD**: GitHub Actions

## 🚀 新增内容

### 1. 完整的应用程序
```
snippet-manager/
├── backend/              # Python Flask 后端
│   ├── app/             # 应用模块
│   ├── Dockerfile       # Docker 配置
│   └── requirements.txt # Python 依赖
├── frontend/            # Vue 3 前端
│   ├── src/            # 源代码
│   ├── Dockerfile      # 生产环境镜像
│   └── nginx.conf      # Nginx 配置
└── docker-compose.yml  # Docker 编排
```

### 2. GitHub Actions CI/CD
- `.github/workflows/docker-build.yml` - 自动构建和发布镜像
- 推送到 GitHub Container Registry (ghcr.io)
- 支持版本标签和自动构建

### 3. 三种部署方式

#### 方式一：预构建镜像（推荐）⭐
```bash
./docker-run.sh
```
- 无需本地构建
- 自动拉取最新镜像
- 启动速度极快（1-2 分钟）

#### 方式二：本地构建
```bash
./docker-start.sh
```
- 从源码构建镜像
- 适合自定义需求

#### 方式三：传统安装
- 手动安装 Python 和 Node.js
- 详见 QUICKSTART.md

### 4. 完善的文档体系

| 文档 | 说明 |
|------|------|
| README.md | 项目介绍和功能说明 |
| INSTALL.md | 预构建镜像快速安装 ⭐ |
| README-SIMPLE.md | 极简版使用说明 |
| DOCKER.md | Docker 完整部署指南 |
| DOCKER-CHEATSHEET.md | Docker 快速参考 |
| GITHUB-ACTIONS-SETUP.md | GitHub Actions 配置指南 |
| DEVELOPMENT.md | 开发文档和规范 |
| QUICKSTART.md | 传统方式快速开始 |

### 5. 便捷管理脚本
- `docker-run.sh` - 一键启动（使用预构建镜像）
- `docker-update.sh` - 一键更新到最新版本
- `docker-start.sh` - 启动（本地构建）
- `docker-start-dev.sh` - 开发环境启动
- `docker-stop.sh` - 停止服务
- `docker-logs.sh` - 查看日志
- `docker-seed.sh` - 添加示例数据

## 📦 部署方式对比

| 特性 | 预构建镜像 | 本地构建 | 传统安装 |
|------|-----------|---------|---------|
| 启动速度 | ⚡ 极快 | 🐌 较慢 | 🐌 很慢 |
| 环境依赖 | 仅 Docker | Docker | Python + Node.js |
| 构建时间 | 0 分钟 | 5-10 分钟 | 10-20 分钟 |
| 环境一致性 | ✅ 完全一致 | ✅ 一致 | ⚠️ 可能不同 |

## 🎨 技术亮点

### 前端
- Vue 3 Composition API
- Element Plus UI 组件库
- 响应式卡片布局
- Highlight.js 代码高亮
- Axios HTTP 客户端

### 后端
- Flask 3.0 RESTful API
- SQLAlchemy ORM
- SQLite 数据库
- Flask-CORS 跨域支持
- Gunicorn WSGI 服务器

### Docker 优化
- 多阶段构建减小镜像体积
- Nginx 静态文件服务
- 健康检查和自动重启
- Docker Volume 数据持久化
- 开发/生产双环境配置

### CI/CD 自动化
- GitHub Actions 自动构建
- 推送到 GitHub Container Registry
- 多种触发方式（push/PR/tag/手动）
- 构建缓存优化
- 版本化标签管理

## 📊 API 接口

完整的 RESTful API：

```
GET    /api/snippets       # 获取片段列表（支持搜索和过滤）
GET    /api/snippets/:id   # 获取单个片段
POST   /api/snippets       # 创建片段
PUT    /api/snippets/:id   # 更新片段
DELETE /api/snippets/:id   # 删除片段
GET    /api/tags           # 获取所有标签
GET    /api/stats          # 获取统计信息
```

## 🧪 测试说明

### 本地测试

```bash
# 1. 启动服务
cd snippet-manager
./docker-run.sh

# 2. 访问应用
# 前端: http://localhost
# API: http://localhost:5000/api

# 3. 添加示例数据
./docker-seed.sh
```

### 功能测试清单
- [ ] 添加代码片段
- [ ] 添加提示词
- [ ] 搜索功能
- [ ] 标签筛选
- [ ] 编辑片段
- [ ] 删除片段
- [ ] 复制功能
- [ ] 代码高亮显示

## 📈 后续计划

- [ ] Markdown 渲染支持
- [ ] 导入/导出功能（JSON/CSV）
- [ ] 用户认证系统
- [ ] 片段分享功能
- [ ] 版本控制
- [ ] 暗色主题
- [ ] Kubernetes 部署配置

## ⚠️ 重要提示

### 合并后需要的操作

1. **等待 GitHub Actions 构建**
   - 合并后自动触发构建
   - 访问 Actions 页面查看进度
   - 通常需要 5-10 分钟

2. **设置镜像为公开**（重要！）
   - 访问: https://github.com/sea-t?tab=packages
   - 找到两个包并设置为 Public：
     - `ps_html_public/snippet-manager-backend`
     - `ps_html_public/snippet-manager-frontend`

3. **测试一键启动**
   ```bash
   cd snippet-manager
   ./docker-run.sh
   ```

详细步骤见: `snippet-manager/GITHUB-ACTIONS-SETUP.md`

## 🎯 预期效果

合并并完成配置后，用户可以：

```bash
# 1. 克隆项目
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager

# 2. 一键启动
./docker-run.sh

# 3. 访问应用
# http://localhost
```

**就这么简单！** 🚀

## 📸 截图

（可以在合并后添加应用截图）

## ✅ Checklist

- [x] 功能完整实现
- [x] Docker 容器化配置
- [x] GitHub Actions CI/CD
- [x] 文档齐全
- [x] 代码注释清晰
- [x] 示例数据脚本
- [x] 健康检查配置
- [x] 数据持久化方案
- [x] 安全配置（.gitignore, .dockerignore）

## 📝 提交记录

1. `94cbdc6` - feat: 新增代码片段和提示词管理工具
2. `dc5d470` - feat: 完善 Docker 容器化部署方案
3. `41254d5` - feat: 添加 GitHub Actions CI/CD 和预构建镜像支持
4. `2008a93` - docs: 添加 GitHub Actions 配置指南

## 🙏 致谢

感谢使用此工具！如有问题或建议，欢迎提出 Issue。

---

**Review 要点**:
- ✅ 代码质量和结构
- ✅ Docker 配置安全性
- ✅ 文档完整性
- ✅ API 设计合理性
