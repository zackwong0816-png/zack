<template>
  <div>
    <h3 style="margin-bottom:20px;">留言管理</h3>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>姓名</th><th>手机号</th><th>类型</th><th>内容</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="m in messages" :key="m.id">
            <td>{{ m.name }}</td>
            <td>{{ m.phone }}</td>
            <td>{{ m.type }}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ m.content }}</td>
            <td><span :class="m.status==='new'?'badge':'badge muted'">{{ m.status==='new'?'新留言':'已回复' }}</span></td>
            <td>{{ m.date?.slice(0,10) }}</td>
            <td><button class="btn btn-sm btn-outline" @click="openReply(m)">回复</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showReply" class="modal-overlay" @click.self="showReply=false">
      <div class="modal card">
        <h3>回复留言</h3>
        <p style="font-size:14px;color:var(--muted);margin-bottom:12px;">{{ replyingTo?.content }}</p>
        <div class="form-group"><textarea v-model="replyText" class="form-textarea" placeholder="输入回复内容..."></textarea></div>
        <div class="modal-actions"><button class="btn btn-outline" @click="showReply=false">取消</button><button class="btn btn-primary" @click="sendReply">发送回复</button></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
const messages = ref<any[]>([])
const showReply = ref(false)
const replyingTo = ref<any>(null)
const replyText = ref('')
onMounted(() => load())
async function load() { messages.value = await adminApi.messages() as any[] }
function openReply(m: any) { replyingTo.value = m; replyText.value = ''; showReply.value = true }
async function sendReply() { await adminApi.replyMessage(replyingTo.value.id, replyText.value); showReply.value = false; load() }
</script>
<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { width:480px; padding:24px; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
.badge.muted { background: var(--surface-2); color: var(--muted); }
</style>