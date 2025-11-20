<template>
  <el-dialog
    v-model="dialogVisible"
    :title="snippet?.title"
    width="70%"
    @close="handleClose"
  >
    <div v-if="snippet" class="view-content">
      <div class="meta-info">
        <el-tag :type="snippet.snippet_type === 'code' ? 'primary' : 'warning'">
          {{ snippet.snippet_type === 'code' ? '代码片段' : '提示词' }}
        </el-tag>
        <el-tag v-if="snippet.language" type="info" style="margin-left: 10px;">
          {{ snippet.language }}
        </el-tag>
        <el-tag
          v-for="tag in snippet.tags"
          :key="tag"
          style="margin-left: 10px;"
        >
          {{ tag }}
        </el-tag>
      </div>

      <p v-if="snippet.description" class="description">{{ snippet.description }}</p>

      <div class="content-section">
        <div class="content-header">
          <h3>内容</h3>
          <div class="header-actions">
            <el-button-group v-if="snippet.snippet_type === 'prompt' && showMarkdownToggle">
              <el-button
                :type="viewMode === 'raw' ? 'primary' : ''"
                size="small"
                @click="viewMode = 'raw'"
              >
                源码
              </el-button>
              <el-button
                :type="viewMode === 'rendered' ? 'primary' : ''"
                size="small"
                @click="viewMode = 'rendered'"
              >
                预览
              </el-button>
            </el-button-group>
            <el-button
              type="primary"
              size="small"
              @click="copyContent"
              style="margin-left: 10px;"
            >
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>

            <el-dropdown style="margin-left: 10px;" @command="handleShare">
              <el-button type="success" size="small">
                <el-icon><Share /></el-icon>
                分享
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="markdown">复制为 Markdown</el-dropdown-item>
                  <el-dropdown-item command="text">复制为纯文本</el-dropdown-item>
                  <el-dropdown-item command="share">生成分享文本</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-dropdown style="margin-left: 10px;" @command="handleDownload">
              <el-button type="warning" size="small">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="json">下载为 JSON</el-dropdown-item>
                  <el-dropdown-item command="md">下载为 Markdown</el-dropdown-item>
                  <el-dropdown-item command="txt">下载为文本</el-dropdown-item>
                  <el-dropdown-item v-if="snippet.snippet_type === 'code'" command="code">下载源代码</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 代码片段或原始视图 -->
        <pre v-if="snippet.snippet_type === 'code' || viewMode === 'raw'" class="content-display"><code :class="'language-' + snippet.language">{{ snippet.content }}</code></pre>

        <!-- Markdown 渲染视图 -->
        <div v-else-if="snippet.snippet_type === 'prompt' && viewMode === 'rendered'" class="markdown-content" v-html="renderedMarkdown"></div>
      </div>

      <div class="time-info">
        <span>创建时间: {{ formatDate(snippet.created_at) }}</span>
        <span style="margin-left: 20px;">更新时间: {{ formatDate(snippet.updated_at) }}</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Share, Download } from '@element-plus/icons-vue'
// 按需导入 highlight.js 核心和常用语言
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github-dark.css'

// 导入常用编程语言
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c++', cpp)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('c#', csharp)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('markdown', markdown)
import { renderMarkdown, hasMarkdownSyntax } from '../utils/markdown'
import { copyToClipboard, formatAsMarkdown, formatAsText, downloadSnippet, generateShareText } from '../utils/share'

