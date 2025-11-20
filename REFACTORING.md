# 前端代码重构说明

## 重构目标

将单体HTML文件重构为符合项目规范的模块化结构，提高代码可维护性和可扩展性。

## 重构内容

### 1. Docker 容器分析器 (docker-analyzer/)

**原文件**: `docker-analyzer.html` (1309行)

**新结构**:
```
docker-analyzer/
├── index.html          # 简洁的HTML结构
├── css/
│   └── style.css       # 所有样式 (~800行)
└── js/
    ├── main.js         # 主应用入口
    ├── parser.js       # Docker输出解析逻辑
    ├── renderer.js     # UI渲染模块
    └── utils.js        # 工具函数
```

### 2. JSON转Excel工具 (json-to-excel/)

**原文件**: `json-to-excel.html` (967行)

**新结构**:
```
json-to-excel/
├── index.html          # 简洁的HTML结构
├── css/
│   └── style.css       # 所有样式 (~280行)
└── js/
    ├── main.js         # 主应用入口
    ├── exporter.js     # Excel导出逻辑
    ├── table-renderer.js # 表格渲染
    └── utils.js        # 工具函数
```

### 3. 导航页面 (nav-page/)

**原文件**: `index.html` (626行)

**新结构**:
```
nav-page/
├── index.html          # 简洁的HTML结构
├── css/
│   └── style.css       # 所有样式 (~400行)
└── js/
    ├── main.js         # 主应用入口
    ├── theme.js        # 主题切换模块
    ├── navigation.js   # 导航和搜索功能
    └── data-loader.js  # 数据加载模块
```

### 4. 静态应用 (static-app/)

**原结构**: 已有CSS和JS分离

**优化**: 保持现有模块化结构，CSS和JS已正确分离

## 重构原则

1. **分离关注点**: HTML、CSS、JavaScript 完全分离
2. **模块化**: JavaScript 按功能拆分为多个模块
3. **可维护性**: 每个文件职责单一，便于维护
4. **使用ES模块**: 采用 ES6 模块系统 (import/export)
5. **代码复用**: 提取公共工具函数

## 文件大小对比

| 应用 | 原文件大小 | 重构后 HTML | 重构后 CSS | 重构后 JS |
|------|-----------|------------|-----------|----------|
| docker-analyzer | 1309行 | ~100行 | ~800行 | ~600行 (4个文件) |
| json-to-excel | 967行 | ~80行 | ~280行 | ~500行 (4个文件) |
| nav-page | 626行 | ~60行 | ~400行 | ~150行 (4个文件) |

## 更新的引用

- `navigation-data.json`: 更新了工具的URL路径
- `navigation-data.md`: 更新了工具的URL路径
- 新建 `index.html` 作为工具集首页

## 备份文件

旧文件已备份为 `.bak` 后缀：
- `docker-analyzer.html.bak`
- `json-to-excel.html.bak`
- `index.html.bak`

## 使用方法

1. 访问根目录的 `index.html` 查看所有工具
2. 每个工具都有独立的目录，可以独立运行
3. 支持现代浏览器的 ES6 模块功能

## 技术栈

- 原生 JavaScript (ES6+)
- CSS3
- HTML5
- 无构建工具依赖，直接在浏览器中运行
