<template>
  <el-dialog
    v-model="dialogVisible"
    :title="mode === 'add' ? '添加片段' : '编辑片段'"
    width="70%"
    @close="handleClose"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="类型">
        <el-radio-group v-model="form.snippet_type">
          <el-radio label="code">代码片段</el-radio>
          <el-radio label="prompt">提示词</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="输入标题..." />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="输入描述..."
        />
      </el-form-item>

      <el-form-item v-if="form.snippet_type === 'code'" label="编程语言">
        <el-select v-model="form.language" placeholder="选择语言">
          <el-option label="JavaScript" value="javascript" />
          <el-option label="Python" value="python" />
          <el-option label="Java" value="java" />
          <el-option label="C++" value="cpp" />
          <el-option label="Go" value="go" />
          <el-option label="Rust" value="rust" />
          <el-option label="TypeScript" value="typescript" />
          <el-option label="HTML" value="html" />
          <el-option label="CSS" value="css" />
          <el-option label="SQL" value="sql" />
          <el-option label="Bash" value="bash" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="内容" required>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="15"
          placeholder="输入内容..."
          style="font-family: 'Courier New', monospace;"
        />
      </el-form-item>

      <el-form-item label="标签">
        <el-tag
          v-for="tag in form.tags"
          :key="tag"
          closable
          @close="removeTag(tag)"
          style="margin-right: 10px;"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="inputRef"
          v-model="inputValue"
          size="small"
          style="width: 100px;"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else size="small" @click="showInput">+ 添加标签</el-button>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, nextTick } from 'vue'

export default {
  name: 'SnippetDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    snippet: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'add'
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const dialogVisible = ref(props.modelValue)
    const form = ref({
      title: '',
      content: '',
      description: '',
      snippet_type: 'code',
      language: '',
      tags: []
    })
    const inputVisible = ref(false)
    const inputValue = ref('')
    const inputRef = ref(null)

    // 监听对话框显示状态
    watch(() => props.modelValue, (val) => {
      dialogVisible.value = val
      if (val && props.snippet) {
        form.value = {
          ...props.snippet,
          tags: Array.isArray(props.snippet.tags) ? [...props.snippet.tags] : []
        }
      } else if (val) {
        form.value = {
          title: '',
          content: '',
          description: '',
          snippet_type: props.snippet?.snippet_type || 'code',
          language: '',
          tags: []
        }
      }
    })

    watch(dialogVisible, (val) => {
      emit('update:modelValue', val)
    })

    const handleClose = () => {
      dialogVisible.value = false
    }

    const handleSave = () => {
      if (!form.value.title || !form.value.content) {
        return
      }
      emit('save', form.value)
    }

    const removeTag = (tag) => {
      form.value.tags = form.value.tags.filter(t => t !== tag)
    }

    const showInput = () => {
      inputVisible.value = true
      nextTick(() => {
        inputRef.value?.focus()
      })
    }

    const handleInputConfirm = () => {
      if (inputValue.value && !form.value.tags.includes(inputValue.value)) {
        form.value.tags.push(inputValue.value)
      }
      inputVisible.value = false
      inputValue.value = ''
    }

    return {
      dialogVisible,
      form,
      inputVisible,
      inputValue,
      inputRef,
      handleClose,
      handleSave,
      removeTag,
      showInput,
      handleInputConfirm
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin-right: 10px;
}
</style>
