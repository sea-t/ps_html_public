<template>
  <div id="app">
    <!-- 登录对话框 -->
    <LoginDialog
      :visible="loginDialogVisible"
      :defaultMode="loginMode"
      @login-success="handleLoginSuccess"
      @close="loginDialogVisible = false"
    />

    <el-container v-if="currentUser">
      <el-header height="60px">
        <div class="header">
          <h1>
            <el-icon><Document /></el-icon>
            代码片段 & 提示词管理器
          </h1>
          <div class="header-right">
            <div class="stats">
              <el-tag type="info">总计: {{ stats.total }}</el-tag>
              <el-tag type="success">代码: {{ stats.code }}</el-tag>
              <el-tag type="warning">提示词: {{ stats.prompt }}</el-tag>
              <el-tag type="danger">收藏: {{ stats.favorite }}</el-tag>
            </div>
            <el-button
              class="theme-toggle-btn"
              :icon="isDarkTheme ? Sunny : Moon"
              circle
              @click="toggleTheme"
              :title="isDarkTheme ? '切换到亮色主题' : '切换到暗色主题'"
            />
            <div class="user-info">
              <el-dropdown>
                <span class="user-name">
                  <el-icon><User /></el-icon>
                  {{ currentUser.username }}
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item disabled>{{ currentUser.email }}</el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">
                      <el-icon><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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
            @import-export="showImportExport"
          />
        </el-aside>

        <el-main>
          <SnippetList
            :snippets="filteredSnippets"
            :loading="loading"
            @edit="handleEdit"
            @delete="handleDelete"
            @view="handleView"
            @toggle-favorite="handleToggleFavorite"
          />
        </el-main>
      </el-container>
    </el-container>

    <!-- 未登录状态的欢迎页面 -->
    <div v-else class="welcome-page">
      <div class="welcome-content">
        <el-icon class="welcome-icon"><Document /></el-icon>
        <h1>代码片段 & 提示词管理器</h1>
        <p>集中管理您的代码片段和AI提示词</p>
        <div class="welcome-actions">
          <el-button type="primary" size="large" @click="showLogin">登录</el-button>
          <el-button size="large" @click="showRegister">注册</el-button>
        </div>
      </div>
    </div>

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

    <!-- 导入/导出对话框 -->
    <ImportExportDialog
      v-model:visible="importExportDialogVisible"
      :snippets="snippets"
      @import-success="handleImportSuccess"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, User, SwitchButton, Moon, Sunny } from '@element-plus/icons-vue'
import api from './api/snippets'
import { authService } from './utils/auth'
import { themeService } from './utils/theme'
import Sidebar from './components/Sidebar.vue'
import SnippetList from './components/SnippetList.vue'
import SnippetDialog from './components/SnippetDialog.vue'
import ViewDialog from './components/ViewDialog.vue'
import LoginDialog from './components/LoginDialog.vue'
import ImportExportDialog from './components/ImportExportDialog.vue'

