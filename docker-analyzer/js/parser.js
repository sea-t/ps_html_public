// Docker输出解析模块

/**
 * 解析Docker ps输出
 * @param {string} input - Docker ps命令的原始输出
 * @returns {Array} 容器数据数组
 */
export function parseDockerOutput(input) {
    const lines = input.split('\n');
    const containers = [];

    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(/\s{2,}/);
        if (parts.length >= 7) {
            containers.push({
                id: parts[0],
                image: parts[1],
                command: parts[2],
                created: parts[3],
                status: parts[4],
                ports: parts[5],
                names: parts[6]
            });
        }
    }

    return containers;
}

/**
 * 获取统计信息
 * @param {Array} containers - 容器数据数组
 * @returns {Object} 统计信息
 */
export function getStatistics(containers) {
    return {
        total: containers.length,
        running: containers.filter(c => c.status.includes('Up')).length,
        healthy: containers.filter(c => c.status.includes('healthy')).length,
        withPorts: containers.filter(c => c.ports && c.ports !== '').length
    };
}

/**
 * 生成警告信息
 * @param {Array} containers - 容器数据数组
 * @returns {Array} 警告列表
 */
export function generateAlerts(containers) {
    const alerts = [];

    // 检查停止的容器
    const stoppedContainers = containers.filter(c => c.status.includes('Exited'));
    if (stoppedContainers.length > 0) {
        alerts.push({
            type: 'danger',
            icon: '⚠️',
            title: '发现停止的容器',
            content: `有 ${stoppedContainers.length} 个容器已停止运行：${stoppedContainers.map(c => c.names).join(', ')}`
        });
    }

    // 检查公网端口
    const publicPorts = containers.filter(c => c.ports && c.ports.includes('0.0.0.0'));
    if (publicPorts.length > 0) {
        alerts.push({
            type: 'warning',
            icon: '🌐',
            title: '公网端口暴露',
            content: `有 ${publicPorts.length} 个容器暴露了公网端口，请注意安全设置`
        });
    }

    // 检查没有健康检查的容器
    const noHealthCheck = containers.filter(c => !c.status.includes('healthy') && c.status.includes('Up'));
    if (noHealthCheck.length > 0) {
        alerts.push({
            type: 'info',
            icon: 'ℹ️',
            title: '缺少健康检查',
            content: `有 ${noHealthCheck.length} 个运行中的容器未配置健康检查`
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            type: 'success',
            icon: '✅',
            title: '一切正常',
            content: '所有容器运行状态良好'
        });
    }

    return alerts;
}

/**
 * 分析端口使用情况
 * @param {Array} containers - 容器数据数组
 * @returns {Object} 端口分组
 */
export function analyzePortUsage(containers) {
    const portGroups = {
        redis: [],
        postgres: [],
        http: [],
        app: [],
        other: []
    };

    containers.forEach(container => {
        if (!container.ports || container.ports === '') return;

        const ports = container.ports.split(',').map(p => p.trim());
        ports.forEach(port => {
            if (port.includes('6379')) {
                portGroups.redis.push({ container: container.names, port });
            } else if (port.includes('5432')) {
                portGroups.postgres.push({ container: container.names, port });
            } else if (port.includes('80') || port.includes('443')) {
                portGroups.http.push({ container: container.names, port });
            } else if (port.includes('->')) {
                portGroups.app.push({ container: container.names, port });
            } else {
                portGroups.other.push({ container: container.names, port });
            }
        });
    });

    return portGroups;
}

/**
 * 按应用分组容器
 * @param {Array} containers - 容器数据数组
 * @returns {Object} 应用分组
 */
export function groupByApplication(containers) {
    const groups = {};

    containers.forEach(container => {
        let groupName = '其他';

        if (container.image.includes('maxkb') || container.names.includes('maxkb')) {
            groupName = 'MaxKB';
        } else if (container.image.includes('dify') || container.names.includes('dify')) {
            groupName = 'Dify';
        } else if (container.image.includes('redis')) {
            groupName = 'Redis';
        } else if (container.image.includes('postgres')) {
            groupName = 'PostgreSQL';
        } else if (container.image.includes('nginx')) {
            groupName = 'Nginx';
        }

        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(container);
    });

    return groups;
}

/**
 * 导出报告数据
 * @param {Array} containers - 容器数据数组
 * @returns {string} 报告文本
 */
export function exportReport(containers) {
    const stats = getStatistics(containers);
    const reportData = {
        generatedAt: new Date().toLocaleString('zh-CN'),
        totalContainers: stats.total,
        runningContainers: stats.running,
        healthyContainers: stats.healthy,
        containers: containers
    };

    const reportText = `
Docker 容器分析报告
生成时间：${reportData.generatedAt}

统计信息：
- 总容器数：${reportData.totalContainers}
- 运行中：${reportData.runningContainers}
- 健康容器：${reportData.healthyContainers}

详细信息：
${containers.map(c => `
容器名称：${c.names}
容器ID：${c.id}
镜像：${c.image}
状态：${c.status}
端口：${c.ports || '无'}
创建时间：${c.created}
${'='.repeat(80)}
`).join('\n')}
`;

    return reportText;
}
