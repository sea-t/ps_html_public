// 主应用模块
import { getExampleData, toggleElement, setHTML, clearElement } from './utils.js';
import {
    parseDockerOutput,
    getStatistics,
    generateAlerts,
    analyzePortUsage,
    groupByApplication,
    exportReport
} from './parser.js';
import {
    renderStats,
    renderAlerts,
    renderPortAnalysis,
    renderTable,
    renderGroupView
} from './renderer.js';

// 应用状态
const state = {
    containersData: [],
    currentFilter: 'all'
};

// DOM元素引用
const elements = {
    dockerInput: null,
    loading: null,
    quickFilters: null,
    statsContainer: null,
    alertsContainer: null,
    portAnalysis: null,
    portAnalysisContent: null,
    tableContainer: null,
    tableBody: null,
    searchInput: null,
    appGroupsContainer: null
};

/**
 * 初始化应用
 */
function init() {
    // 获取DOM元素
    elements.dockerInput = document.getElementById('dockerInput');
    elements.loading = document.getElementById('loading');
    elements.quickFilters = document.getElementById('quickFilters');
    elements.statsContainer = document.getElementById('statsContainer');
    elements.alertsContainer = document.getElementById('alertsContainer');
    elements.portAnalysis = document.getElementById('portAnalysis');
    elements.portAnalysisContent = document.getElementById('portAnalysisContent');
    elements.tableContainer = document.getElementById('tableContainer');
    elements.tableBody = document.getElementById('tableBody');
    elements.searchInput = document.getElementById('searchInput');
    elements.appGroupsContainer = document.getElementById('appGroupsContainer');

    // 绑定事件
    bindEvents();

    // 加载示例数据
    loadExample();
}

/**
 * 绑定事件处理器
 */
function bindEvents() {
    // 搜索功能
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keyup', searchContainers);
    }
}

/**
 * 清空输入
 */
window.clearInput = function() {
    elements.dockerInput.value = '';
    state.containersData = [];
    hideResults();
};

/**
 * 加载示例数据
 */
window.loadExample = function() {
    elements.dockerInput.value = getExampleData();
};

/**
 * 隐藏结果区域
 */
function hideResults() {
    toggleElement(elements.quickFilters, false);
    clearElement(elements.statsContainer);
    clearElement(elements.alertsContainer);
    toggleElement(elements.portAnalysis, false);
    toggleElement(elements.tableContainer, false);
    toggleElement(elements.appGroupsContainer, false);
}

/**
 * 解析Docker输出
 */
window.parseDockerOutput = function() {
    const input = elements.dockerInput.value.trim();

    if (!input) {
        alert('请输入 Docker 容器信息！');
        return;
    }

    // 显示加载动画
    elements.loading.classList.add('show');

    setTimeout(() => {
        try {
            state.containersData = parseDockerOutput(input);

            if (state.containersData.length === 0) {
                alert('未能解析到容器信息，请检查输入格式！');
                elements.loading.classList.remove('show');
                return;
            }

            // 显示结果
            displayResults();

        } catch (error) {
            alert('解析错误：' + error.message);
        } finally {
            elements.loading.classList.remove('show');
        }
    }, 500);
};

/**
 * 显示结果
 */
function displayResults() {
    const stats = getStatistics(state.containersData);
    const alerts = generateAlerts(state.containersData);
    const portGroups = analyzePortUsage(state.containersData);

    // 渲染统计信息
    setHTML(elements.statsContainer, renderStats(stats));

    // 渲染警告信息
    setHTML(elements.alertsContainer, renderAlerts(alerts));

    // 渲染端口分析
    setHTML(elements.portAnalysisContent, renderPortAnalysis(portGroups));
    toggleElement(elements.portAnalysis, true);

    // 渲染表格
    setHTML(elements.tableBody, renderTable(state.containersData));
    toggleElement(elements.tableContainer, true);

    // 显示过滤器
    toggleElement(elements.quickFilters, true);
}

/**
 * 搜索容器
 */
function searchContainers() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

/**
 * 过滤容器
 */
window.filterContainers = function(filter) {
    state.currentFilter = filter;

    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    const rows = document.querySelectorAll('#tableBody tr');

    rows.forEach(row => {
        let show = false;

        switch(filter) {
            case 'all':
                show = true;
                break;
            case 'healthy':
                show = row.dataset.status.includes('healthy');
                break;
            case 'ports':
                show = row.querySelector('.port-mapping') !== null;
                break;
            case 'maxkb':
                show = row.dataset.image.includes('maxkb') || row.dataset.container.includes('maxkb');
                break;
            case 'dify':
                show = row.dataset.image.includes('dify') || row.dataset.container.includes('dify');
                break;
            case 'database':
                show = row.dataset.image.includes('redis') ||
                       row.dataset.image.includes('postgres') ||
                       row.dataset.container.includes('redis') ||
                       row.dataset.container.includes('pgsql');
                break;
        }

        row.style.display = show ? '' : 'none';
    });
};

/**
 * 切换视图
 */
window.switchView = function(view) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const tableView = document.querySelector('.table-wrapper');
    const groupView = elements.appGroupsContainer;

    if (view === 'table') {
        toggleElement(tableView, true);
        toggleElement(groupView, false);
    } else {
        toggleElement(tableView, false);
        displayGroupView();
        groupView.style.display = 'grid';
    }
};

/**
 * 显示分组视图
 */
function displayGroupView() {
    const groups = groupByApplication(state.containersData);
    setHTML(elements.appGroupsContainer, renderGroupView(groups));
}

/**
 * 导出数据
 */
window.exportData = function() {
    if (state.containersData.length === 0) {
        alert('请先分析容器信息！');
        return;
    }

    const reportText = exportReport(state.containersData);

    // 创建下载
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docker-analysis-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', init);
