import axios from 'axios'

// 使用相对路径，由 Nginx 代理到后端
const API_URL = ''

const authAPI = {
  // 注册
  register(userData) {
    return axios.post(`${API_URL}/api/auth/register`, userData)
  },

  // 登录
  login(credentials) {
    return axios.post(`${API_URL}/api/auth/login`, credentials)
  },

  // 刷新token
  refreshToken(refreshToken) {
    return axios.post(`${API_URL}/api/auth/refresh`, null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    })
  },

  // 获取当前用户信息
  getCurrentUser(token) {
    return axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}

export default authAPI
