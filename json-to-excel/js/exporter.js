// Excel导出模块
import { showError, showSuccess, updateProgress, showDownloadLink } from './utils.js';

let currentDownloadUrl = null;

/**
 * 导出Excel文件
 * @param {Array} data - 要导出的数据
 */
export async function exportExcel(data) {
    if (!data || data.length === 0) {
        showError('没有数据可导出');
        return;
    }

    try {
        // 检查XLSX库是否加载
        if (typeof XLSX === 'undefined') {
            showError('Excel库未加载，请检查网络连接');
            console.error('XLSX库未定义');
            return;
        }

        // 阶段1：准备数据 (0-20%)
        updateProgress(5, '正在准备数据...');
        await delay(100);

        // 获取所有列
        const allKeys = new Set();
        data.forEach(item => {
            Object.keys(item).forEach(key => allKeys.add(key));
        });

        updateProgress(15, `正在处理 ${data.length} 条记录...`);
        await delay(100);

        // 阶段2：构建工作表数据 (20-40%)
        updateProgress(20, '正在构建表格数据...');
        const headers = Array.from(allKeys);
        const wsData = [headers];

        // 分批处理数据，避免大数据卡顿
        const batchSize = 1000;
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, Math.min(i + batchSize, data.length));
            batch.forEach(row => {
                const rowData = headers.map(header => {
                    const value = row[header];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') return JSON.stringify(value);
                    return value;
                });
                wsData.push(rowData);
            });

            // 更新进度
            const progress = 20 + Math.floor((i / data.length) * 20);
            updateProgress(progress, `已处理 ${Math.min(i + batchSize, data.length)} / ${data.length} 条记录...`);
            await delay(10);
        }

        // 阶段3：创建工作簿 (40-60%)
        updateProgress(45, '正在创建Excel工作簿...');
        await delay(100);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        updateProgress(55, '正在优化表格格式...');
        await delay(100);

        // 阶段4：设置列宽 (60-70%)
        updateProgress(60, '正在设置列宽...');
        const colWidths = headers.map(header => {
            let maxWidth = header.length;
            data.forEach(row => {
                const value = row[header];
                if (value) {
                    const len = String(value).length;
                    if (len > maxWidth) maxWidth = len;
                }
            });
            return { wch: Math.min(maxWidth + 2, 50) };
        });
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, "Data");

        // 阶段5：生成文件 (70-90%)
        updateProgress(75, '正在生成Excel文件...');
        await delay(100);

        // 生成文件名
        const fileName = `data_${new Date().getTime()}.xlsx`;

        // 尝试多种下载方式
        let downloadSuccess = false;

        updateProgress(85, '正在准备下载...');
        await delay(100);

        console.log('开始生成 Excel 文件，记录数:', data.length);

        // 优先使用 Blob 方式（更可靠）
        try {
            updateProgress(88, '正在生成文件数据...');

            // 使用 array buffer 方式生成
            const wbout = XLSX.write(wb, {
                bookType: 'xlsx',
                type: 'array',
                bookSST: false
            });

            const blob = new Blob([wbout], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            console.log('Blob 创建成功，大小:', blob.size, 'bytes');

            updateProgress(92, '正在触发下载...');
            await delay(50);

            // 创建下载链接
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // IE 特殊处理
                console.log('使用 IE 下载方式');
                window.navigator.msSaveOrOpenBlob(blob, fileName);
                downloadSuccess = true;
            } else {
                // 现代浏览器
                const url = window.URL.createObjectURL(blob);
                currentDownloadUrl = url;

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.style.display = 'none';

                document.body.appendChild(a);
                console.log('触发下载链接点击');
                a.click();

                // 显示下载链接
                showDownloadLink(url);

                // 延迟移除链接元素，但保留URL直到用户关闭弹窗
                setTimeout(() => {
                    document.body.removeChild(a);
                    console.log('下载链接元素已移除');
                }, 1000);

                downloadSuccess = true;
            }
        } catch (e1) {
            console.error('Blob 方式失败:', e1);

            // 备用方法：使用 XLSX.writeFile
            try {
                console.log('尝试 writeFile 方式');
                updateProgress(88, '尝试标准下载方式...');
                XLSX.writeFile(wb, fileName);
                downloadSuccess = true;
            } catch (e2) {
                console.error('writeFile 方式失败:', e2);
                showError('导出失败，请尝试使用其他浏览器');
            }
        }

        // 阶段6：完成 (90-100%)
        if (downloadSuccess) {
            updateProgress(95, '下载已开始...');
            await delay(300);
            updateProgress(100, '导出完成！点击下方按钮关闭');
            showSuccess(`已导出 ${data.length} 条数据到 ${fileName}`);
        } else {
            showError('导出失败，请尝试使用其他浏览器或检查浏览器设置');
        }

    } catch (e) {
        showError('导出失败: ' + e.message);
        console.error('导出详细错误:', e);
    }
}

/**
 * 清理下载URL
 */
export function cleanupDownloadUrl() {
    if (currentDownloadUrl) {
        window.URL.revokeObjectURL(currentDownloadUrl);
        currentDownloadUrl = null;
        console.log('下载链接已清理');
    }
}

/**
 * 延迟函数
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
