# 代码片段 & 提示词管理器

一个功能完整的代码片段和AI提示词管理工具，支持分类、搜索、标签管理等功能。

## 功能特性

### 核心功能
- 📝 **代码片段管理** - 支持多种编程语言的代码片段存储
- 💬 **提示词管理** - AI提示词模板的集中管理
- 🔍 **智能搜索** - 支持标题、内容、描述的全文搜索
- 🏷️ **标签分类** - 灵活的标签系统，方便分类和检索
- 📋 **一键复制** - 快速复制片段内容到剪贴板
- 🎨 **代码高亮** - 使用 highlight.js 提供美观的代码高亮
- 💾 **数据持久化** - 基于 SQLite 数据库存储

### 技术特性
- 前后端分离架构
- RESTful API 设计
- 响应式界面设计
- 实时数据统计

## 技术栈

### 后端
- **框架**: Flask 3.0
- **数据库**: SQLite + SQLAlchemy
- **跨域**: Flask-CORS

### 前端
- **框架**: Vue 3
- **UI组件**: Element Plus
- **构建工具**: Vite
- **HTTP客户端**: Axios
- **代码高亮**: highlight.js

## 项目结构

```
snippet-manager/
├── backend/                 # 后端代码
│   ├── app/
│   │   ├── __init__.py     # Flask应用初始化
│   │   ├── models.py       # 数据库模型
│   │   └── routes.py       # API路由
│   ├── instance/           # 数据库文件目录
│   ├── config.py           # 配置文件
│   ├── run.py              # 启动文件
│   ├── requirements.txt    # Python依赖
│   └── .env.example        # 环境变量示例
│
└── frontend/               # 前端代码
    ├── src/
    │   ├── components/     # Vue组件
    │   │   ├── Sidebar.vue         # 侧边栏
    │   │   ├── SnippetList.vue     # 片段列表
    │   │   ├── SnippetDialog.vue   # 编辑对话框
    │   │   └── ViewDialog.vue      # 查看对话框
    │   ├── api/            # API接口
    │   │   └── snippets.js
    │   ├── App.vue         # 主应用组件
    │   └── main.js         # 应用入口
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 快速开始

### ⚡ 超快速启动（使用预构建镜像）

**无需构建，直接运行！** 镜像已在 GitHub Actions 自动构建并发布到 GitHub Container Registry。

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

**详细说明**: 查看 [INSTALL.md](./INSTALL.md) 📖

---

### 🐳 Docker 本地构建部署

如果你想从源码构建镜像：

**生产环境：**
```bash
./docker-start.sh
```

**开发环境：**
```bash
./docker-start-dev.sh
```

**访问应用：**
- 生产环境: http://localhost
- 开发环境: http://localhost:3000

**添加示例数据：**
```bash
./docker-seed.sh
```

**详细文档**: 查看 [DOCKER.md](./DOCKER.md)

---

### 📦 传统方式部署

如果不使用 Docker，可以按以下步骤手动安装：

#### 后端设置

1. 进入后端目录：
```bash
cd snippet-manager/backend
```

2. 创建虚拟环境（推荐）：
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

3. 安装依赖：
```bash
pip install -r requirements.txt
```

4. 配置环境变量（可选）：
```bash
cp .env.example .env
# 编辑 .env 文件设置自定义配置
```

5. 运行后端服务：
```bash
python run.py
```

后端服务将在 `http://localhost:5000` 启动

### 前端设置

1. 进入前端目录：
```bash
cd snippet-manager/frontend
```

2. 安装依赖：
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 运行开发服务器：
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

前端应用将在 `http://localhost:3000` 启动

### 生产构建

前端构建：
```bash
cd frontend
npm run build
```

构建产物将在 `frontend/dist` 目录下。

## API 接口

### 片段相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/snippets` | 获取所有片段（支持查询参数） |
| GET | `/api/snippets/:id` | 获取单个片段 |
| POST | `/api/snippets` | 创建新片段 |
| PUT | `/api/snippets/:id` | 更新片段 |
| DELETE | `/api/snippets/:id` | 删除片段 |
| GET | `/api/tags` | 获取所有标签 |
| GET | `/api/stats` | 获取统计信息 |

