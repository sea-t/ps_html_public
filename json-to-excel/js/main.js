// 主应用模块
import {
    showError,
    showSuccess,
    hideMessages,
    updateInputStats,
    showProgress,
    hideProgress,
    copyDownloadLink
} from './utils.js';
import { renderTable, destroyTable } from './table-renderer.js';
import { exportExcel, cleanupDownloadUrl } from './exporter.js';

// 应用状态
let currentData = null;

/**
 * 初始化应用
 */
function init() {
    // 绑定事件
    bindEvents();

    // 初始化resize功能
    initResize();

    console.log('JSON转Excel工具已加载');
    checkLibraries();
}

/**
 * 绑定事件处理器
 */
function bindEvents() {
    // 监听输入变化
    document.getElementById('jsonInput').addEventListener('input', updateInputStats);

    // 支持粘贴后自动解析
    document.getElementById('jsonInput').addEventListener('paste', function(e) {
        setTimeout(() => {
            updateInputStats();
            // 自动尝试格式化
            try {
                const data = JSON.parse(this.value);
                if (Array.isArray(data) && data.length > 0) {
                    this.value = JSON.stringify(data, null, 2);
                }
            } catch (e) {
                // 忽略格式化错误
            }
        }, 100);
    });

    // 复制链接按钮
    document.getElementById('copyLinkBtn').addEventListener('click', copyDownloadLink);

    // 快捷键支持
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter 解析JSON
        if (e.ctrlKey && e.key === 'Enter') {
            parseJSON();
        }
        // Ctrl+Shift+F 格式化JSON
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            formatJSON();
        }
        // Ctrl+E 导出Excel
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            if (currentData) {
                handleExportExcel();
            }
        }
    });
}

/**
 * 格式化JSON
 */
window.formatJSON = function() {
    const input = document.getElementById('jsonInput');
    try {
        const data = JSON.parse(input.value);
        input.value = JSON.stringify(data, null, 2);
        showSuccess('JSON已格式化');
        updateInputStats();
    } catch (e) {
        showError('JSON格式错误: ' + e.message);
    }
};

/**
 * 解析JSON
 */
window.parseJSON = function() {
    const input = document.getElementById('jsonInput').value;

    if (!input.trim()) {
        showError('请输入JSON数据');
        return;
    }

    try {
        const data = JSON.parse(input);

        // 检查是否为数组
        if (!Array.isArray(data)) {
            showError('JSON必须是数组格式');
            return;
        }

        if (data.length === 0) {
            showError('JSON数组不能为空');
            return;
        }

        currentData = data;
        renderTable(data);
        showSuccess(`成功解析 ${data.length} 条数据`);
        document.getElementById('exportBtn').style.display = 'inline-block';
        updateInputStats();

    } catch (e) {
        showError('JSON解析失败: ' + e.message);
    }
};

/**
 * 导出Excel
 */
window.exportExcel = async function() {
    if (!currentData) {
        showError('没有数据可导出');
        return;
    }

    showProgress();
    await exportExcel(currentData);
};

/**
 * 处理导出Excel
 */
async function handleExportExcel() {
    window.exportExcel();
}

/**
 * 清空所有
 */
window.clearAll = function() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('tableWrapper').innerHTML = '<div class="empty-state">请在左侧输入JSON数组，然后点击"解析JSON"按钮</div>';
    document.getElementById('exportBtn').style.display = 'none';
    currentData = null;
    destroyTable();
    hideMessages();
    updateInputStats();
};

/**
 * 隐藏进度窗口
 */
window.hideProgress = function() {
    hideProgress();
    cleanupDownloadUrl();
};

/**
 * 初始化resize功能
 */
function initResize() {
    let isResizing = false;
    const leftPanel = document.querySelector('.left-panel');

    // 创建调整手柄
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.top = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '5px';
    resizeHandle.style.cursor = 'col-resize';
    leftPanel.style.position = 'relative';
    leftPanel.appendChild(resizeHandle);

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const containerWidth = document.querySelector('.container').offsetWidth;
        const newWidth = (e.clientX / containerWidth) * 100;
        if (newWidth > 20 && newWidth < 80) {
            leftPanel.style.width = newWidth + '%';
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
    });
}

/**
 * 检查关键库是否加载
 */
function checkLibraries() {
    setTimeout(() => {
        if (typeof jQuery === 'undefined') {
            console.error('jQuery未加载');
        }
        if (typeof $.fn.DataTable === 'undefined') {
            console.error('DataTables未加载');
        }
        if (typeof XLSX === 'undefined') {
            console.error('SheetJS未加载');
        } else {
            console.log('所有依赖库已成功加载');
        }
    }, 1000);
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);
