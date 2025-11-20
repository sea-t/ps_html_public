<template>
  <el-dialog
    v-model="dialogVisible"
    title="导入/导出片段"
    width="500px"
    @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <!-- 导出选项卡 -->
      <el-tab-pane label="导出" name="export">
        <div class="export-section">
          <el-alert
            title="导出说明"
            type="info"
            :closable="false"
            show-icon
          >
            <p>选择格式导出当前所有片段数据</p>
          </el-alert>

          <div class="export-options">
            <el-button
              type="primary"
              :icon="Document"
              @click="handleExportJSON"
              :loading="exporting"
            >
              导出为 JSON
            </el-button>
            <el-button
              type="success"
              :icon="DocumentCopy"
              @click="handleExportCSV"
              :loading="exporting"
            >
              导出为 CSV
            </el-button>
          </div>

          <div class="export-info">
            <p>当前片段总数: <strong>{{ snippetCount }}</strong></p>
          </div>
        </div>
      </el-tab-pane>

      <!-- 导入选项卡 -->
      <el-tab-pane label="导入" name="import">
        <div class="import-section">
          <el-alert
            title="导入说明"
            type="warning"
            :closable="false"
            show-icon
          >
            <p>仅支持JSON格式文件，导入的片段将添加到现有数据中</p>
          </el-alert>

          <el-upload
            class="upload-area"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept=".json"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将JSON文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                仅支持 .json 格式文件
              </div>
            </template>
          </el-upload>

          <div v-if="selectedFile" class="file-info">
            <p><strong>已选择文件:</strong> {{ selectedFile.name }}</p>
            <el-button
              type="primary"
              @click="handleImport"
              :loading="importing"
            >
              开始导入
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, DocumentCopy, UploadFilled } from '@element-plus/icons-vue'
import { exportToJSON, exportToCSV, importFromJSON } from '../utils/export'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  snippets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'import-success'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const activeTab = ref('export')
const exporting = ref(false)
const importing = ref(false)
const selectedFile = ref(null)

const snippetCount = computed(() => props.snippets.length)

// 处理导出JSON
const handleExportJSON = async () => {
  try {
    exporting.value = true
    exportToJSON(props.snippets)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  } finally {
    exporting.value = false
  }
}

// 处理导出CSV
const handleExportCSV = async () => {
  try {
    exporting.value = true
    exportToCSV(props.snippets)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  } finally {
    exporting.value = false
  }
}

// 处理文件选择
const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

// 处理导入
const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  try {
    importing.value = true
    const data = await importFromJSON(selectedFile.value)

    ElMessage.success(`成功导入 ${data.length} 个片段`)
    emit('import-success', data)
    handleClose()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    importing.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  selectedFile.value = null
  activeTab.value = 'export'
  emit('update:visible', false)
}
</script>

<style scoped>
.export-section,
.import-section {
  padding: 20px 0;
}

.export-options {
  margin: 20px 0;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.export-info {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
}

.upload-area {
  margin-top: 20px;
}

.file-info {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  text-align: center;
}

.file-info p {
  margin-bottom: 15px;
}

.el-icon--upload {
  font-size: 67px;
  color: #409eff;
  margin: 20px 0;
}

.el-upload__text {
  font-size: 14px;
  color: #606266;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}
</style>
