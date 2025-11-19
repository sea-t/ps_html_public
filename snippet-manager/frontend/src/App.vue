<template>
  <div id="app">
    <el-container>
      <el-header height="60px">
        <div class="header">
          <h1>
            <el-icon><Document /></el-icon>
            代码片段 & 提示词管理器
          </h1>
          <div class="stats">
            <el-tag type="info">总计: {{ stats.total }}</el-tag>
            <el-tag type="success">代码: {{ stats.code }}</el-tag>
            <el-tag type="warning">提示词: {{ stats.prompt }}</el-tag>
          </div>
        </div>
      </el-header>

      <el-container>
        <el-aside width="300px">
          <Sidebar
            :tags="tags"
            :currentFilter="currentFilter"
            @filter-change="handleFilterChange"
            @add-snippet="showAddDialog"
          />
        </el-aside>

        <el-main>
          <SnippetList
            :snippets="filteredSnippets"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
            @view="handleView"
          />
        </el-main>
      </el-container>
    </el-container>

    <!-- 添加/编辑对话框 -->
    <SnippetDialog
      v-model="dialogVisible"
      :snippet="currentSnippet"
      :mode="dialogMode"
      @save="handleSave"
    />

    <!-- 查看对话框 -->
    <ViewDialog
      v-model="viewDialogVisible"
      :snippet="viewSnippet"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import api from './api/snippets'
import Sidebar from './components/Sidebar.vue'
import SnippetList from './components/SnippetList.vue'
import SnippetDialog from './components/SnippetDialog.vue'
import ViewDialog from './components/ViewDialog.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    SnippetList,
    SnippetDialog,
    ViewDialog,
    Document
  },
  setup() {
    const snippets = ref([])
    const tags = ref([])
    const stats = ref({ total: 0, code: 0, prompt: 0 })
    const loading = ref(false)
    const dialogVisible = ref(false)
    const viewDialogVisible = ref(false)
    const currentSnippet = ref(null)
    const viewSnippet = ref(null)
    const dialogMode = ref('add')
    const currentFilter = ref({ type: 'all', search: '', tag: '' })

    // 加载数据
    const loadSnippets = async () => {
      loading.value = true
      try {
        const response = await api.getSnippets()
        snippets.value = response.data
      } catch (error) {
        ElMessage.error('加载片段失败')
      } finally {
        loading.value = false
      }
    }

    const loadTags = async () => {
      try {
        const response = await api.getTags()
        tags.value = response.data
      } catch (error) {
        console.error('加载标签失败', error)
      }
    }

    const loadStats = async () => {
      try {
        const response = await api.getStats()
        stats.value = response.data
      } catch (error) {
        console.error('加载统计失败', error)
      }
    }

    // 过滤片段
    const filteredSnippets = computed(() => {
      let result = snippets.value

      // 按类型过滤
      if (currentFilter.value.type !== 'all') {
        result = result.filter(s => s.snippet_type === currentFilter.value.type)
      }

      // 搜索过滤
      if (currentFilter.value.search) {
        const search = currentFilter.value.search.toLowerCase()
        result = result.filter(s =>
          s.title.toLowerCase().includes(search) ||
          s.content.toLowerCase().includes(search) ||
          (s.description && s.description.toLowerCase().includes(search))
        )
      }

      // 标签过滤
      if (currentFilter.value.tag) {
        result = result.filter(s => s.tags.includes(currentFilter.value.tag))
      }

      return result
    })

    // 处理过滤变化
    const handleFilterChange = (filter) => {
      currentFilter.value = { ...currentFilter.value, ...filter }
    }

    // 显示添加对话框
    const showAddDialog = (type = 'code') => {
      currentSnippet.value = { snippet_type: type }
      dialogMode.value = 'add'
      dialogVisible.value = true
    }

    // 处理编辑
    const handleEdit = (snippet) => {
      currentSnippet.value = { ...snippet }
      dialogMode.value = 'edit'
      dialogVisible.value = true
    }

    // 处理查看
    const handleView = (snippet) => {
      viewSnippet.value = snippet
      viewDialogVisible.value = true
    }

    // 处理保存
    const handleSave = async (snippetData) => {
      try {
        if (dialogMode.value === 'add') {
          await api.createSnippet(snippetData)
          ElMessage.success('创建成功')
        } else {
          await api.updateSnippet(snippetData.id, snippetData)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        loadSnippets()
        loadTags()
        loadStats()
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }

    // 处理删除
    const handleDelete = async (snippet) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除 "${snippet.title}" 吗?`,
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await api.deleteSnippet(snippet.id)
        ElMessage.success('删除成功')
        loadSnippets()
        loadStats()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    onMounted(() => {
      loadSnippets()
      loadTags()
      loadStats()
    })

    return {
      snippets,
      filteredSnippets,
      tags,
      stats,
      loading,
      dialogVisible,
      viewDialogVisible,
      currentSnippet,
      viewSnippet,
      dialogMode,
      currentFilter,
      handleFilterChange,
      showAddDialog,
      handleEdit,
      handleView,
      handleSave,
      handleDelete
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  height: 100vh;
  overflow: hidden;
}

.el-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats {
  display: flex;
  gap: 10px;
}

.el-aside {
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.el-main {
  padding: 20px;
  background: #ffffff;
  overflow-y: auto;
}
</style>