export default {
  name: 'App',
  components: {
    Sidebar,
    SnippetList,
    SnippetDialog,
    ViewDialog,
    LoginDialog,
    ImportExportDialog,
    Document,
    User,
    SwitchButton,
    Moon,
    Sunny
  },
  setup() {
    const snippets = ref([])
    const tags = ref([])
    const stats = ref({ total: 0, code: 0, prompt: 0, favorite: 0 })
    const loading = ref(false)
    const dialogVisible = ref(false)
    const viewDialogVisible = ref(false)
    const loginDialogVisible = ref(false)
    const importExportDialogVisible = ref(false)
    const loginMode = ref('login')
    const currentSnippet = ref(null)
    const viewSnippet = ref(null)
    const dialogMode = ref('add')
    const currentFilter = ref({ type: 'all', search: '', tag: '' })
    const currentUser = ref(null)
    const isDarkTheme = ref(false)

    // 检查登录状态
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        currentUser.value = authService.getUser()
        return true
      }
      return false
    }

    // 显示登录对话框
    const showLogin = () => {
      loginMode.value = 'login'
      loginDialogVisible.value = true
    }

    // 显示注册对话框
    const showRegister = () => {
      loginMode.value = 'register'
      loginDialogVisible.value = true
    }

    // 处理登录成功
    const handleLoginSuccess = (user) => {
      currentUser.value = user
      ElMessage.success('欢迎回来！')
      loadSnippets()
      loadTags()
      loadStats()
    }

    // 处理退出登录
    const handleLogout = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '确认退出',
          {
            confirmButtonText: '退出',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        authService.logout()
        currentUser.value = null
        snippets.value = []
        tags.value = []
        stats.value = { total: 0, code: 0, prompt: 0, favorite: 0 }
        ElMessage.success('已退出登录')
      } catch (error) {
        // 用户取消
      }
    }

    // 处理token过期
    const handleAuthExpired = () => {
      ElMessage.warning('登录已过期，请重新登录')
      currentUser.value = null
      loginDialogVisible.value = true
    }

    // 加载数据
    const loadSnippets = async () => {
      if (!authService.isAuthenticated()) return

      loading.value = true
      try {
        const response = await api.getSnippets()
        snippets.value = response.data
      } catch (error) {
        if (error.response?.status !== 401) {
          ElMessage.error('加载片段失败')
        }
      } finally {
        loading.value = false
      }
    }

    const loadTags = async () => {
      if (!authService.isAuthenticated()) return

      try {
        const response = await api.getTags()
        tags.value = response.data
      } catch (error) {
        console.error('加载标签失败', error)
      }
    }

    const loadStats = async () => {
      if (!authService.isAuthenticated()) return

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
      if (currentFilter.value.type === 'favorite') {
        result = result.filter(s => s.is_favorite)
      } else if (currentFilter.value.type !== 'all') {
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

    // 切换收藏
    const handleToggleFavorite = async (snippet) => {
      try {
        await api.toggleFavorite(snippet.id)
        ElMessage.success(snippet.is_favorite ? '已取消收藏' : '已添加收藏')
        loadSnippets()
        loadStats()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    // 切换主题
    const toggleTheme = () => {
      const newTheme = themeService.toggleTheme()
      isDarkTheme.value = newTheme === 'dark'
    }

    // 显示导入/导出对话框
    const showImportExport = () => {
      importExportDialogVisible.value = true
    }

    // 处理导入成功
    const handleImportSuccess = async (data) => {
      try {
        let successCount = 0
        let errorCount = 0

        for (const item of data) {
          try {
            await api.createSnippet(item)
            successCount++
          } catch (error) {
            errorCount++
            console.error('导入片段失败:', error)
          }
        }

        if (successCount > 0) {
          ElMessage.success(`成功导入 ${successCount} 个片段${errorCount > 0 ? `，${errorCount} 个失败` : ''}`)
          loadSnippets()
          loadTags()
          loadStats()
        } else {
          ElMessage.error('导入失败')
        }
      } catch (error) {
        ElMessage.error('导入失败: ' + error.message)
      }
    }

    onMounted(() => {
      // 初始化主题
      const theme = themeService.initTheme()
      isDarkTheme.value = theme === 'dark'

      // 检查登录状态
      if (checkAuth()) {
        loadSnippets()
        loadTags()
        loadStats()
      }

      // 监听token过期事件
      window.addEventListener('auth-expired', handleAuthExpired)
    })

    onUnmounted(() => {
      window.removeEventListener('auth-expired', handleAuthExpired)
    })

    return {
      snippets,
      filteredSnippets,
      tags,
      stats,
      loading,
      dialogVisible,
      viewDialogVisible,
      loginDialogVisible,
      importExportDialogVisible,
      loginMode,
      currentSnippet,
      viewSnippet,
      dialogMode,
      currentFilter,
      currentUser,
      isDarkTheme,
      handleFilterChange,
      showAddDialog,
      showLogin,
      showRegister,
      showImportExport,
      handleLoginSuccess,
      handleLogout,
      handleEdit,
      handleView,
      handleSave,
      handleDelete,
      handleToggleFavorite,
      handleImportSuccess,
      toggleTheme,
      Moon,
      Sunny
    }
  }
}
</script>

<style>
:root {
  /* 亮色主题变量 */
  --bg-color: #ffffff;
  --bg-secondary: #f5f7fa;
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-tertiary: #909399;
  --border-color: #e4e7ed;
  --hover-bg: #f5f7fa;
  --gradient-start: #667eea;
  --gradient-end: #764ba2;
}

.dark-theme {
  /* 暗色主题变量 */
  --bg-color: #1a1a1a;
  --bg-secondary: #2c2c2c;
  --text-primary: #e0e0e0;
  --text-secondary: #b0b0b0;
  --text-tertiary: #808080;
  --border-color: #404040;
  --hover-bg: #3a3a3a;
  --gradient-start: #4a5ba8;
  --gradient-end: #5a3b72;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-color);
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
}

.el-header {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
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

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stats {
  display: flex;
  gap: 10px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-name:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.el-aside {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
}

.el-main {
  padding: 20px;
  background: var(--bg-color);
  overflow-y: auto;
}

.theme-toggle-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  transition: all 0.3s;
}

.theme-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.1);
}

/* 欢迎页面样式 */
.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
}

.welcome-content {
  text-align: center;
  color: white;
  padding: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.9;
}

.welcome-content h1 {
  font-size: 36px;
  margin-bottom: 16px;
  font-weight: 700;
}

.welcome-content p {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.welcome-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
</style>
