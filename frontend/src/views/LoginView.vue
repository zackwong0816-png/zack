<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">NOVA</div>
      <h2>登录</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input v-model="form.phone" type="tel" class="form-input" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="form.password" type="password" class="form-input" placeholder="请输入密码" required />
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p class="auth-switch">
          还没有账号？<RouterLink to="/register">立即注册</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const form = ref({ phone: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form.value.phone, form.value.password)
    toast.success('登录成功')
    router.push('/member')
  } catch (e: any) {
    error.value = e?.response?.data?.message || '手机号或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at center, #1e1e1e 0%, #0a0a0a 70%); padding: 24px;
}
.auth-card { width: 100%; max-width: 400px; text-align: center; }
.auth-logo { font-size: 28px; font-weight: 700; letter-spacing: 6px; margin-bottom: 24px; }
.auth-card h2 { margin-bottom: 24px; font-size: 20px; }
.auth-form { text-align: left; }
.auth-switch { margin-top: 16px; text-align: center; font-size: 14px; color: var(--muted); }
.auth-switch a { color: var(--accent); }
</style>
