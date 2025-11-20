# 快速开始指南

## 方式一：使用启动脚本（推荐）

### 1. 启动后端
```bash
./start-backend.sh
```

后端将在 `http://localhost:5000` 运行

### 2. 启动前端（新终端窗口）
```bash
./start-frontend.sh
```

前端将在 `http://localhost:3000` 运行

### 3. 访问应用
打开浏览器访问：`http://localhost:3000`

## 方式二：手动启动

### 启动后端

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境（首次运行）
python3 -m venv venv

# 3. 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 4. 安装依赖（首次运行）
pip install -r requirements.txt

# 5. 运行应用
python run.py
```

### 启动前端

```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖（首次运行）
npm install

# 3. 运行开发服务器
npm run dev
```

## 首次使用

1. 打开浏览器访问 `http://localhost:3000`
2. 点击"添加代码片段"或"添加提示词"创建第一个片段
3. 尝试使用搜索和标签功能
4. 查看片段详情并使用复制功能

## 常见问题

### 端口被占用

**后端端口（5000）被占用：**
编辑 `backend/run.py`，修改端口号：
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # 改为其他端口
```

**前端端口（3000）被占用：**
编辑 `frontend/vite.config.js`，修改端口号：
```javascript
server: {
  port: 3001,  // 改为其他端口
  // ...
}
```

### Python依赖安装失败

尝试升级pip：
```bash
pip install --upgrade pip
```

或使用国内镜像源：
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### npm安装缓慢

使用国内镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

或使用 yarn/pnpm：
```bash
yarn install
# 或
pnpm install
```

## 测试数据

首次使用时，系统是空的。你可以：

1. 手动添加一些测试片段
2. 或者通过 API 批量导入数据

### 使用 API 添加测试数据

```bash
# 添加一个代码片段
curl -X POST http://localhost:5000/api/snippets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "快速排序",
    "content": "def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)",
    "description": "Python实现的快速排序算法",
    "snippet_type": "code",
    "language": "python",
    "tags": ["算法", "排序", "Python"]
  }'

# 添加一个提示词
curl -X POST http://localhost:5000/api/snippets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "代码审查提示词",
    "content": "请帮我审查以下代码，关注以下方面：\n1. 代码质量和可读性\n2. 潜在的bug和安全问题\n3. 性能优化建议\n4. 最佳实践\n\n代码：\n[在此处粘贴代码]",
    "description": "用于AI代码审查的提示词模板",
    "snippet_type": "prompt",
    "tags": ["AI", "代码审查", "提示词"]
  }'
```

## 生产部署

### 后端部署

使用 Gunicorn 运行：
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### 前端部署

1. 构建生产版本：
```bash
cd frontend
npm run build
```

2. 部署 `dist` 目录到 Nginx 或其他 Web 服务器

Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/snippet-manager/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 下一步

- 阅读完整的 [README.md](./README.md) 了解更多功能
- 查看 API 文档了解接口详情
- 根据需要自定义配置
