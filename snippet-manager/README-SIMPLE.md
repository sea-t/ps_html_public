# 代码片段 & 提示词管理器

> 一个功能完整的代码片段和 AI 提示词管理工具

## 🚀 一键启动

```bash
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager
./docker-run.sh
```

打开浏览器：http://localhost

**就这么简单！** 🎉

## 📦 自动构建的 Docker 镜像

- ✅ GitHub Actions 自动构建
- ✅ 发布到 GitHub Container Registry
- ✅ 无需本地构建，直接拉取使用
- ✅ 始终保持最新

## 🎯 主要功能

- 代码片段管理（支持多种编程语言）
- AI 提示词模板管理
- 智能搜索和标签分类
- 代码语法高亮
- 一键复制

## 📚 文档

- [完整文档](./README.md)
- [快速安装](./INSTALL.md) ⭐
- [Docker 指南](./DOCKER.md)

## 🔧 常用命令

```bash
# 启动
./docker-run.sh

# 更新
./docker-update.sh

# 停止
docker-compose -f docker-compose.prod.yml down

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 添加示例数据
./docker-seed.sh
```

## 🌟 技术栈

**前端**: Vue 3 + Element Plus
**后端**: Flask + SQLite
**容器**: Docker + Nginx

---

**MIT License** | 欢迎贡献 | [GitHub](https://github.com/sea-t/ps_html_public)
