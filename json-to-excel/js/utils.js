// 工具函数模块

/**
 * 显示错误消息
 */
export function showError(msg) {
    const errorEl = document.getElementById('errorMsg');
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    document.getElementById('successMsg').style.display = 'none';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

/**
 * 显示成功消息
 */
export function showSuccess(msg) {
    const successEl = document.getElementById('successMsg');
    successEl.textContent = msg;
    successEl.style.display = 'block';
    document.getElementById('errorMsg').style.display = 'none';
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 3000);
}

/**
 * 隐藏消息
 */
export function hideMessages() {
    document.getElementById('errorMsg').style.display = 'none';
    document.getElementById('successMsg').style.display = 'none';
}

/**
 * 更新输入统计
 */
export function updateInputStats() {
    const input = document.getElementById('jsonInput').value;
    const stats = document.getElementById('inputStats');

    if (!input.trim()) {
        stats.textContent = '等待输入...';
        return;
    }

    try {
        const data = JSON.parse(input);
        if (Array.isArray(data)) {
            const keys = new Set();
            data.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(key => keys.add(key));
                }
            });
            stats.textContent = `${data.length} 条记录, ${keys.size} 个字段`;
        } else {
            stats.textContent = '需要数组格式的JSON';
        }
    } catch (e) {
        stats.textContent = 'JSON格式错误';
    }
}

/**
 * 显示进度条
 */
export function showProgress() {
    document.getElementById('progressOverlay').style.display = 'block';
    document.getElementById('progressContainer').style.display = 'block';
    updateProgress(0, '准备开始...');
}

/**
 * 隐藏进度条
 */
export function hideProgress() {
    document.getElementById('progressOverlay').style.display = 'none';
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('downloadLinkContainer').style.display = 'none';
}

/**
 * 更新进度条
 */
export function updateProgress(percent, text) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = percent + '%';
    progressBar.textContent = percent + '%';
    progressText.textContent = text;
}

/**
 * 显示下载链接
 */
export function showDownloadLink(url) {
    const container = document.getElementById('downloadLinkContainer');
    const input = document.getElementById('downloadLinkInput');
    input.value = url;
    container.style.display = 'block';
}

/**
 * 复制下载链接
 */
export function copyDownloadLink() {
    const input = document.getElementById('downloadLinkInput');
    const btn = document.getElementById('copyLinkBtn');

    input.select();
    input.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(input.value).then(() => {
            btn.textContent = '已复制!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = '复制链接';
                btn.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            document.execCommand('copy');
            btn.textContent = '已复制!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = '复制链接';
                btn.classList.remove('copied');
            }, 2000);
        });
    } catch (err) {
        console.error('复制失败:', err);
    }
}
