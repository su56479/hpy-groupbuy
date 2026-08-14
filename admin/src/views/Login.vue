<template>
  <div class="login-root">
    <div class="login-card">
      <div class="login-title">
        <el-icon class="title-icon"><Goods /></el-icon>
        <h2>好朋友市集团购商城</h2>
        <p class="subtitle">团长运营后台</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="onSubmit"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入账号"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="onSubmit"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <el-alert
        class="test-tip"
        type="info"
        :closable="false"
        title="测试账号"
      >
        <template #default>
          <div>管理员：admin / admin123</div>
          <div>核销员：verifier / verify123</div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '../api'
import { setAuth } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function onSubmit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await login({ username: form.username, password: form.password })
      const { token, admin } = res.data
      setAuth({
        token,
        role: admin.role,
        username: admin.username
      })
      ElMessage.success('登录成功')
      const redirect = route.query.redirect
      router.replace(redirect && typeof redirect === 'string' ? redirect : '/orders')
    } catch (e) {
      // 错误已在拦截器提示
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-root {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    radial-gradient(circle at 20% 15%, rgba(64,150,255,0.28), rgba(64,150,255,0) 55%),
    radial-gradient(circle at 80% 85%, rgba(22,119,255,0.22), rgba(22,119,255,0) 60%),
    linear-gradient(135deg, #1677FF 0%, #4096FF 100%);
}
.login-card {
  width: 100%;
  max-width: 380px;
  padding: 36px 32px 28px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(22, 119, 255, 0.28);
}
.login-title {
  text-align: center;
  margin-bottom: 24px;
}
.title-icon {
  font-size: 36px;
  color: #1677FF;
  background: linear-gradient(135deg, #1677FF, #4096FF);
  -webkit-background-clip: text;
  background-clip: text;
}
.login-title h2 {
  margin: 8px 0 4px;
  font-size: 20px;
  font-weight: 800;
  color: #1D2129;
  letter-spacing: 0.5px;
}
.subtitle {
  margin: 0;
  color: #4E5969;
  font-size: 13px;
  font-weight: 500;
}
.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 999px !important;
  font-weight: 700 !important;
  font-size: 15px !important;
}
.test-tip {
  margin-top: 8px;
  line-height: 1.6;
  background: #E8F3FF !important;
  border: none !important;
  border-radius: 12px !important;
}
.test-tip :deep(.el-alert__content) {
  font-size: 12px;
  color: #1677FF !important;
}
.test-tip :deep(.el-alert__title) {
  color: #1677FF !important;
  font-weight: 700;
}
@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px 22px;
    border-radius: 16px;
  }
  .login-title h2 { font-size: 18px; }
}
</style>
