// 主题管理工具

const THEME_KEY = 'app_theme'

export const themeService = {
  // 获取当前主题
  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light'
  },

  // 设置主题
  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme)
    this.applyTheme(theme)
  },

  // 切换主题
  toggleTheme() {
    const currentTheme = this.getTheme()
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
    return newTheme
  },

  // 应用主题到DOM
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme')
    } else {
      document.documentElement.classList.remove('dark-theme')
    }
  },

  // 初始化主题
  initTheme() {
    const theme = this.getTheme()
    this.applyTheme(theme)
    return theme
  }
}
