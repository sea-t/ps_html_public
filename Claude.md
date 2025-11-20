# Claude.md - PS HTML Public 项目文档

> 本文档帮助 AI 快速理解 ps_html_public 项目的架构、功能和工作流程

## ⚠️ AI Agent 行为规范

### 自动化 PR 链接输出

**重要规则：** 当完成任务实现、代码提交并推送后，**必须主动输出** PR 创建链接，无需等待用户询问。

**输出格式：**
```
✅ 任务已完成并推送！

📝 创建 Pull Request：
https://github.com/sea-t/ps_html_public/pull/new/{当前分支名}

点击上方链接即可创建 PR
```

**触发条件：**
- 完成代码实现
- 已执行 `git commit`
- 已执行 `git push`

**示例：**
如果当前分支是 `claude/feature-abc-123`，则自动输出：
```
✅ 任务已完成并推送！

📝 创建 Pull Request：
https://github.com/sea-t/ps_html_public/pull/new/claude/feature-abc-123
```

## 项目概述

**ps_html_public** 是一个轻量级的 HTML 导航页面项目，具备完整的自动化工程实践。项目采用纯原生技术栈（无框架依赖），展示了现代 Web 开发和 DevOps 自动化的最佳实践。

### 核心特点

- **前端应用**：响应式导航页面，支持分类展示和实时搜索
- **数据管理**：Markdown 源文件自动转换为 JSON 数据
- **自动化工程**：完整的 CI/CD 流程，自动化分支管理
- **无依赖设计**：前端零外部依赖，纯原生 HTML/CSS/JavaScript
- **开发友好**：集成 Claude Code，支持 AI 辅助开发

### 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | HTML5, CSS3, JavaScript (ES6+) |
| 后端/脚本 | Node.js, Shell/Bash |
| 版本控制 | Git, GitHub |
| CI/CD | GitHub Actions |
| AI 工具 | Claude Code |

## 项目结构

```
ps_html_public/
├── .claude/                              # Claude Code 配置
│   ├── settings.json                     # Claude 权限设置
│   └── README.md                         # Claude 配置说明
├── .github/
│   ├── workflows/                        # GitHub Actions 工作流
│   │   ├── convert-md-to-json.yml       # MD→JSON 自动转换
│   │   └── cleanup-merged-branches.yml  # 分支自动清理
│   ├── scripts/                          # 自动化脚本
│   │   ├── cleanup-branches.sh          # 本地分支清理
│   │   └── setup-git-aliases.sh         # Git 别名设置
│   └── AUTOMATION.md                     # 自动化功能文档
├── index.html                            # 主导航页面
├── navigation-data.md                    # 导航数据源（Markdown）
├── navigation-data.json                  # 导航数据（JSON，自动生成）
├── convert.js                            # MD→JSON 转换脚本
├── README.md                             # 项目简介
└── Claude.md                             # 本文档
```

## 核心功能详解

### 1. 导航页面应用（index.html）

**功能特性：**
- 分类展示导航链接（开发工具、前端框架、在线学习、设计资源、常用工具）
- 实时搜索功能（按名称/描述搜索）
- 响应式设计（移动端/平板/桌面）
- 流畅的动画效果（淡入淡出、延迟动画）
- Grid 布局自适应

**关键函数：**
- `loadNavigationData()` - 异步加载 JSON 数据（index.html:224）
- `renderNavigation(categories)` - 动态渲染导航内容（index.html:238）
- `handleSearch(searchTerm)` - 实时搜索过滤（index.html:289）

**样式特点：**
- 使用系统字体栈（macOS/Windows/Linux 优化）
- CSS Grid 自适应布局（280px 最小宽度）
- 关键帧动画（fadeInDown, fadeInUp, fadeIn）
- 响应式断点：768px（平板）、480px（手机）

### 2. 数据管理系统

#### 数据源（navigation-data.md）

Markdown 格式的导航数据，易于人工编辑：

```markdown
# 开发工具 🛠️

| 名称 | 链接 | 描述 |
|------|------|------|
| GitHub | https://github.com | 代码托管平台 |
```

#### 自动转换（convert.js）

**转换流程：**
1. 读取 `navigation-data.md`
2. 解析 Markdown 表格结构
3. 提取分类名称、图标、链接信息
4. 生成 `navigation-data.json`

