<template>
  <div class="sidebar">
    <div class="add-buttons">
      <el-button type="primary" @click="$emit('add-snippet', 'code')" style="width: 100%">
        <el-icon><Plus /></el-icon>
        添加代码片段
      </el-button>
      <el-button type="warning" @click="$emit('add-snippet', 'prompt')" style="width: 100%; margin-top: 10px;">
        <el-icon><Plus /></el-icon>
        添加提示词
      </el-button>
      <el-button type="success" @click="$emit('import-export')" style="width: 100%; margin-top: 10px;">
        <el-icon><Upload /></el-icon>
        导入/导出
      </el-button>
    </div>

    <el-divider />

    <div class="filter-section">
      <h3>类型过滤</h3>
      <el-radio-group v-model="localFilter.type" @change="emitFilter" class="type-filter">
        <el-radio label="all">全部</el-radio>
        <el-radio label="code">代码片段</el-radio>
        <el-radio label="prompt">提示词</el-radio>
        <el-radio label="favorite">收藏夹</el-radio>
      </el-radio-group>
    </div>

    <el-divider />

    <div class="filter-section">
      <h3>搜索</h3>
      <el-input
        v-model="localFilter.search"
        placeholder="搜索标题或内容..."
        @input="emitFilter"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <el-divider />

    <div class="filter-section">
      <h3>标签</h3>
      <div class="tags-list">
        <el-tag
          v-for="tag in tags"
          :key="tag"
          :type="localFilter.tag === tag ? 'primary' : 'info'"
          style="cursor: pointer; margin: 5px;"
          @click="selectTag(tag)"
        >
          {{ tag }}
        </el-tag>
        <el-tag
          v-if="localFilter.tag"
          type="danger"
          style="cursor: pointer; margin: 5px;"
          @click="clearTag"
        >
          清除标签
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { Plus, Search, Upload } from '@element-plus/icons-vue'

export default {
  name: 'Sidebar',
  components: {
    Plus,
    Search,
    Upload
  },
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    currentFilter: {
      type: Object,
      default: () => ({ type: 'all', search: '', tag: '' })
    }
  },
  emits: ['filter-change', 'add-snippet', 'import-export'],
  setup(props, { emit }) {
    const localFilter = ref({ ...props.currentFilter })

    const emitFilter = () => {
      emit('filter-change', localFilter.value)
    }

    const selectTag = (tag) => {
      localFilter.value.tag = tag
      emitFilter()
    }

    const clearTag = () => {
      localFilter.value.tag = ''
      emitFilter()
    }

    return {
      localFilter,
      emitFilter,
      selectTag,
      clearTag
    }
  }
}
</script>

<style scoped>
.sidebar {
  padding: 20px;
}

.add-buttons {
  margin-bottom: 20px;
}

.filter-section {
  margin: 15px 0;
}

.filter-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 10px;
}

.type-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
}
</style>
