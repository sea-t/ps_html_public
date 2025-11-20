import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },

  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },

    // 优化的代码分割策略
    rollupOptions: {
      output: {
        // 更精细的 chunk 分割
        manualChunks: (id) => {
          // Element Plus 完整库（避免分割导致初始化顺序问题）
          if (id.includes('node_modules/element-plus')) {
            return 'element-plus'
          }

          // Element Plus 图标
          if (id.includes('@element-plus/icons-vue')) {
            return 'element-icons'
          }

          // 其他第三方库
          if (id.includes('node_modules/axios')) {
            return 'axios'
          }

          if (id.includes('node_modules/highlight.js')) {
            return 'highlight'
          }

          if (id.includes('node_modules/marked')) {
            return 'markdown'
          }

          if (id.includes('node_modules/dompurify')) {
            return 'dompurify'
          }

          // 其他 node_modules
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },

        // 输出文件命名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },

    // 增大 chunk 警告阈值
    chunkSizeWarningLimit: 600,

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 优化依赖预构建
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'axios',
      'element-plus',
      '@element-plus/icons-vue',
      'highlight.js',
      'marked',
      'dompurify'
    ]
  }
})