**核心函数：**
- `parseMarkdown(markdown)` - 解析 MD 内容（convert.js:9）
  - 按 `# ` 分割分类
  - 正则提取标题和 emoji 图标
  - 解析表格数据（跳过表头）
- `main()` - 主函数：读取→解析→写入（convert.js:73）

**执行方式：**
```bash
node convert.js
```

#### 数据格式（navigation-data.json）

```json
{
  "title": "我的导航页面",
  "categories": [
    {
      "name": "分类名称",
      "icon": "🛠️",
      "links": [
        {
          "name": "链接名称",
          "url": "https://example.com",
          "description": "链接描述"
        }
      ]
    }
  ]
}
```

### 3. 自动化工作流

#### MD→JSON 自动转换（.github/workflows/convert-md-to-json.yml）

**触发条件：**
- 推送到 `main` 或 `claude/**` 分支
- `navigation-data.md` 文件修改
- 手动触发（workflow_dispatch）

**执行步骤：**
1. Checkout 代码
2. 设置 Node.js 20 环境
3. 运行 `node convert.js`
4. 检测 JSON 文件变化
5. 自动提交并推送（如有变化）

**提交信息：**
```
自动转换: 更新 navigation-data.json
```

#### 分支自动清理（.github/workflows/cleanup-merged-branches.yml）

**触发条件：**
- 每周日 00:00（UTC）自动运行
- 手动触发

**执行逻辑：**
1. 获取所有远程分支
2. 识别已合并到 main 的分支
3. 跳过保护分支（main, master, develop）
4. 自动删除已合并分支

#### 本地分支管理（.github/scripts/cleanup-branches.sh）

**功能：**
- 交互式清理本地已合并分支
- 支持清理远程分支引用
- 用户确认删除机制

**使用方式：**
```bash
bash .github/scripts/cleanup-branches.sh
```

#### Git 别名配置（.github/scripts/setup-git-aliases.sh）

**配置的别名：**
```bash
git cleanup-local  # 清理本地已合并分支
git cleanup-remote # 清理远程分支引用
git cleanup        # 一键清理
git merged         # 查看已合并分支
git branches       # 查看所有分支详情
git sync           # 同步 main 并清理
```

**安装方式：**
```bash
bash .github/scripts/setup-git-aliases.sh
```

### 4. Claude Code 集成

#### 权限配置（.claude/settings.json）

允许 Claude Code 执行的命令：
```json
{
  "allowedCommands": {
    "allow": [
      "gh",
      "gh pr create",
      "gh pr list",
      "gh pr view",
      "gh pr merge",
      "gh issue",
      "gh repo"
    ]
  }
}
```

**目的：**
- 允许 Claude 自动创建 Pull Request
- 支持 GitHub 问题管理
- 自动化代码审查流程

## 工作流程

### 日常开发流程

1. **修改导航数据**
   ```bash
   # 编辑 Markdown 源文件
   vim navigation-data.md
   ```

2. **本地测试（可选）**
   ```bash
   # 本地运行转换
   node convert.js

   # 启动本地服务器预览
   python3 -m http.server 8000
   # 访问 http://localhost:8000
   ```

3. **提交代码**
   ```bash
   git add navigation-data.md
   git commit -m "更新导航链接"
   git push
   ```

4. **自动化处理**
   - GitHub Actions 自动运行 `convert.js`
   - 自动提交更新的 `navigation-data.json`
   - 页面自动更新（如果已部署）

### Pull Request 流程

1. **创建功能分支**
   ```bash
   git checkout -b claude/feature-name-<session-id>
   ```

2. **开发和测试**
   - 修改代码
   - 本地测试

3. **提交推送**
   ```bash
   git push -u origin claude/feature-name-<session-id>
   ```

4. **创建 PR**
   - Claude Code 可自动创建（使用 `gh` 命令）
   - 或手动通过 GitHub 创建

   **手动创建 PR 链接格式：**
   ```
   https://github.com/sea-t/ps_html_public/pull/new/<branch-name>
   ```

5. **合并后自动清理**
   - 分支自动删除（周末 Cron 任务）
   - 或使用 `git cleanup` 手动清理

### 当前活跃的 PR 信息

