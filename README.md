# ps_html_public
公开的HTML工具箱

## 项目列表

### 📋 代码片段 & 提示词管理器 (Snippet Manager)

一个功能完整的代码片段和AI提示词管理工具，支持用户认证、分类、搜索、标签管理、收藏、Markdown预览、导入导出等功能。

**功能特性：**
- 🔐 **用户认证系统** - JWT token认证，注册/登录功能
- 📝 **代码片段管理** - 支持多种编程语言的代码片段存储
- 💬 **提示词管理** - AI提示词模板的集中管理
- 🔍 **智能搜索** - 支持标题、内容、描述的全文搜索
- 🏷️ **标签分类** - 灵活的标签系统，方便分类和检索
- ⭐ **收藏夹功能** - 快速标记和筛选重要片段
- 🌓 **暗色主题** - 支持亮色/暗色主题切换
- 📄 **Markdown支持** - 提示词支持Markdown格式预览
- 📤 **导入导出** - 支持JSON/CSV格式批量导入导出
- 🔗 **片段分享** - 多种格式分享和下载单个片段
- 🎨 **代码高亮** - 使用 highlight.js 提供美观的代码高亮
- 💾 **数据持久化** - 基于 PostgreSQL 数据库存储

**技术栈：**
- 前端：Vue 3 + Element Plus + Vite
- 后端：Flask + SQLAlchemy + PostgreSQL
- 认证：JWT + Bcrypt
- 容器化：Docker + Docker Compose

## 🚀 快速部署

### 方案一：使用预构建镜像（推荐）⚡

**无需构建，直接运行！** 镜像已在 GitHub Actions 自动构建并发布。

```bash
# 1. 克隆项目
git clone https://github.com/sea-t/ps_html_public.git
cd ps_html_public/snippet-manager

# 2. 一键启动（自动拉取镜像）
./docker-run.sh
```

访问：http://localhost

**镜像信息：**
- 前端: `ghcr.io/sea-t/ps_html_public/snippet-manager-frontend:latest`
- 后端: `ghcr.io/sea-t/ps_html_public/snippet-manager-backend:latest`

### 方案二：本地构建部署 🐳

如果你想从源码构建镜像：

```bash
cd ps_html_public/snippet-manager

# 生产环境
./docker-start.sh

# 开发环境（支持热重载）
./docker-start-dev.sh
```

**访问地址：**
- 生产环境: http://localhost
- 开发环境: http://localhost:3000

### 方案三：服务器一键部署 🌐

在服务器上快速部署：

```bash
# 使用 wget
wget -O install.sh https://raw.githubusercontent.com/sea-t/ps_html_public/main/snippet-manager/install.sh && bash install.sh

# 或使用 curl
curl -fsSL https://raw.githubusercontent.com/sea-t/ps_html_public/main/snippet-manager/install.sh | bash
```

部署完成后访问 `http://YOUR_SERVER_IP`

## 📝 使用指南

### 首次使用

1. **注册账号**
   - 访问应用首页
   - 点击"注册"按钮
   - 填写用户名、邮箱和密码
   - 完成注册

2. **登录系统**
   - 使用注册的用户名和密码登录
   - 登录成功后进入主界面

### 基本操作

#### 添加片段
1. 点击左侧边栏的"添加代码片段"或"添加提示词"
2. 填写标题、描述、内容
3. 选择编程语言（代码片段）
4. 添加标签（可选）
5. 点击"保存"

#### 搜索和过滤
- 使用左侧搜索框输入关键词
- 通过类型过滤：全部/代码片段/提示词/收藏夹
- 点击标签进行筛选

#### 收藏功能
- 点击片段卡片上的星标按钮添加/取消收藏
- 在左侧边栏选择"收藏夹"查看所有收藏

#### 主题切换
- 点击右上角的月亮/太阳图标切换暗色/亮色主题

#### Markdown预览
- 查看包含Markdown语法的提示词时
- 系统自动显示"源码/预览"切换按钮
- 点击"预览"查看渲染效果

#### 导入导出
1. 点击左侧边栏的"导入/导出"按钮
2. **导出**：选择JSON或CSV格式导出所有片段
3. **导入**：拖拽或选择JSON文件批量导入

#### 分享和下载
1. 点击片段查看对话框中的"分享"按钮
   - 复制为 Markdown
   - 复制为纯文本
   - 生成分享文本
2. 点击"下载"按钮选择格式下载

## 🛠️ 高级配置

### 数据持久化

数据库文件挂载到 `./data/database/`：
- ✅ 升级容器不会丢失数据
- ✅ 可直接访问和备份数据库文件
- ✅ 易于数据迁移

### 环境变量配置

编辑 `.env` 文件自定义配置：

```bash
# 后端配置
FLASK_ENV=production
DATABASE_URL=postgresql://user:password@db:5432/snippets
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# 数据库配置
POSTGRES_USER=snippets_user
POSTGRES_PASSWORD=your-password
POSTGRES_DB=snippets
```

### 端口配置

修改 `docker-compose.yml` 或 `docker-compose.dev.yml`：

```yaml
services:
  nginx:
    ports:
      - "8080:80"  # 修改为你需要的端口
```

## 📚 详细文档

- 📖 [完整功能说明](./snippet-manager/README.md)
- 🐳 [Docker 部署指南](./snippet-manager/DOCKER.md)
- 💻 [开发环境设置](./snippet-manager/DEVELOPMENT.md)
- 🧪 [测试文档](./snippet-manager/TESTING.md)
- 💾 [数据库配置](./snippet-manager/DATABASE-SETUP.md)

## 🔧 故障排除

### 端口被占用
```bash
# 停止现有容器
docker-compose down

# 修改端口后重启
./docker-start.sh
```

### 数据库连接失败
```bash
# 检查数据库容器状态
docker-compose ps

# 查看数据库日志
docker-compose logs db
```

### 前端无法访问后端
```bash
# 检查所有容器状态
docker-compose ps

# 查看后端日志
docker-compose logs backend
```

## 📞 获取帮助

- 查看日志：`docker-compose logs`
- 重启服务：`docker-compose restart`
- 完全重建：`docker-compose down && ./docker-start.sh`

## 📄 许可证

MIT License

---

**快速链接：**
- [查看在线演示](#)
- [提交问题](https://github.com/sea-t/ps_html_public/issues)
- [贡献指南](./CONTRIBUTING.md)
