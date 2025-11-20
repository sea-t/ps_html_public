// 主应用模块
import { initThemeToggle } from './theme.js';
import { loadNavigationData } from './data-loader.js';
import {
    initNavigationData,
    renderCategoryNav,
    showCategory,
    handleSearch
} from './navigation.js';

/**
 * 初始化应用
 */
async function init() {
    // 初始化主题切换
    initThemeToggle();

    // 加载导航数据
    try {
        const data = await loadNavigationData();
        initNavigationData(data);
        renderCategoryNav(data.categories);
        showCategory(0);
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error('加载导航数据失败:', error);
        document.getElementById('loading').textContent = '加载失败，请刷新页面重试';
    }

    // 绑定搜索事件
    document.getElementById('search-input').addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });
}

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', init);
