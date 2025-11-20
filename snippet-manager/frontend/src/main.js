import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

// 按需导入图标
import {
  Document,
  ChatDotRound,
  StarFilled,
  Star,
  View,
  Edit,
  Delete,
  Plus,
  Upload,
  Search,
  CopyDocument,
  Share,
  Download,
  UploadFilled,
  User,
  DocumentCopy
} from '@element-plus/icons-vue'

const app = createApp(App)

// 只注册使用到的图标
const icons = {
  Document,
  ChatDotRound,
  StarFilled,
  Star,
  View,
  Edit,
  Delete,
  Plus,
  Upload,
  Search,
  CopyDocument,
  Share,
  Download,
  UploadFilled,
  User,
  DocumentCopy
}

for (const [key, component] of Object.entries(icons)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.mount('#app')
