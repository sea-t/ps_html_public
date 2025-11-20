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
          <el-button
            type="primary"
            size="small"
            @click="copyContent"
          >
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </div>
        <pre class="content-display"><code :class="'language-' + snippet.language">{{ snippet.content }}</code></pre>
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
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

export default {
  name: 'ViewDialog',
  components: {
    CopyDocument
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

    watch(() => props.modelValue, (val) => {
      dialogVisible.value = val
      if (val && props.snippet) {
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

    return {
      dialogVisible,
      handleClose,
      copyContent,
      formatDate
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
</style>
