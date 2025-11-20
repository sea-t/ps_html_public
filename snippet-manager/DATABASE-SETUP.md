# 数据库持久化配置

## 概述

本项目使用 PostgreSQL 15 作为数据库,并配置了数据持久化到宿主机真实路径，确保容器升级、重启或删除时数据不会丢失。

## 数据库配置

### PostgreSQL 版本
- **镜像**: postgres:15-alpine
- **容器端口**: 5432
- **主机端口**: 26526 (自定义端口，避免与系统 PostgreSQL 冲突)

### 端口映射说明

为了避免与系统已安装的 PostgreSQL（默认端口 5432）冲突，容器的 5432 端口被映射到主机的 **26526** 端口。

**重要**:
- 容器内服务间通信仍使用 `postgres:5432`
- 从主机访问数据库时使用 `localhost:26526`

**服务端口配置**:
- 数据库: `localhost:26526`
- 后端 API: `localhost:26528`
- 前端应用: `localhost:26527`

### 数据库位置

- **容器内路径**: `/var/lib/postgresql/data`
- **宿主机路径**: `./data/postgres/` (生产环境) 或 `./data/postgres-dev/` (开发环境)
- **映射方式**: Docker bind mount

### Docker Compose 配置

所有 docker-compose 文件已配置数据库挂载和端口映射:

```yaml
postgres:
  image: postgres:15-alpine
  ports:
    - "26526:5432"  # 主机端口 26526 映射到容器端口 5432
  volumes:
    - ./data/postgres:/var/lib/postgresql/data
  environment:
    - POSTGRES_DB=${POSTGRES_DB:-snippets}
    - POSTGRES_USER=${POSTGRES_USER:-snippets_user}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-change-this-password}
```

这个配置应用于:
- `docker-compose.yml` (生产环境，本地构建)
- `docker-compose.prod.yml` (生产环境，预构建镜像)
- `docker-compose.dev.yml` (开发环境)

## 数据持久化说明

### 优势

1. **升级安全**: 更新应用版本时，数据库数据保留在宿主机上
2. **数据可见**: 可以直接在宿主机上查看和备份数据库文件
3. **容器独立**: 删除容器不会影响数据
4. **易于迁移**: 直接复制 `data/` 目录即可迁移数据

### 数据库文件结构

```
snippet-manager/
├── data/                      # 数据目录（不会被git追踪）
│   ├── postgres/             # 生产环境数据库目录
│   │   └── ...               # PostgreSQL数据文件
│   └── postgres-dev/         # 开发环境数据库目录
│       └── ...               # PostgreSQL数据文件
```

## 使用说明

### 首次启动

首次启动时，数据库目录和文件会自动创建：

```bash
cd snippet-manager
docker compose up -d
```

数据库目录会自动创建在 `./data/postgres/` 下。

### 从主机连接数据库

使用数据库客户端工具连接：

```bash
# 使用 psql 连接
psql -h localhost -p 26526 -U snippets_user -d snippets

# 使用 pgAdmin 或其他 GUI 工具
# Host: localhost
# Port: 26526
# Username: snippets_user
# Database: snippets
```

### 查看数据库文件

```bash
# 查看数据库目录
ls -lh ./data/postgres/

# 查看数据库大小
du -sh ./data/postgres/
```

### 备份数据库

#### 方法 1: 使用 pg_dump（推荐）

```bash
# 导出SQL格式备份
docker compose exec postgres pg_dump -U snippets_user snippets > backups/snippets-$(date +%Y%m%d-%H%M%S).sql

# 导出压缩格式备份
docker compose exec postgres pg_dump -U snippets_user -Fc snippets > backups/snippets-$(date +%Y%m%d-%H%M%S).dump
```

#### 方法 2: 直接复制数据目录

```bash
# 先停止服务
docker compose down

# 创建备份
mkdir -p backups
cp -r data/postgres backups/postgres-$(date +%Y%m%d-%H%M%S)

# 或使用tar压缩
tar -czf backups/postgres-$(date +%Y%m%d-%H%M%S).tar.gz data/postgres/

# 重新启动服务
docker compose up -d
```

### 恢复数据库

#### 从 SQL 备份恢复

```bash
# 恢复 SQL 格式备份
docker compose exec -T postgres psql -U snippets_user snippets < backups/snippets-YYYYMMDD-HHMMSS.sql

# 恢复压缩格式备份
docker compose exec -T postgres pg_restore -U snippets_user -d snippets -c backups/snippets-YYYYMMDD-HHMMSS.dump
```

