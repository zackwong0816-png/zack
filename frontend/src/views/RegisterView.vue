<template>
  <div class="auth-page">
    <div class="auth-card card">
      <div class="auth-logo">NOVA</div>
      <h2>注册</h2>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input v-model="form.phone" type="tel" class="form-input" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="form.password" type="password" class="form-input" placeholder="至少6位" required minlength="6" />
        </div>
        <div class="form-group">
          <label class="form-label">昵称（选填）</label>
          <input v-model="form.nickname" type="text" class="form-input" placeholder="默认使用用户+手机尾号" />
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-lg" style="width:100%;" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <p class="auth-switch">
          已有账号？<RouterLink to="/login">立即登录</RouterLink>
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

const form = ref({ phone: '', password: '', nickname: '' })
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    error.value = '请输入有效手机号'
    return
  }
  loading.value = true
  try {
    await auth.register(form.value)
    toast.success('注册成功')
    router.push('/member')
  } catch (e: any) {
    error.value = e?.response?.data?.message || '注册失败，请重试'
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
