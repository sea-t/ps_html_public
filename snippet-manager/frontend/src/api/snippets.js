import axios from 'axios'
import { authService } from '../utils/auth'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加JWT token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理401错误
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除认证信息并重新登录
      authService.logout()
      // 触发登录事件（由App.vue处理）
      window.dispatchEvent(new CustomEvent('auth-expired'))
    }
    return Promise.reject(error)
  }
)

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

  // 切换收藏状态
  toggleFavorite(id) {
    return api.patch(`/snippets/${id}/favorite`)
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
