// 表格渲染模块

let dataTable = null;

/**
 * 渲染DataTable
 * @param {Array} data - JSON数据数组
 * @returns {object} DataTable实例
 */
export function renderTable(data) {
    // 获取所有可能的列
    const allKeys = new Set();
    data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
    });

    const columns = Array.from(allKeys).map(key => ({
        title: key,
        data: key,
        defaultContent: '',
        render: function(data, type, row) {
            if (data === null || data === undefined) {
                return '<span style="color:#999;">-</span>';
            }
            if (typeof data === 'object') {
                return '<pre style="margin:0;font-size:11px;">' + JSON.stringify(data, null, 2) + '</pre>';
            }
            return data;
        }
    }));

    // 构建表格HTML
    let tableHtml = '<table id="dataTable" class="display" style="width:100%"><thead><tr>';
    columns.forEach(col => {
        tableHtml += `<th>${col.title}</th>`;
    });
    tableHtml += '</tr></thead><tbody></tbody></table>';

    document.getElementById('tableWrapper').innerHTML = tableHtml;

    // 销毁旧表格
    if (dataTable) {
        dataTable.destroy();
    }

    // 初始化DataTable
    dataTable = $('#dataTable').DataTable({
        data: data,
        columns: columns,
        pageLength: 25,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "全部"]],
        language: {
            "search": "搜索:",
            "lengthMenu": "显示 _MENU_ 条",
            "info": "显示第 _START_ 至 _END_ 条，共 _TOTAL_ 条",
            "infoEmpty": "显示第 0 至 0 条，共 0 条",
            "infoFiltered": "(从 _MAX_ 条数据中筛选)",
            "paginate": {
                "first": "首页",
                "last": "末页",
                "next": "下一页",
                "previous": "上一页"
            },
            "zeroRecords": "没有找到匹配的记录",
            "emptyTable": "表中没有可用数据"
        },
        dom: '<"top"lf>rt<"bottom"ip>',
        scrollX: true,
        autoWidth: false
    });

    return dataTable;
}

/**
 * 销毁DataTable
 */
export function destroyTable() {
    if (dataTable) {
        dataTable.destroy();
        dataTable = null;
    }
}

/**
 * 获取当前DataTable实例
 */
export function getDataTable() {
    return dataTable;
}
