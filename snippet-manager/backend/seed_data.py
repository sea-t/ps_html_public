"""
示例数据种子脚本
运行此脚本可以添加一些示例数据到数据库
"""

from app import create_app, db
from app.models import Snippet

def seed_data():
    app = create_app()

    with app.app_context():
        # 清空现有数据（谨慎使用！）
        # Snippet.query.delete()

        # 代码片段示例
        snippets = [
            # Python 代码片段
            Snippet(
                title="快速排序算法",
                content="""def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# 使用示例
arr = [3, 6, 8, 10, 1, 2, 1]
print(quick_sort(arr))""",
                description="Python实现的快速排序算法，简洁高效",
                snippet_type="code",
                language="python",
                tags="算法,排序,Python"
            ),

            Snippet(
                title="JavaScript 防抖函数",
                content="""function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 使用示例
const handleSearch = debounce((searchTerm) => {
    console.log('Searching for:', searchTerm);
}, 300);""",
                description="实现防抖功能，优化高频事件处理",
                snippet_type="code",
                language="javascript",
                tags="JavaScript,工具函数,性能优化"
            ),

            Snippet(
                title="React Hook 表单处理",
                content="""import { useState } from 'react';

function useForm(initialValues) {
    const [values, setValues] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setValues(initialValues);
    };

    return { values, handleChange, resetForm };
}

// 使用示例
const { values, handleChange, resetForm } = useForm({ email: '', password: '' });""",
                description="自定义React Hook用于表单状态管理",
                snippet_type="code",
                language="javascript",
                tags="React,Hook,表单"
            ),

            # AI 提示词示例
            Snippet(
                title="代码审查提示词",
                content="""请帮我审查以下代码，关注以下方面：

1. **代码质量和可读性**
   - 变量命名是否清晰
   - 代码结构是否合理
   - 注释是否充分

2. **潜在的bug和安全问题**
   - 边界条件处理
   - 错误处理
   - 安全漏洞

3. **性能优化建议**
   - 算法复杂度
   - 资源使用
   - 可优化的地方

4. **最佳实践**
   - 是否遵循编程规范
   - 设计模式应用
   - 可维护性

代码：
[在此处粘贴代码]""",
                description="用于AI代码审查的详细提示词模板",
                snippet_type="prompt",
                tags="AI,代码审查,提示词"
            ),

            Snippet(
                title="技术文档生成",
                content="""请为以下代码生成详细的技术文档，包括：

## 功能概述
简要描述这段代码的主要功能和用途

## 参数说明
列出所有参数及其类型、含义、默认值

## 返回值
说明返回值的类型和含义

## 使用示例
提供1-2个实际使用示例

## 注意事项
列出使用时需要注意的事项和限制

## 异常处理
说明可能抛出的异常及处理方式

代码：
[在此处粘贴代码]""",
                description="生成规范的技术文档",
                snippet_type="prompt",
                tags="AI,文档,提示词"
            ),

            Snippet(
                title="Bug分析助手",
                content="""我遇到了一个bug，请帮我分析：

**Bug描述：**
[详细描述bug现象]

**期望行为：**
[描述期望的正确行为]

**实际行为：**
[描述实际发生的错误行为]

**相关代码：**
```
[粘贴相关代码]
```

**错误信息：**
```
[粘贴错误日志或信息]
```

**环境信息：**
- 操作系统：
- 编程语言/框架版本：
- 相关依赖版本：

请帮我：
1. 分析可能的原因
2. 提供解决方案
3. 建议预防措施""",
                description="结构化的bug分析提示词",
                snippet_type="prompt",
                tags="AI,调试,Bug分析"
            ),

            # SQL 片段
            Snippet(
                title="创建用户表",
                content="""CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;""",
                description="标准用户表结构，包含索引和时间戳",
                snippet_type="code",
                language="sql",
                tags="SQL,数据库,用户管理"
            ),
        ]

        # 添加到数据库
        for snippet in snippets:
            # 检查是否已存在相同标题的片段
            existing = Snippet.query.filter_by(title=snippet.title).first()
            if not existing:
                db.session.add(snippet)
                print(f"✓ 添加: {snippet.title}")
            else:
                print(f"✗ 跳过（已存在）: {snippet.title}")

        db.session.commit()

        print(f"\n数据种子完成！共有 {Snippet.query.count()} 个片段")

if __name__ == '__main__':
    seed_data()
