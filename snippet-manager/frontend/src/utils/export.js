// 导入导出工具模块

/**
 * 导出为JSON文件
 * @param {Array} data - 要导出的数据
 * @param {string} filename - 文件名
 */
export function exportToJSON(data, filename = 'snippets') {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  downloadFile(blob, `${filename}_${getTimestamp()}.json`)
}

/**
 * 导出为CSV文件
 * @param {Array} data - 要导出的数据
 * @param {string} filename - 文件名
 */
export function exportToCSV(data, filename = 'snippets') {
  if (!data || data.length === 0) {
    throw new Error('没有数据可导出')
  }

  // CSV表头
  const headers = ['ID', '标题', '类型', '语言', '描述', '标签', '内容', '创建时间', '更新时间']

  // CSV内容
  const rows = data.map(item => [
    item.id,
    escapeCsvValue(item.title),
    item.snippet_type,
    item.language || '',
    escapeCsvValue(item.description || ''),
    Array.isArray(item.tags) ? item.tags.join(';') : '',
    escapeCsvValue(item.content),
    item.created_at,
    item.updated_at
  ])

  // 组合CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // 添加BOM以支持Excel中文显示
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
  downloadFile(blob, `${filename}_${getTimestamp()}.csv`)
}

/**
 * 从JSON文件导入
 * @param {File} file - 文件对象
 * @returns {Promise<Array>} 解析后的数据
 */
export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)

        // 验证数据格式
        if (!Array.isArray(data)) {
          reject(new Error('JSON文件格式错误，应为数组格式'))
          return
        }

        // 验证必需字段
        const validData = data.filter(item => {
          return item.title && item.content && item.snippet_type
        })

        if (validData.length === 0) {
          reject(new Error('JSON文件中没有有效的片段数据'))
          return
        }

        // 清理和规范化数据
        const normalizedData = validData.map(item => ({
          title: item.title,
          content: item.content,
          description: item.description || '',
          snippet_type: item.snippet_type || 'code',
          language: item.language || '',
          tags: Array.isArray(item.tags) ? item.tags :
                (item.tags ? item.tags.split(',').map(t => t.trim()) : [])
        }))

        resolve(normalizedData)
      } catch (error) {
        reject(new Error('JSON文件解析失败: ' + error.message))
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsText(file)
  })
}

/**
 * 下载文件
 * @param {Blob} blob - 文件内容
 * @param {string} filename - 文件名
 */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 转义CSV值
 * @param {string} value - 要转义的值
 * @returns {string} 转义后的值
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)
  // 如果包含逗号、换行符或双引号，需要用双引号包裹，并转义内部的双引号
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * 获取时间戳字符串
 * @returns {string} 格式化的时间戳
 */
function getTimestamp() {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5)
}
