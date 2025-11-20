// 片段分享工具

/**
 * 将片段格式化为 Markdown 格式
 * @param {Object} snippet - 片段对象
 * @returns {string} Markdown 格式的文本
 */
export function formatAsMarkdown(snippet) {
  let markdown = `# ${snippet.title}\n\n`

  // 添加描述
  if (snippet.description) {
    markdown += `${snippet.description}\n\n`
  }

  // 添加元数据
  markdown += `**类型**: ${snippet.snippet_type === 'code' ? '代码片段' : '提示词'}\n`

  if (snippet.language) {
    markdown += `**语言**: ${snippet.language}\n`
  }

  if (snippet.tags && snippet.tags.length > 0) {
    markdown += `**标签**: ${snippet.tags.join(', ')}\n`
  }

  markdown += `**创建时间**: ${new Date(snippet.created_at).toLocaleString('zh-CN')}\n`
  markdown += `**更新时间**: ${new Date(snippet.updated_at).toLocaleString('zh-CN')}\n\n`

  // 添加内容
  markdown += `## 内容\n\n`

  if (snippet.snippet_type === 'code' && snippet.language) {
    markdown += `\`\`\`${snippet.language}\n${snippet.content}\n\`\`\`\n`
  } else {
    markdown += `${snippet.content}\n`
  }

  return markdown
}

/**
 * 将片段格式化为纯文本
 * @param {Object} snippet - 片段对象
 * @returns {string} 纯文本
 */
export function formatAsText(snippet) {
  let text = `标题: ${snippet.title}\n`
  text += `类型: ${snippet.snippet_type === 'code' ? '代码片段' : '提示词'}\n`

  if (snippet.description) {
    text += `描述: ${snippet.description}\n`
  }

  if (snippet.language) {
    text += `语言: ${snippet.language}\n`
  }

  if (snippet.tags && snippet.tags.length > 0) {
    text += `标签: ${snippet.tags.join(', ')}\n`
  }

  text += `\n内容:\n${snippet.content}\n`

  return text
}

/**
 * 将片段复制到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 是否成功
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('复制失败:', error)

    // 回退方案：使用传统方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    } catch (fallbackError) {
      console.error('回退复制方案也失败:', fallbackError)
      return false
    }
  }
}

/**
 * 下载片段为文件
 * @param {Object} snippet - 片段对象
 * @param {string} format - 格式 ('json', 'md', 'txt')
 */
export function downloadSnippet(snippet, format = 'json') {
  let content, filename, mimeType

  switch (format) {
    case 'json':
      content = JSON.stringify(snippet, null, 2)
      filename = `${sanitizeFilename(snippet.title)}.json`
      mimeType = 'application/json'
      break

    case 'md':
      content = formatAsMarkdown(snippet)
      filename = `${sanitizeFilename(snippet.title)}.md`
      mimeType = 'text/markdown'
      break

    case 'txt':
      content = formatAsText(snippet)
      filename = `${sanitizeFilename(snippet.title)}.txt`
      mimeType = 'text/plain'
      break

    case 'code':
      content = snippet.content
      const ext = getFileExtension(snippet.language) || 'txt'
      filename = `${sanitizeFilename(snippet.title)}.${ext}`
      mimeType = 'text/plain'
      break

    default:
      throw new Error(`不支持的格式: ${format}`)
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 清理文件名中的非法字符
 * @param {string} filename - 原始文件名
 * @returns {string} 清理后的文件名
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 200)
}

/**
 * 根据编程语言获取文件扩展名
 * @param {string} language - 编程语言
 * @returns {string} 文件扩展名
 */
function getFileExtension(language) {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    ruby: 'rb',
    php: 'php',
    swift: 'swift',
    kotlin: 'kt',
    scala: 'scala',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yml',
    markdown: 'md',
    sql: 'sql',
    shell: 'sh',
    bash: 'sh',
    powershell: 'ps1',
    vue: 'vue',
    react: 'jsx',
    jsx: 'jsx',
    tsx: 'tsx'
  }

  return extensions[language?.toLowerCase()] || 'txt'
}

/**
 * 生成分享链接文本（用于复制分享）
 * @param {Object} snippet - 片段对象
 * @returns {string} 分享文本
 */
export function generateShareText(snippet) {
  return `📋 分享片段: ${snippet.title}\n\n${formatAsMarkdown(snippet)}\n\n---\n来自代码片段管理器`
}
