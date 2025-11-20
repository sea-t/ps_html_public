# Pull Request: 添加暗色主题、收藏夹、Markdown支持、导入导出和分享功能

## 功能概述

本PR为代码片段管理器添加了5个重要的新功能，显著提升了用户体验和功能完整性。

## 新增功能

### 🌓 1. 暗色主题
- ✅ 添加主题切换按钮（月亮/太阳图标）
- ✅ 创建 theme.js 工具管理主题状态
- ✅ 使用 CSS 变量实现无缝主题切换
- ✅ 主题设置持久化到 localStorage
- ✅ 支持所有组件和页面

### ⭐ 2. 收藏夹功能
**后端改动：**
- ✅ Snippet 模型新增 `is_favorite` 布尔字段
- ✅ 新增 `PATCH /api/snippets/:id/favorite` 端点切换收藏状态
- ✅ 支持按收藏状态过滤（`?favorite=true`）
- ✅ 统计信息包含收藏数量

**前端改动：**
- ✅ 片段卡片添加星标按钮（StarFilled/Star 图标）
- ✅ 侧边栏添加"收藏夹"过滤选项
- ✅ 顶部统计栏显示收藏数量
- ✅ 完整的收藏/取消收藏交互

### 📄 3. Markdown 格式支持
- ✅ 创建 markdown.js 工具模块
  - `renderMarkdown()`: 安全渲染 Markdown（DOMPurify 防 XSS）
  - `hasMarkdownSyntax()`: 自动检测 Markdown 语法
- ✅ ViewDialog 组件支持 Markdown 预览
  - 自动检测提示词中的 Markdown 语法
  - "源码/预览"模式切换
  - 完整的 GitHub 风格 Markdown CSS 样式
- ✅ 添加依赖：marked@^9.1.0, dompurify@^3.0.6

### 📤 4. 导入导出功能
- ✅ 创建 export.js 工具模块
  - `exportToJSON()`: 导出为 JSON 文件
  - `exportToCSV()`: 导出为 CSV（含 UTF-8 BOM）
  - `importFromJSON()`: 导入并验证 JSON
- ✅ 创建 ImportExportDialog 组件
  - 导出标签页：JSON/CSV 格式选择
  - 导入标签页：拖拽上传文件支持
- ✅ Sidebar 添加"导入/导出"按钮
- ✅ 批量导入处理和错误统计

### 🔗 5. 片段分享功能
- ✅ 创建 share.js 工具模块
  - `formatAsMarkdown()`: 格式化为 Markdown
  - `formatAsText()`: 格式化为纯文本
  - `downloadSnippet()`: 下载为文件（多种格式）
  - `generateShareText()`: 生成分享文本
- ✅ ViewDialog 添加分享下拉菜单
  - 复制为 Markdown
  - 复制为纯文本
  - 生成分享文本
- ✅ ViewDialog 添加下载下拉菜单
  - 下载为 JSON
  - 下载为 Markdown
  - 下载为文本
  - 下载源代码（仅代码片段）

## 文件变更

### 后端 (Backend)
- `models.py`: 添加 is_favorite 字段和序列化
- `routes.py`: 添加收藏过滤、切换收藏端点、统计更新

### 前端 (Frontend)
**新增工具模块：**
- `utils/theme.js` - 主题管理
- `utils/export.js` - 导入导出
- `utils/markdown.js` - Markdown 渲染
- `utils/share.js` - 分享和下载

**新增组件：**
- `components/ImportExportDialog.vue` - 导入导出对话框

**更新组件：**
- `App.vue` - 集成所有新功能
- `Sidebar.vue` - 收藏夹过滤、导入导出按钮
- `SnippetList.vue` - 收藏星标按钮
- `ViewDialog.vue` - Markdown 预览、分享、下载
- `api/snippets.js` - toggleFavorite API

**依赖更新：**
- `package.json` - 添加 marked, dompurify

### 文档 (Documentation)
- `README.md` - 更新功能列表、使用指南、开发计划、数据模型

## 技术亮点

1. **安全性**：Markdown 渲染使用 DOMPurify 防止 XSS 攻击
2. **国际化支持**：CSV 导出包含 UTF-8 BOM 支持 Excel 中文
3. **用户体验**：拖拽上传、自动检测、即时反馈
4. **模块化设计**：功能独立、易于维护和扩展
5. **主题系统**：使用 CSS 变量实现，性能优异
6. **完整的错误处理**：所有操作都有用户友好的错误提示

## 测试建议

1. **主题切换**：测试亮色/暗色主题切换，刷新页面后主题保持
2. **收藏功能**：添加/取消收藏，过滤收藏夹，统计数量正确
3. **Markdown 预览**：测试包含 Markdown 语法的提示词，源码/预览切换
4. **导入导出**：
   - 导出 JSON 和 CSV 格式
   - 导入 JSON 文件
   - 测试中文字符在 CSV 中正确显示
5. **分享下载**：
   - 测试各种分享格式
   - 测试各种下载格式
   - 验证文件内容正确

## 部署说明

1. 安装新的前端依赖：
   ```bash
   cd snippet-manager/frontend
   npm install
   ```

2. 数据库会自动创建 `is_favorite` 字段（SQLAlchemy 自动迁移）

3. 重新构建 Docker 镜像或重启开发服务器

## 变更统计

- **分支**: `claude/refactor-frontend-modules-017d4TDkM9BNVTzW8eSiyZzD`
- **提交**: 95a4f9c
- **文件变更**: 14 个文件
- **新增**: 1265 行
- **删除**: 41 行

## 相关链接

- 提交记录: 95a4f9c
- 功能文档: README.md 中的"使用指南"部分
