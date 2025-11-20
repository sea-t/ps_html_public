// UI渲染模块

/**
 * 渲染统计卡片
 * @param {Object} stats - 统计数据
 * @returns {string} HTML字符串
 */
export function renderStats(stats) {
    const statsData = [
        { icon: '📦', number: stats.total, label: '总容器数' },
        { icon: '✅', number: stats.running, label: '运行中' },
        { icon: '💚', number: stats.healthy, label: '健康容器' },
        { icon: '🔌', number: stats.withPorts, label: '端口映射' }
    ];

    return statsData.map(stat => `
        <div class="stat-card">
            <div class="stat-icon">${stat.icon}</div>
            <div class="stat-number">${stat.number}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

/**
 * 渲染警告信息
 * @param {Array} alerts - 警告列表
 * @returns {string} HTML字符串
 */
export function renderAlerts(alerts) {
    return alerts.map(alert => `
        <div class="alert alert-${alert.type}">
            <div class="alert-icon">${alert.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.title}</div>
                <div>${alert.content}</div>
            </div>
        </div>
    `).join('');
}

/**
 * 渲染端口分析
 * @param {Object} portGroups - 端口分组
 * @returns {string} HTML字符串
 */
export function renderPortAnalysis(portGroups) {
    const groupConfig = [
        { key: 'redis', title: '🔴 Redis 端口', class: 'port-redis' },
        { key: 'postgres', title: '🐘 PostgreSQL 端口', class: 'port-postgres' },
        { key: 'http', title: '🌐 HTTP/HTTPS 端口', class: 'port-http' },
        { key: 'app', title: '⚡ 应用端口', class: 'port-app' },
        { key: 'other', title: '📌 其他端口', class: 'port-other' }
    ];

    let html = '<div class="port-grid">';

    groupConfig.forEach(config => {
        if (portGroups[config.key].length > 0) {
            html += `
                <div class="port-group">
                    <div class="port-group-title">${config.title}</div>
                    <div>
                        ${portGroups[config.key].map(item =>
                            `<span class="port-badge ${config.class}" title="${escapeHtml(item.container)}">${escapeHtml(item.port)}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }
    });

    html += '</div>';
    return html;
}

/**
 * 渲染容器表格
 * @param {Array} containers - 容器列表
 * @returns {string} HTML字符串
 */
export function renderTable(containers) {
    return containers.map(container => {
        const statusClass = container.status.includes('healthy') ? 'status-healthy' :
                           container.status.includes('Up') ? 'status-up' : 'status-exited';

        let portsHtml = '';
        if (container.ports && container.ports !== '') {
            const ports = container.ports.split(',').map(p => p.trim());
            portsHtml = ports.map(port => {
                const isExternal = port.includes('0.0.0.0') || port.includes(':::');
                return `<span class="port-mapping ${isExternal ? 'port-external' : 'port-internal'}">${escapeHtml(port)}</span>`;
            }).join('');
        }

        return `
            <tr data-container="${escapeHtml(container.names)}" data-image="${escapeHtml(container.image)}" data-status="${escapeHtml(container.status)}">
                <td>
                    <div class="container-name">${escapeHtml(container.names)}</div>
                </td>
                <td>
                    <div class="container-id">${escapeHtml(container.id)}</div>
                </td>
                <td>
                    <div class="image-name">${escapeHtml(container.image)}</div>
                </td>
                <td>
                    <div class="command" title="${escapeHtml(container.command)}">${escapeHtml(container.command)}</div>
                </td>
                <td>${escapeHtml(container.created)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${escapeHtml(container.status)}</span>
                </td>
                <td>${portsHtml || '<span style="color: #cbd5e0;">无</span>'}</td>
            </tr>
        `;
    }).join('');
}

/**
 * 渲染应用分组视图
 * @param {Object} groups - 应用分组
 * @returns {string} HTML字符串
 */
export function renderGroupView(groups) {
    return Object.entries(groups).map(([name, containers]) => `
        <div class="app-group-card">
            <div class="app-group-header">
                <div class="app-group-name">${escapeHtml(name)}</div>
                <div class="app-group-count">${containers.length}</div>
            </div>
            <div class="app-container-list">
                ${containers.map(c => `
                    <div class="app-container-item">
                        <span>${escapeHtml(c.names)}</span>
                        <span class="status-badge ${c.status.includes('healthy') ? 'status-healthy' : c.status.includes('Up') ? 'status-up' : 'status-exited'}">
                            ${c.status.includes('Up') ? '运行中' : '已停止'}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

/**
 * HTML转义
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
