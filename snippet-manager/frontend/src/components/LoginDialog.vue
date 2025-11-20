<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isLogin ? '登录' : '注册'"
    width="400px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <el-form-item v-if="!isLogin" label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>

      <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="toggleMode">
          {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
        </el-button>
        <div>
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import authAPI from '../api/auth'
import { authService } from '../utils/auth'

const emit = defineEmits(['login-success', 'close'])

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  defaultMode: {
    type: String,
    default: 'login' // 'login' or 'register'
  }
})

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => {
    if (!val) emit('close')
  }
})

const isLogin = ref(props.defaultMode === 'login')
const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 8) {
    callback(new Error('密码长度至少为8个字符'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (value === '') {
    callback(new Error('请输入邮箱'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const rules = computed(() => ({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 80, message: '用户名长度在3-80个字符之间', trigger: 'blur' }
  ],
  email: !isLogin.value ? [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ] : [],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: !isLogin.value ? [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ] : []
}))

const toggleMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isLogin.value) {
          // 登录
          const response = await authAPI.login({
            username: form.username,
            password: form.password
          })
          handleLoginSuccess(response.data)
        } else {
          // 注册
          const response = await authAPI.register({
            username: form.username,
            email: form.email,
            password: form.password
          })
          handleLoginSuccess(response.data)
        }
      } catch (error) {
        ElMessage.error(error.response?.data?.error || `${isLogin.value ? '登录' : '注册'}失败`)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleLoginSuccess = (data) => {
  // 保存tokens和用户信息
  authService.saveTokens(data.access_token, data.refresh_token)
  authService.saveUser(data.user)

  ElMessage.success(data.message || `${isLogin.value ? '登录' : '注册'}成功`)

  emit('login-success', data.user)
  handleClose()
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