export default {
  name: 'ViewDialog',
  components: {
    CopyDocument,
    Share,
    Download
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    snippet: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const dialogVisible = ref(props.modelValue)
    const viewMode = ref('raw') // 'raw' 或 'rendered'

    // 检测是否显示 Markdown 切换按钮
    const showMarkdownToggle = computed(() => {
      if (!props.snippet || props.snippet.snippet_type !== 'prompt') {
        return false
      }
      return hasMarkdownSyntax(props.snippet.content)
    })

    // 渲染 Markdown
    const renderedMarkdown = computed(() => {
      if (!props.snippet || !props.snippet.content) {
        return ''
      }
      return renderMarkdown(props.snippet.content)
    })

    watch(() => props.modelValue, (val) => {
      dialogVisible.value = val
      if (val && props.snippet) {
        // 重置视图模式
        viewMode.value = 'raw'

        // 延迟高亮代码
        setTimeout(() => {
          document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block)
          })
        }, 100)
      }
    })

    watch(dialogVisible, (val) => {
      emit('update:modelValue', val)
    })

    const handleClose = () => {
      dialogVisible.value = false
    }

    const copyContent = async () => {
      try {
        await navigator.clipboard.writeText(props.snippet.content)
        ElMessage.success('已复制到剪贴板')
      } catch (error) {
        ElMessage.error('复制失败')
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }

    // 分享功能
    const handleShare = async (format) => {
      try {
        let text
        switch (format) {
          case 'markdown':
            text = formatAsMarkdown(props.snippet)
            break
          case 'text':
            text = formatAsText(props.snippet)
            break
          case 'share':
            text = generateShareText(props.snippet)
            break
          default:
            text = props.snippet.content
        }

        const success = await copyToClipboard(text)
        if (success) {
          ElMessage.success('已复制到剪贴板')
        } else {
          ElMessage.error('复制失败')
        }
      } catch (error) {
        ElMessage.error('复制失败')
      }
    }

    // 下载功能
    const handleDownload = (format) => {
      try {
        downloadSnippet(props.snippet, format)
        ElMessage.success('下载成功')
      } catch (error) {
        ElMessage.error('下载失败')
      }
    }

    return {
      dialogVisible,
      viewMode,
      showMarkdownToggle,
      renderedMarkdown,
      handleClose,
      copyContent,
      formatDate,
      handleShare,
      handleDownload
    }
  }
}
</script>

<style scoped>
.view-content {
  padding: 10px 0;
}

.meta-info {
  margin-bottom: 15px;
}

.description {
  color: #606266;
  margin: 15px 0;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.content-section {
  margin: 20px 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.content-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.content-display {
  background: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}

.content-display code {
  font-family: 'Courier New', Monaco, monospace;
  font-size: 14px;
  line-height: 1.5;
}

.time-info {
  margin-top: 20px;
  font-size: 12px;
  color: #909399;
}

.header-actions {
  display: flex;
  align-items: center;
}

/* Markdown 渲染样式 */
.markdown-content {
  padding: 20px;
  background: var(--bg-secondary, #f5f7fa);
  border-radius: 4px;
  max-height: 500px;
  overflow-y: auto;
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary, #303133);
}

.markdown-content h1 {
  font-size: 2em;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
  padding-bottom: 0.3em;
}

.markdown-content h2 {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
  padding-bottom: 0.3em;
}

.markdown-content h3 {
  font-size: 1.25em;
}

.markdown-content p {
  margin-bottom: 16px;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-content li {
  margin-bottom: 4px;
}

.markdown-content pre {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-content code {
  font-family: 'Courier New', Monaco, monospace;
  font-size: 85%;
  padding: 0.2em 0.4em;
  margin: 0;
  background: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
  font-size: 100%;
}

.markdown-content blockquote {
  padding: 0 1em;
  margin-bottom: 16px;
  color: var(--text-secondary, #606266);
  border-left: 0.25em solid var(--border-color, #e4e7ed);
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-content table th,
.markdown-content table td {
  padding: 6px 13px;
  border: 1px solid var(--border-color, #e4e7ed);
}

.markdown-content table tr:nth-child(even) {
  background: var(--hover-bg, #f5f7fa);
}

.markdown-content a {
  color: #409eff;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
}

.markdown-content hr {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: var(--border-color, #e4e7ed);
  border: 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}
</style>
