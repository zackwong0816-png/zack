<template>
  <div>
    <h3 style="margin-bottom:20px;">系统设置</h3>
    <div class="card" style="max-width:500px;">
      <h4 style="margin-bottom:16px;">修改管理员密码</h4>
      <div class="form-group"><label class="form-label">新密码</label><input v-model="newPassword" type="password" class="form-input" /></div>
      <div class="form-group"><label class="form-label">确认密码</label><input v-model="confirmPassword" type="password" class="form-input" /></div>
      <button class="btn btn-primary" @click="changePassword">保存</button>
      <p v-if="msg" style="margin-top:12px;color:var(--accent);font-size:14px;">{{ msg }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { adminApi } from '@/api'
import { useToast } from '@/composables/useToast'
const newPassword = ref('')
const confirmPassword = ref('')
const msg = ref('')
const toast = useToast()
async function changePassword() {
  if (newPassword.value !== confirmPassword.value) { toast.error('两次密码不一致'); return }
  try { await adminApi.updateSettings({ password: newPassword.value }); msg.value = '密码已修改'; newPassword.value = ''; confirmPassword.value = '' }
  catch { toast.error('修改失败') }
}
</script>