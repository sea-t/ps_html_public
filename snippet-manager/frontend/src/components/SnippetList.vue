<template>
  <div class="snippet-list">
    <el-empty v-if="!loading && snippets.length === 0" description="暂无片段" />

    <div v-loading="loading" class="snippets-grid">
      <el-card
        v-for="snippet in snippets"
        :key="snippet.id"
        class="snippet-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <div class="title-section">
              <el-icon v-if="snippet.snippet_type === 'code'" color="#409EFF">
                <Document />
              </el-icon>
              <el-icon v-else color="#E6A23C">
                <ChatDotRound />
              </el-icon>
              <span class="title">{{ snippet.title }}</span>
            </div>
            <div class="actions">
              <el-button
                :type="snippet.is_favorite ? 'warning' : 'info'"
                size="small"
                circle
                @click="$emit('toggle-favorite', snippet)"
                :title="snippet.is_favorite ? '取消收藏' : '添加收藏'"
              >
                <el-icon>
                  <StarFilled v-if="snippet.is_favorite" />
                  <Star v-else />
                </el-icon>
              </el-button>
              <el-button
                type="primary"
                size="small"
                circle
                @click="$emit('view', snippet)"
              >
                <el-icon><View /></el-icon>
              </el-button>
              <el-button
                type="success"
                size="small"
                circle
                @click="$emit('edit', snippet)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                type="danger"
                size="small"
                circle
                @click="$emit('delete', snippet)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </template>

        <div class="card-content">
          <p v-if="snippet.description" class="description">{{ snippet.description }}</p>
          <div class="meta">
            <el-tag v-if="snippet.language" size="small" type="info">
              {{ snippet.language }}
            </el-tag>
            <el-tag
              v-for="tag in snippet.tags"
              :key="tag"
              size="small"
              style="margin-left: 5px;"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="time">
            更新于: {{ formatDate(snippet.updated_at) }}
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Document, ChatDotRound, View, Edit, Delete, Star, StarFilled } from '@element-plus/icons-vue'

export default {
  name: 'SnippetList',
  components: {
    Document,
    ChatDotRound,
    View,
    Edit,
    Delete,
    Star,
    StarFilled
  },
  props: {
    snippets: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'delete', 'view', 'toggle-favorite'],
  setup() {
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    }

    return {
      formatDate
    }
  }
}
</script>

<style scoped>
.snippet-list {
  min-height: 400px;
}

.snippets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.snippet-card {
  transition: transform 0.2s;
}

.snippet-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.title {
  font-weight: 600;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 5px;
}

.card-content {
  min-height: 100px;
}

.description {
  color: #606266;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  margin: 10px 0;
}

.time {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}
</style>
