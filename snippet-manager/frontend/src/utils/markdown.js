// Markdown 渲染工具
// 注意: 需要安装 marked 和 DOMPurify
// npm install marked dompurify

import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 配置 marked
marked.setOptions({
  breaks: true, // 支持 GitHub 风格的换行
  gfm: true, // 启用 GitHub 风格的 Markdown
  headerIds: true,
  mangle: false
})

/**
 * 将 Markdown 文本转换为安全的 HTML
 * @param {string} markdown - Markdown 文本
 * @returns {string} 安全的 HTML 字符串
 */
export function renderMarkdown(markdown) {
  if (!markdown) return ''

  try {
    // 转换 Markdown 为 HTML
    const rawHTML = marked(markdown)

    // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
    const cleanHTML = DOMPurify.sanitize(rawHTML, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 'del', 's',
        'ul', 'ol', 'li',
        'blockquote', 'pre', 'code',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr', 'div', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id']
    })

    return cleanHTML
  } catch (error) {
    console.error('Markdown 渲染错误:', error)
    return markdown // 如果渲染失败，返回原始文本
  }
}

/**
 * 检测文本是否包含 Markdown 语法
 * @param {string} text - 要检测的文本
 * @returns {boolean} 是否包含 Markdown
 */
export function hasMarkdownSyntax(text) {
  if (!text) return false

  // 检测常见的 Markdown 语法
  const markdownPatterns = [
    /^#{1,6}\s/, // 标题
    /\*\*.*\*\*/, // 粗体
    /__.*__/, // 粗体
    /\*.*\*/, // 斜体
    /_.*_/, // 斜体
    /\[.*\]\(.*\)/, // 链接
    /!\[.*\]\(.*\)/, // 图片
    /^[-*+]\s/, // 无序列表
    /^\d+\.\s/, // 有序列表
    /^>\s/, // 引用
    /`.*`/, // 行内代码
    /```/, // 代码块
    /^\|.*\|$/, // 表格
  ]

  return markdownPatterns.some(pattern => pattern.test(text))
}

/**
 * 简单的 Markdown 转纯文本（移除所有 Markdown 语法）
 * @param {string} markdown - Markdown 文本
 * @returns {string} 纯文本
 */
export function markdownToPlainText(markdown) {
  if (!markdown) return ''

  return markdown
    .replace(/^#{1,6}\s+/gm, '') // 移除标题
    .replace(/\*\*(.+?)\*\*/g, '$1') // 移除粗体
    .replace(/__(.+?)__/g, '$1') // 移除粗体
    .replace(/\*(.+?)\*/g, '$1') // 移除斜体
    .replace(/_(.+?)_/g, '$1') // 移除斜体
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 移除链接
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1') // 移除图片
    .replace(/`(.+?)`/g, '$1') // 移除行内代码
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/^>\s+/gm, '') // 移除引用
    .replace(/^[-*+]\s+/gm, '') // 移除列表
    .replace(/^\d+\.\s+/gm, '') // 移除有序列表
    .trim()
}
