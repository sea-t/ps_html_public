# 开发文档

## 项目概述

这是一个全栈的代码片段和提示词管理工具，使用 Vue 3 + Flask 构建。

## 技术架构

### 前端架构
- **框架**: Vue 3 Composition API
- **UI库**: Element Plus
- **构建工具**: Vite
- **状态管理**: 基于 ref/reactive
- **HTTP客户端**: Axios
- **代码高亮**: highlight.js

### 后端架构
- **Web框架**: Flask
- **ORM**: SQLAlchemy
- **数据库**: SQLite
- **API风格**: RESTful

## 目录结构详解

```
snippet-manager/
├── backend/                      # 后端项目
│   ├── app/                      # 应用模块
│   │   ├── __init__.py          # Flask应用工厂
│   │   ├── models.py            # 数据模型定义
│   │   └── routes.py            # API路由处理
│   ├── instance/                 # 实例文件（数据库）
│   ├── config.py                 # 配置文件
│   ├── run.py                    # 应用入口
│   ├── seed_data.py             # 示例数据脚本
│   ├── requirements.txt          # Python依赖
│   └── .env.example             # 环境变量模板
│
└── frontend/                     # 前端项目
    ├── src/
    │   ├── components/           # Vue组件
    │   │   ├── Sidebar.vue      # 侧边栏（过滤、搜索）
    │   │   ├── SnippetList.vue  # 片段列表展示
    │   │   ├── SnippetDialog.vue# 添加/编辑对话框
    │   │   └── ViewDialog.vue   # 查看对话框
    │   ├── api/
    │   │   └── snippets.js      # API请求封装
    │   ├── App.vue              # 主应用组件
    │   └── main.js              # 应用入口
    ├── index.html               # HTML模板
    ├── vite.config.js          # Vite配置
    └── package.json            # npm配置
```

## 数据流

```
用户操作 → Vue组件 → API调用(axios) → Flask路由 → 数据库操作 → 返回数据 → 更新视图
```

## API设计

所有API端点都以 `/api` 为前缀。

### 端点列表

| 方法 | 路径 | 功能 | 请求体 |
|------|------|------|--------|
| GET | /api/snippets | 获取片段列表 | - |
| GET | /api/snippets/:id | 获取单个片段 | - |
| POST | /api/snippets | 创建片段 | Snippet对象 |
| PUT | /api/snippets/:id | 更新片段 | Snippet对象 |
| DELETE | /api/snippets/:id | 删除片段 | - |
| GET | /api/tags | 获取所有标签 | - |
| GET | /api/stats | 获取统计数据 | - |

### 数据模型

**Snippet**
```python
{
    "id": int,
    "title": str,
    "content": str,
    "description": str,
    "snippet_type": "code" | "prompt",
    "language": str,
    "tags": [str],
    "created_at": datetime,
    "updated_at": datetime
}
```

## 组件说明

### App.vue
主应用组件，负责：
- 整体布局
- 数据状态管理
- 组件间通信协调

### Sidebar.vue
侧边栏组件，提供：
- 添加按钮
- 类型过滤（全部/代码/提示词）
- 搜索框
- 标签列表

### SnippetList.vue
片段列表组件，展示：
- 卡片式列表
- 片段信息预览
- 操作按钮（查看/编辑/删除）

### SnippetDialog.vue
编辑对话框组件，功能：
- 添加新片段
- 编辑现有片段
- 表单验证
- 标签管理

### ViewDialog.vue
查看对话框组件，提供：
- 完整内容展示
- 代码高亮
- 一键复制功能

## 开发流程

### 1. 环境准备

**后端**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**前端**
```bash
cd frontend
npm install
```

### 2. 启动开发服务器

**后端（终端1）**
```bash
cd backend
source venv/bin/activate
python run.py
```

**前端（终端2）**
```bash
cd frontend
npm run dev
```

### 3. 添加示例数据

```bash
cd backend
source venv/bin/activate
python seed_data.py
```

### 4. 访问应用

打开浏览器访问: http://localhost:3000

## 开发规范

### 代码风格

**Python (PEP 8)**
- 使用4个空格缩进
- 类名使用 CamelCase
- 函数名使用 snake_case
- 常量使用 UPPER_CASE

**JavaScript/Vue**
- 使用2个空格缩进
- 组件名使用 PascalCase
- 函数名使用 camelCase
- 常量使用 UPPER_CASE

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 调试技巧

### 后端调试

1. 查看Flask日志
2. 使用 `print()` 或 Python debugger
3. 检查数据库内容：
```python
from app import create_app, db
from app.models import Snippet

app = create_app()
with app.app_context():
    snippets = Snippet.query.all()
    for s in snippets:
        print(s.to_dict())
```

### 前端调试

1. 使用 Vue DevTools 浏览器扩展
2. 检查浏览器控制台
3. 使用 `console.log()` 输出调试信息
4. 检查网络请求（Network标签）

## 常见问题

### CORS错误
后端已配置 Flask-CORS，如遇问题检查：
1. CORS中间件是否正确加载
2. 请求头是否正确

### 代理配置
前端开发时使用 Vite 代理：
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

### 数据库迁移

目前使用简单的 `db.create_all()`，如需更复杂的迁移，建议使用 Flask-Migrate。

## 扩展建议

### 短期改进
- [ ] 添加分页功能
- [ ] 支持 Markdown 渲染
- [ ] 添加导入/导出功能
- [ ] 优化搜索（全文搜索）
- [ ] 添加暗色主题

### 长期规划
- [ ] 用户认证和授权
- [ ] 多用户支持
- [ ] 片段分享功能
- [ ] 版本控制
- [ ] 协作编辑
- [ ] API密钥管理
- [ ] 移动端适配

## 性能优化

### 前端优化
1. 使用虚拟滚动（大量数据时）
2. 图片懒加载
3. 组件懒加载
4. 代码分割

### 后端优化
1. 添加数据库索引
2. 实现缓存机制（Redis）
3. 使用连接池
4. 异步任务处理

## 测试

### 后端测试
```bash
# 单元测试
pytest tests/

# 测试覆盖率
pytest --cov=app tests/
```

### 前端测试
```bash
# 单元测试
npm run test:unit

# E2E测试
npm run test:e2e
```

## 部署

详见 [QUICKSTART.md](./QUICKSTART.md) 中的生产部署章节。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License
