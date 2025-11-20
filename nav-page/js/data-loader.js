// 数据加载模块

/**
 * 加载导航数据
 * @returns {Promise<Object>} 导航数据
 */
export async function loadNavigationData() {
    try {
        const response = await fetch('navigation-data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('加载导航数据失败:', error);
        throw error;
    }
}

/**
 * 获取网站图标URL
 * @param {string} url - 网站URL
 * @returns {string} 图标URL
 */
export function getFaviconUrl(url) {
    try {
        const urlObj = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
    } catch (e) {
        return '';
    }
}