### 查询参数

- `type`: 片段类型（`code` 或 `prompt`）
- `search`: 搜索关键词
- `tag`: 标签过滤

### 请求示例

创建代码片段：
```json
POST /api/snippets
{
  "title": "快速排序",
  "content": "def quick_sort(arr):\n    ...",
  "description": "Python实现的快速排序算法",
  "snippet_type": "code",
  "language": "python",
  "tags": ["算法", "排序"]
}
```

创建提示词：
```json
POST /api/snippets
{
  "title": "文章摘要提示词",
  "content": "请为以下文章生成一个简洁的摘要...",
  "description": "用于生成文章摘要的AI提示词",
  "snippet_type": "prompt",
  "tags": ["AI", "摘要"]
}
```

## 使用指南

### 添加片段

1. 点击左侧边栏的"添加代码片段"或"添加提示词"按钮
2. 填写标题、描述、内容等信息
3. 选择编程语言（仅代码片段）
4. 添加标签（可选）
5. 点击"保存"

### 搜索片段

- 使用左侧搜索框输入关键词
- 通过类型过滤（全部/代码片段/提示词）
- 点击标签进行筛选

### 查看和复制

1. 点击片段卡片上的"查看"按钮
2. 在弹出的对话框中查看完整内容
3. 点击"复制"按钮将内容复制到剪贴板

### 编辑和删除

- 点击片段卡片上的"编辑"按钮进行修改
- 点击"删除"按钮删除片段（需确认）

## 数据模型

### Snippet（片段）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| title | String(200) | 标题 |
| content | Text | 内容 |
| description | Text | 描述 |
| snippet_type | String(20) | 类型（code/prompt） |
| language | String(50) | 编程语言 |
| tags | String(500) | 标签（逗号分隔） |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

## 部署方式对比

| 特性 | Docker 部署 | 传统部署 |
|------|------------|---------|
| 环境配置 | ✅ 自动配置 | ❌ 手动配置 |
| 依赖管理 | ✅ 容器化隔离 | ❌ 可能冲突 |
| 一键启动 | ✅ 支持 | ❌ 多步骤 |
| 跨平台 | ✅ 完全一致 | ⚠️ 可能差异 |
| 数据持久化 | ✅ Volume | ✅ 本地文件 |
| 生产就绪 | ✅ 包含 Nginx | ⚠️ 需额外配置 |
| 推荐场景 | 生产环境、快速体验 | 开发调试 |

## 开发计划

**已完成：**
- [x] 完整的前后端功能
- [x] Docker 容器化部署
- [x] GitHub Actions CI/CD 自动构建
- [x] 预构建镜像发布到 GitHub Container Registry
- [x] 生产环境 Nginx 配置
- [x] 开发环境热重载支持
- [x] 健康检查和自动重启
- [x] 数据持久化
- [x] 一键启动脚本

**计划中：**
- [ ] 支持 Markdown 格式
- [ ] 片段分享功能
- [ ] 导入/导出功能（JSON/CSV）
- [ ] 用户认证系统
- [ ] 片段版本控制
- [ ] 收藏夹功能
- [ ] 暗色主题
- [ ] Kubernetes 部署配置
- [ ] 多语言界面

## 文档索引

| 文档 | 说明 | 适用场景 |
|------|------|---------|
| 📖 [README.md](./README.md) | 项目介绍和功能说明 | 了解项目 |
| ⚡ [INSTALL.md](./INSTALL.md) | 预构建镜像快速安装 | **推荐首选** ⭐ |
| 🐳 [DOCKER.md](./DOCKER.md) | Docker 完整部署指南 | 深入了解 Docker |
| 📋 [DOCKER-CHEATSHEET.md](./DOCKER-CHEATSHEET.md) | Docker 快速参考 | 日常使用 |
| 🚀 [QUICKSTART.md](./QUICKSTART.md) | 传统方式快速开始 | 手动部署 |
| 💻 [DEVELOPMENT.md](./DEVELOPMENT.md) | 开发文档和规范 | 二次开发 |

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 截图

（此处可添加应用截图）

---

开发时间：2024年
技术支持：Vue 3 + Flask