**分支名称：** `claude/create-page-with-links-011DiCUwt3G1XFJbvcWMNSpF`

**PR 创建链接：**
```
https://github.com/sea-t/ps_html_public/pull/new/claude/create-page-with-links-011DiCUwt3G1XFJbvcWMNSpF
```

**PR 标题建议：**
```
添加 Notion 嵌入页面并更新网站配色
```

**PR 描述模板：**
```markdown
## Summary
本 PR 包含两个主要更新：

### 1. 添加 Notion 嵌入页面
- 创建了新的 `notion-embed.html` 页面，用于嵌入 Notion 文档
- 在导航数据 `navigation-data.json` 中添加了新页面的链接入口
- 采用响应式设计，页面支持桌面端和移动端显示

### 2. 更新网站配色为蓝白简约风格
- 将主色调从紫色渐变改为蓝色 (#0969da)，参考 GitHub 风格
- 采用简约的灰白色背景 (#fafbfc)
- 更新所有组件的配色方案，包括卡片、按钮、导航等
- 优化 hover 和 active 状态的视觉效果
- 移除过度的 backdrop-filter 和渐变效果
- 更新深色模式配色以保持一致性

## 视觉改进
- 更加简约和专业的外观
- 更好的可读性和对比度
- 更流畅的交互体验
- 统一的设计语言

## Test plan
- [ ] 访问主导航页面 `index.html`，确认新配色方案显示正常
- [ ] 确认"开发工具"分类中显示"Notion 嵌入页面"链接
- [ ] 点击"Notion 嵌入页面"链接，确认能正常跳转到新页面
- [ ] 确认 Notion iframe 能正常加载和显示
- [ ] 测试"返回导航"链接功能是否正常
- [ ] 测试深色模式切换功能是否正常
- [ ] 在移动端测试页面响应式布局是否正常
- [ ] 检查所有现有页面的配色是否协调一致
```

**提交记录：**
```
e21e90a refactor: 更新网站配色为蓝白简约风格
0934c8d feat: 添加 Notion 嵌入页面
```

## 关键文件说明

### index.html（9.1 KB）

- **行 1-198**：HTML 结构和 CSS 样式
- **行 200-218**：页面骨架（容器、搜索框、加载提示）
- **行 220-327**：JavaScript 逻辑
  - 数据加载
  - 动态渲染
  - 搜索功能

**设计亮点：**
- 无外部依赖，完全自包含
- 渐进式增强，优雅降级
- 性能优化（CSS 动画 GPU 加速）

### convert.js（2.9 KB）

- **行 1-8**：模块导入和函数声明
- **行 9-68**：Markdown 解析逻辑
  - 正则表达式提取分类和图标
  - 表格解析算法
- **行 73-101**：主函数和错误处理

**解析逻辑：**
1. 按一级标题 `# ` 分割文档
2. 正则匹配标题和 emoji：`/^(.+?)\s*([🔧🛠️...]+)\s*$/`
3. 查找表格起始位置（第一个 `|` 字符）
4. 跳过表头和分隔行（前 2 行）
5. 解析每行数据为 JSON 对象

### navigation-data.md（1.6 KB）

**格式规范：**
```markdown
# 分类名称 图标emoji

| 名称 | 链接 | 描述 |
|------|------|------|
| 示例 | https://example.com | 描述文本 |
```

**注意事项：**
- 一级标题必须包含分类名称和 emoji
- 表格必须包含 3 列：名称、链接、描述
- 每个分类至少有 1 个链接

### navigation-data.json（3.3 KB）

**自动生成规则：**
- 由 `convert.js` 自动生成，不应手动编辑
- Git 追踪此文件（已提交到仓库）
- 每次 MD 文件变化时自动更新

## 部署指南

### GitHub Pages 部署

1. **启用 GitHub Pages**
   - 仓库 Settings → Pages
   - Source：Deploy from a branch
   - Branch：main / (root)

2. **访问地址**
   ```
   https://<username>.github.io/<repository>/
   ```

3. **自动部署**
   - 推送到 main 分支自动触发
   - 包含 JSON 自动转换

### 其他部署方式

**静态站点托管：**
- Vercel
- Netlify
- Cloudflare Pages

