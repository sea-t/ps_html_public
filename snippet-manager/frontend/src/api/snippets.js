import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  // 获取所有片段
  getSnippets(params = {}) {
    return api.get('/snippets', { params })
  },

  // 获取单个片段
  getSnippet(id) {
    return api.get(`/snippets/${id}`)
  },

  // 创建片段
  createSnippet(data) {
    return api.post('/snippets', data)
  },

  // 更新片段
  updateSnippet(id, data) {
    return api.put(`/snippets/${id}`, data)
  },

  // 删除片段
  deleteSnippet(id) {
    return api.delete(`/snippets/${id}`)
  },

  // 获取所有标签
  getTags() {
    return api.get('/tags')
  },

  // 获取统计信息
  getStats() {
    return api.get('/stats')
  }
}
