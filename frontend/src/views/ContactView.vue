<template>
  <div class="contact-page">
    <header class="topnav">
      <div class="container topnav-inner">
        <a href="/" class="logo">NOVA</a>
      </div>
    </header>
    <div class="container" style="padding:60px 24px;max-width:800px;">
      <h1 style="font-family:var(--font-display);font-size:36px;margin-bottom:32px;text-align:center;">联系我们</h1>
      <form class="card" @submit.prevent="submitForm" style="max-width:600px;margin:0 auto;">
        <div class="form-group"><label class="form-label">姓名 *</label><input v-model="form.name" class="form-input" required /></div>
        <div class="form-group"><label class="form-label">手机号 *</label><input v-model="form.phone" type="tel" class="form-input" required /></div>
        <div class="form-group"><label class="form-label">邮箱</label><input v-model="form.email" type="email" class="form-input" /></div>
        <div class="form-group"><label class="form-label">留言内容 *</label><textarea v-model="form.content" class="form-textarea" required></textarea></div>
        <button type="submit" class="btn btn-primary" style="width:100%;">{{ submitting ? '提交中...' : '提交留言' }}</button>
        <p v-if="done" style="margin-top:12px;text-align:center;color:var(--accent);">留言已提交，我们会尽快回复！</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import api from '@/api/axios'
const form = ref({ name: '', phone: '', email: '', content: '' })
const submitting = ref(false)
const done = ref(false)
const toast = useToast()
async function submitForm() {
  if (!form.value.name || !form.value.phone || !form.value.content) return
  submitting.value = true
  try {
    await api.post('/messages', form.value)
    done.value = true
    form.value = { name: '', phone: '', email: '', content: '' }
  } catch { toast.error('提交失败') }
  finally { submitting.value = false }
}
</script>
