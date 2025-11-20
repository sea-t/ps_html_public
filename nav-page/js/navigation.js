// 导航和搜索模块
import { getFaviconUrl } from './data-loader.js';

// 应用状态
let navigationData = null;
let currentCategoryIndex = 0;
let filteredData = null;

/**
 * 初始化导航数据
 * @param {Object} data - 导航数据
 */
export function initNavigationData(data) {
    navigationData = data;
    document.getElementById('page-title').textContent = data.title;
}

/**
 * 渲染分类导航
 * @param {Array} categories - 分类列表
 */
export function renderCategoryNav(categories) {
    const nav = document.getElementById('category-nav');
    nav.innerHTML = '';

    categories.forEach((category, index) => {
        const item = document.createElement('div');
        item.className = 'category-item';
        if (index === currentCategoryIndex) {
            item.classList.add('active');
        }

        item.innerHTML = `
            <span class="icon">${category.icon}</span>
            <span>${category.name}</span>
            <span class="count">${category.links.length}</span>
        `;

        item.addEventListener('click', () => showCategory(index));
        nav.appendChild(item);
    });
}

/**
 * 显示指定分类的内容
 * @param {number} index - 分类索引
 */
export function showCategory(index) {
    currentCategoryIndex = index;
    const categories = filteredData || navigationData.categories;
    const category = categories[index];

    // 更新分类导航的激活状态
    document.querySelectorAll('.category-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // 渲染内容
    renderContent(category);
}

/**
 * 渲染内容区域
 * @param {Object} category - 分类对象
 */
function renderContent(category) {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="content-header">
            <h2>
                <span class="icon">${category.icon}</span>
                <span>${category.name}</span>
            </h2>
        </div>
        <div class="links-grid" id="links-grid"></div>
    `;

    const linksGrid = document.getElementById('links-grid');

    category.links.forEach(link => {
        const linkCard = document.createElement('a');
        linkCard.className = 'link-card';
        linkCard.href = link.url;
        linkCard.target = '_blank';
        linkCard.rel = 'noopener noreferrer';

        const faviconUrl = getFaviconUrl(link.url);

        linkCard.innerHTML = `
            <div class="link-header">
                <img src="${faviconUrl}" alt="" class="link-favicon" onerror="this.style.display='none'">
                <h3>
                    ${link.name}
                    <span class="link-icon">→</span>
                </h3>
            </div>
            <p>${link.description}</p>
        `;

        linksGrid.appendChild(linkCard);
    });
}

/**
 * 搜索功能
 * @param {string} searchTerm - 搜索词
 */
export function handleSearch(searchTerm) {
    if (!navigationData) return;

    searchTerm = searchTerm.toLowerCase().trim();

    if (searchTerm === '') {
        filteredData = null;
        renderCategoryNav(navigationData.categories);
        showCategory(0);
        document.getElementById('no-results').style.display = 'none';
        return;
    }

    const filtered = navigationData.categories
        .map(category => {
            const filteredLinks = category.links.filter(link =>
                link.name.toLowerCase().includes(searchTerm) ||
                link.description.toLowerCase().includes(searchTerm)
            );

            if (filteredLinks.length > 0) {
                return {
                    ...category,
                    links: filteredLinks
                };
            }
            return null;
        })
        .filter(category => category !== null);

    if (filtered.length === 0) {
        document.getElementById('no-results').style.display = 'block';
        document.getElementById('content-area').innerHTML = '';
        document.getElementById('category-nav').innerHTML = '';
        filteredData = null;
    } else {
        document.getElementById('no-results').style.display = 'none';
        filteredData = filtered;
        renderCategoryNav(filtered);
        showCategory(0);
    }
}

/**
 * 获取当前显示的分类
 */
export function getCurrentCategory() {
    return currentCategoryIndex;
}
