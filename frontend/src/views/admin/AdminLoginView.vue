<template>
  <div class="admin-login-page">
    <div class="login-card card">
      <div class="login-logo">NOVA CMS</div>
      <h2>管理员登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">账号</label>
          <input v-model="form.username" class="form-input" placeholder="请输入账号" required />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="form.password" type="password" class="form-input" placeholder="请输入密码" required />
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;">{{ loading ? '登录中...' : '登录' }}</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import api from '@/api/axios'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const form = ref({ username: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await api.post('/auth/admin/login', form.value) as any
    auth.setToken(res.accessToken, res.refreshToken)
    localStorage.setItem('nova_admin_role', 'admin')
    toast.success('登录成功')
    router.push('/admin/dashboard')
  } catch (e: any) {
    error.value = e?.response?.data?.message || '账号或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; padding: 24px; }
.login-card { width: 100%; max-width: 400px; text-align: center; }
.login-logo { font-size: 22px; font-weight: 700; letter-spacing: 4px; margin-bottom: 8px; }
.login-card h2 { font-size: 18px; margin-bottom: 24px; }
</style>
