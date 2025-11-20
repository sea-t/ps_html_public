# 测试文档

## 概述

本项目包含全面的测试套件，确保所有功能正常工作。测试分为两类：
1. **后端单元测试**: 测试所有API端点
2. **集成测试**: 测试完整的工作流和前后端连接

## 测试覆盖

### API端点测试（100%覆盖）

#### 片段管理 (CRUD)
- ✅ GET /api/snippets - 获取所有片段
- ✅ GET /api/snippets/<id> - 获取单个片段
- ✅ POST /api/snippets - 创建片段
- ✅ PUT /api/snippets/<id> - 更新片段
- ✅ DELETE /api/snippets/<id> - 删除片段

#### 搜索和过滤
- ✅ 按类型过滤 (type=code/prompt)
- ✅ 按标题搜索 (search=...)
- ✅ 按内容搜索 (search=...)
- ✅ 按标签过滤 (tag=...)
- ✅ 组合过滤条件

#### 其他端点
- ✅ GET /api/tags - 获取所有标签
- ✅ GET /api/stats - 获取统计信息

#### 边界情况
- ✅ 空数据库
- ✅ 不存在的资源 (404)
- ✅ 缺少必需字段 (400)
- ✅ 数据持久化

## 运行测试

### 快速开始

```bash
# 运行所有测试
./run-tests.sh

# 或者分别运行
./run-tests.sh unit          # 只运行单元测试
./run-tests.sh integration   # 只运行集成测试（需要服务运行）
./run-tests.sh database      # 只测试数据库挂载
```

### 手动运行测试

#### 1. 后端单元测试

```bash
cd backend

# 安装依赖
pip install -r requirements.txt
pip install -r requirements-test.txt

# 运行测试
python -m pytest test_api.py -v
```

#### 2. 集成测试

```bash
# 先启动服务
./docker-start.sh

# 在另一个终端运行集成测试
python -m pytest tests/test_integration.py -v
```

### 使用 Docker 运行测试

```bash
# 构建测试镜像
docker-compose -f docker-compose.yml build backend

# 运行测试
docker-compose run --rm backend python -m pytest test_api.py -v
```

## 测试文件说明

### backend/test_api.py
**后端单元测试套件**

包含以下测试类：
- `TestSnippetsAPI`: 测试片段CRUD操作（10个测试）
- `TestFilterAndSearch`: 测试搜索和过滤功能（5个测试）
- `TestTagsAPI`: 测试标签接口（2个测试）
- `TestStatsAPI`: 测试统计接口（2个测试）
- `TestDataPersistence`: 测试数据持久化（1个测试）

**总计**: 20个测试用例

### tests/test_integration.py
**集成测试套件**

包含以下测试类：
- `TestBackendIntegration`: 测试后端服务集成
  - 健康检查
  - 完整CRUD工作流
  - 搜索和过滤
  - 所有API端点

- `TestFrontendIntegration`: 测试前端服务
  - 前端可访问性
  - 静态资源加载

- `TestEndToEnd`: 端到端测试
  - 后端和前端连接性

## 测试结果

### 最新测试运行结果

```
======================== 20 passed, 8 warnings in 0.92s ========================

✓ 后端单元测试: 20/20 通过
✓ 测试覆盖率: 100% (所有API端点)
```

### 测试统计

| 类型 | 测试数量 | 通过 | 失败 |
|------|---------|------|------|
| 片段CRUD | 10 | ✅ 10 | 0 |
| 搜索过滤 | 5 | ✅ 5 | 0 |
| 标签管理 | 2 | ✅ 2 | 0 |
| 统计信息 | 2 | ✅ 2 | 0 |
| 数据持久化 | 1 | ✅ 1 | 0 |
| **总计** | **20** | **✅ 20** | **0** |

## 持续集成

测试可以集成到CI/CD流程中：

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt

      - name: Run tests
        run: |
          cd backend
          python -m pytest test_api.py -v --tb=short
```

## 测试数据

测试使用内存数据库，不会影响生产数据：

```python
SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
```

每个测试运行在独立的数据库上下文中，测试之间互不影响。

## 添加新测试

### 1. 添加单元测试

在 `backend/test_api.py` 中添加新的测试方法：

```python
def test_my_new_feature(self, client):
    """测试我的新功能"""
    response = client.get('/api/my-endpoint')
    assert response.status_code == 200
    assert 'expected_data' in response.json
```

### 2. 添加集成测试

在 `tests/test_integration.py` 中添加新的测试：

```python
def test_my_integration(self):
    """测试我的集成场景"""
    response = requests.get(f'{BACKEND_URL}/api/my-endpoint')
    assert response.status_code == 200
```

## 故障排查

### 测试失败常见问题

#### 1. 模块导入错误
```bash
ModuleNotFoundError: No module named 'flask'
```
**解决方案**: 安装依赖
```bash
pip install -r backend/requirements.txt
```

#### 2. 集成测试失败
```
requests.exceptions.ConnectionError
```
**解决方案**: 确保服务正在运行
```bash
./docker-start.sh
```

#### 3. 数据库错误
```
sqlite3.OperationalError: unable to open database file
```
**解决方案**: 检查数据库配置和权限

### 查看详细日志

```bash
# 详细输出
python -m pytest test_api.py -vv

# 显示print输出
python -m pytest test_api.py -v -s

# 失败时停止
python -m pytest test_api.py -v -x

# 只运行特定测试
python -m pytest test_api.py -v -k "test_create_snippet"
```

## 性能测试

虽然当前主要是功能测试，但可以添加性能测试：

```python
import time

def test_api_performance(client):
    """测试API响应时间"""
    start = time.time()
    response = client.get('/api/snippets')
    duration = time.time() - start

    assert response.status_code == 200
    assert duration < 0.1  # 响应时间应小于100ms
```

## 测试最佳实践

1. ✅ **每个测试独立**: 测试之间不应相互依赖
2. ✅ **清晰的测试名称**: 描述测试的目的
3. ✅ **一个测试一个断言**: 尽量保持简单
4. ✅ **使用fixtures**: 重用测试数据和配置
5. ✅ **测试边界情况**: 空数据、错误输入等
6. ✅ **快速运行**: 使用内存数据库加速测试

## 代码覆盖率

查看测试覆盖率：

```bash
# 生成覆盖率报告
python -m pytest test_api.py --cov=app --cov-report=html

# 查看报告
open htmlcov/index.html
```

## 总结

本项目拥有全面的测试套件，覆盖所有API端点和关键功能。测试快速、可靠，可以在开发过程中频繁运行，确保代码质量。

**测试座右铭**: "如果没有测试，就认为它是坏的" 🧪