#### 从数据目录恢复

```bash
# 停止服务
docker compose down

# 从备份恢复
rm -rf data/postgres
cp -r backups/postgres-YYYYMMDD-HHMMSS data/postgres

# 或从tar包恢复
tar -xzf backups/postgres-YYYYMMDD-HHMMSS.tar.gz

# 重新启动服务
docker compose up -d
```

### 重置数据库

如果需要清空数据库：

```bash
# 方法 1: 使用 Docker 卷重置
docker compose down -v  # -v 参数会删除数据卷
docker compose up -d

# 方法 2: 手动删除数据目录
docker compose down
rm -rf data/postgres/
docker compose up -d
```

## 升级流程

升级应用时，数据库会自动保留：

```bash
# 1. 停止当前服务
docker compose down

# 2. 拉取最新代码或镜像
git pull
# 或
docker compose -f docker-compose.prod.yml pull

# 3. 启动新版本
docker compose up -d

# 数据库文件会自动保留在 data/postgres/ 目录中
```

## 迁移到新服务器

```bash
# 在旧服务器上
cd snippet-manager
tar -czf ../snippet-data-backup.tar.gz data/

# 传输到新服务器
scp snippet-data-backup.tar.gz user@newserver:/path/to/

# 在新服务器上
cd /path/to/snippet-manager
tar -xzf ../snippet-data-backup.tar.gz
docker compose up -d
```

## 注意事项

1. **端口配置**: PostgreSQL 映射到主机 26526 端口，后端 26528，前端 26527，避免端口冲突
2. **权限问题**: 确保容器有权限读写宿主机的数据库目录
3. **备份重要性**: 定期备份 `data/` 目录
4. **版本兼容**: 升级应用时注意数据库架构兼容性
5. **不要追踪**: `data/` 目录已加入 `.gitignore`，不会被 git 追踪
6. **密码安全**: 生产环境务必修改默认的数据库密码

## 环境变量配置

在 `.env` 文件中配置数据库参数：

```bash
# PostgreSQL 配置
POSTGRES_DB=snippets
POSTGRES_USER=snippets_user
POSTGRES_PASSWORD=your-secure-password-here

# Backend 会自动使用这些环境变量
DATABASE_URL=postgresql://snippets_user:your-secure-password-here@postgres:5432/snippets
```

## 故障排查

### 数据库连接失败

如果后端无法连接数据库：

```bash
# 检查 postgres 容器状态
docker compose ps postgres

# 查看 postgres 日志
docker compose logs postgres

# 测试数据库健康检查
docker compose exec postgres pg_isready -U snippets_user
```

### 权限错误

如果遇到权限问题：

```bash
# 检查目录所有权
ls -la data/

# 修改权限（如果需要）
sudo chown -R $USER:$USER data/
chmod -R 755 data/
```

### 数据库损坏

如果数据库损坏：

```bash
# 尝试使用 PostgreSQL 恢复工具
docker compose exec postgres pg_resetwal /var/lib/postgresql/data

# 如果无法恢复，从备份恢复
docker compose down
rm -rf data/postgres
cp -r backups/postgres-latest data/postgres
docker compose up -d
```

### 端口已被占用

如果 26526 端口也被占用，可以修改 docker-compose.yml 中的端口映射：

```yaml
postgres:
  ports:
    - "其他端口:5432"  # 使用其他可用端口
```

## 性能优化

### PostgreSQL 配置调优

在生产环境中，可以通过环境变量调整 PostgreSQL 配置：

```yaml
postgres:
  environment:
    - POSTGRES_INITDB_ARGS=-E UTF8 --locale=C
    - POSTGRES_HOST_AUTH_METHOD=scram-sha-256
  command:
    - postgres
    - -c
    - max_connections=100
    - -c
    - shared_buffers=256MB
```

## 测试验证

检查数据库是否正常工作：

```bash
# 运行健康检查
docker compose exec postgres pg_isready

# 连接到数据库
docker compose exec postgres psql -U snippets_user -d snippets

# 查看数据库大小
docker compose exec postgres psql -U snippets_user -d snippets -c "SELECT pg_size_pretty(pg_database_size('snippets'));"

# 查看表列表
docker compose exec postgres psql -U snippets_user -d snippets -c "\dt"
```