**配置要点：**
- 构建命令：`node convert.js`（可选）
- 输出目录：`.`（根目录）
- Node.js 版本：20+

## 开发建议

### 添加新分类

1. 编辑 `navigation-data.md`：
   ```markdown
   # 新分类名称 🎯

   | 名称 | 链接 | 描述 |
   |------|------|------|
   | 示例 | https://example.com | 描述 |
   ```

2. 推送代码，自动转换为 JSON

### 修改页面样式

1. 编辑 `index.html` 中的 `<style>` 部分（第 7-197 行）
2. 测试响应式效果：
   - 桌面：> 768px
   - 平板：480px - 768px
   - 手机：< 480px

### 自定义搜索逻辑

修改 `handleSearch` 函数（index.html:289）：
```javascript
// 当前：搜索名称和描述
link.name.toLowerCase().includes(searchTerm) ||
link.description.toLowerCase().includes(searchTerm)

// 可扩展：搜索 URL
|| link.url.toLowerCase().includes(searchTerm)
```

### 性能优化建议

1. **图片优化**：如需添加图标，使用 emoji 或 SVG
2. **懒加载**：链接较多时可实现虚拟滚动
3. **缓存策略**：添加 Service Worker 离线支持
4. **代码分割**：提取 CSS/JS 到独立文件（可选）

## 故障排除

### JSON 转换失败

**症状：**GitHub Actions 报错 "转换失败"

**解决方案：**
1. 检查 `navigation-data.md` 格式：
   - 确保一级标题包含 emoji
   - 表格必须有 3 列
   - 不要有空的分类

2. 本地测试：
   ```bash
   node convert.js
   ```

3. 查看错误信息定位问题

### 搜索功能不工作

**症状：**输入搜索词无反应

**解决方案：**
1. 检查浏览器控制台错误
2. 确认 `navigation-data.json` 加载成功
3. 检查 JavaScript 是否被禁用

### 页面样式混乱

**症状：**布局错乱或样式丢失

**解决方案：**
1. 确认浏览器支持 CSS Grid
2. 检查是否有 CSS 语法错误
3. 清除浏览器缓存

### 分支清理失败

**症状：**自动清理工作流失败

**解决方案：**
1. 检查仓库权限设置
2. 确认 GITHUB_TOKEN 权限足够
3. 手动运行本地清理脚本：
   ```bash
   bash .github/scripts/cleanup-branches.sh
   ```

## 扩展方向

### 功能增强

1. **主题切换**：添加暗色模式支持
2. **书签导出**：支持导出为浏览器书签格式
3. **自定义排序**：支持拖拽排序分类和链接
4. **统计功能**：记录链接点击次数
5. **多语言支持**：i18n 国际化

### 技术优化

1. **TypeScript**：类型安全的代码重构
2. **测试覆盖**：单元测试和 E2E 测试
3. **构建工具**：引入 Vite 或 Webpack
4. **组件化**：使用 Web Components
5. **PWA**：渐进式 Web 应用改造

### 集成增强

1. **API 集成**：从后端动态加载数据
2. **用户系统**：个性化导航配置
3. **分享功能**：生成分享链接
4. **数据同步**：云端数据备份
5. **插件系统**：支持第三方扩展

## 项目统计

| 指标 | 数值 |
|------|------|
| 总文件数 | 90 个 |
| 项目大小 | 402 KB |
| 代码行数 | ~600 行 |
| 分类数量 | 5 个 |
| 链接数量 | 20 个 |
| 前端依赖 | 0 个 |
| 自动化工作流 | 2 个 |

## 贡献指南

### 开发环境要求

- Node.js 20+
- Git 2.x+
- 现代浏览器（支持 ES6+）

### 代码风格

- **HTML**：语义化标签，缩进 4 空格
- **CSS**：BEM 命名规范（可选）
- **JavaScript**：ES6+ 语法，2 空格缩进
- **Markdown**：遵循 CommonMark 规范

### 提交规范

**推荐使用约定式提交：**
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具链更新
```

## 许可证

本项目为开源项目，具体许可证待定。

## 联系方式

- GitHub Issues：项目问题反馈
- Pull Requests：欢迎贡献代码

---

**最后更新：** 2025-10-21
**文档版本：** 1.0.0
**适用于：** ps_html_public 项目所有版本
