# 数据库持久化配置

## 概述

本项目已配置数据库文件持久化到宿主机真实路径，确保容器升级、重启或删除时数据不会丢失。

## 配置详情

### 数据库位置

- **容器内路径**: `/app/instance/snippets.db`
- **宿主机路径**: `./data/database/snippets.db`
- **映射方式**: Docker bind mount

### Docker Compose 配置

所有 docker-compose 文件已配置数据库挂载:

```yaml
volumes:
  # 持久化数据库 - 挂载到宿主机真实路径
  - ./data/database:/app/instance
```

这个配置应用于:
- `docker-compose.yml` (生产环境，本地构建)
- `docker-compose.prod.yml` (生产环境，预构建镜像)
- `docker-compose.dev.yml` (开发环境)

## 数据持久化说明

### 优势

1. **升级安全**: 更新应用版本时，数据库文件保留在宿主机上
2. **数据可见**: 可以直接在宿主机上查看和备份数据库文件
3. **容器独立**: 删除容器不会影响数据
4. **易于迁移**: 直接复制 `data/` 目录即可迁移数据

### 数据库文件结构

```
snippet-manager/
├── data/                      # 数据目录（不会被git追踪）
│   └── database/             # 数据库目录
│       └── snippets.db       # SQLite数据库文件
```

## 使用说明

### 首次启动

首次启动时，数据库目录和文件会自动创建：

```bash
cd snippet-manager
./docker-start.sh
```

数据库目录会自动创建在 `./data/database/` 下。

### 查看数据库文件

```bash
# 查看数据库文件
ls -lh ./data/database/

# 查看数据库大小
du -h ./data/database/snippets.db
```

### 备份数据库

```bash
# 创建备份
mkdir -p backups
cp -r data/database backups/database-$(date +%Y%m%d-%H%M%S)

# 或使用tar压缩
tar -czf backups/database-$(date +%Y%m%d-%H%M%S).tar.gz data/database/
```

### 恢复数据库

```bash
# 从备份恢复
cp backups/database-YYYYMMDD-HHMMSS/snippets.db data/database/

# 或从tar包恢复
tar -xzf backups/database-YYYYMMDD-HHMMSS.tar.gz
```

### 重置数据库

如果需要清空数据库：

```bash
# 停止服务
./docker-stop.sh

# 删除数据库文件
rm -rf data/database/snippets.db

# 重新启动服务（会创建新的空数据库）
./docker-start.sh
```

## 升级流程

升级应用时，数据库会自动保留：

```bash
# 1. 停止当前服务
./docker-stop.sh

# 2. 拉取最新代码或镜像
git pull
# 或
docker-compose -f docker-compose.prod.yml pull

# 3. 启动新版本
./docker-start.sh

# 数据库文件会自动保留在 data/database/ 目录中
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
./docker-start.sh
```

## 注意事项

1. **权限问题**: 确保容器有权限读写宿主机的数据库目录
2. **备份重要性**: 定期备份 `data/` 目录
3. **版本兼容**: 升级应用时注意数据库架构兼容性
4. **不要追踪**: `data/` 目录已加入 `.gitignore`，不会被 git 追踪

## 技术细节

### Bind Mount vs Docker Volume

之前使用 Docker volume:
```yaml
volumes:
  - backend-data:/app/instance  # Docker管理的volume
```

现在使用 bind mount:
```yaml
volumes:
  - ./data/database:/app/instance  # 宿主机路径
```

**Bind mount 的优势**:
- 路径明确，易于查找和管理
- 可以直接在宿主机上访问和备份
- 升级、迁移更方便

## 故障排查

### 数据库文件不存在

如果容器启动后数据库文件没有创建：

```bash
# 检查容器日志
docker logs snippet-manager-backend

# 检查目录权限
ls -la data/database/

# 手动创建目录
mkdir -p data/database
```

### 权限错误

如果遇到权限问题：

```bash
# 检查目录所有权
ls -la data/

# 修改权限（如果需要）
chmod -R 755 data/
```

### 数据库损坏

如果数据库损坏：

```bash
# 使用 SQLite 检查
sqlite3 data/database/snippets.db "PRAGMA integrity_check;"

# 如果损坏，从备份恢复
cp backups/database-latest/snippets.db data/database/
```

## 测试验证

运行测试以验证数据库持久化：

```bash
# 运行完整测试套件
./run-tests.sh

# 只测试数据库挂载
./run-tests.sh database
```
