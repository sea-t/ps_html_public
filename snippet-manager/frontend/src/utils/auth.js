// Token 管理工具

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user_info'

export const authService = {
  // 保存tokens
  saveTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  // 获取access token
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  // 获取refresh token
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  // 保存用户信息
  saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // 获取用户信息
  getUser() {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  // 检查是否已登录
  isAuthenticated() {
    return !!this.getToken()
  },

  // 登出
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // 清除所有
  clear() {
    localStorage.clear()
  }
}
