<template>
  <div>
    <div class="page-header flex justify-between items-center">
      <h3>内容管理</h3>
      <button class="btn btn-primary" @click="openForm()">新建文章</button>
    </div>

    <div class="filters card" style="margin:20px 0;padding:16px;">
      <input v-model="keyword" class="form-input" placeholder="搜索文章标题..." style="max-width:300px;display:inline-block;margin-right:12px;" @keyup.enter="loadData" />
      <button class="btn btn-outline btn-sm" @click="loadData">搜索</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead><tr><th>标题</th><th>摘要</th><th>状态</th><th>浏览</th><th>创建时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="a in articles" :key="a._id">
            <td>{{ a.title }}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ a.summary || '—' }}</td>
            <td><span :class="a.status === 'published' ? 'badge' : 'badge muted'">{{ a.status === 'published' ? '已发布' : '草稿' }}</span></td>
            <td>{{ a.views }}</td>
            <td>{{ new Date(a.createdAt).toLocaleDateString('zh-CN') }}</td>
            <td>
              <button class="btn btn-sm btn-outline" @click="openForm(a)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(a._id)" style="margin-left:8px;">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!articles.length" class="text-center text-muted" style="padding:40px;">暂无数据</div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal card">
        <h3 style="margin-bottom:20px;">{{ editingId ? '编辑文章' : '新建文章' }}</h3>
        <div class="form-group"><label class="form-label">标题 *</label><input v-model="form.title" class="form-input" /></div>
        <div class="form-group"><label class="form-label">摘要</label><input v-model="form.summary" class="form-input" /></div>
        <div class="form-group"><label class="form-label">封面图 URL</label><input v-model="form.coverImage" class="form-input" placeholder="https://..." /></div>
        <div class="form-group"><label class="form-label">内容</label><textarea v-model="form.content" class="form-textarea" rows="6"></textarea></div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">状态</label>
            <select v-model="form.status" class="form-input">
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showForm=false">取消</button>
          <button class="btn btn-primary" @click="handleSave">{{ editingId ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/api/axios'

const articles = ref<any[]>([])
const keyword = ref('')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ title:'', summary:'', coverImage:'', content:'', status:'published' })

onMounted(() => { loadData() })

async function loadData() {
  const res = await axios.get('/admin/articles')
  articles.value = res.data
}

function openForm(a?: any) {
  if (a) {
    editingId.value = a._id
    form.value = { title: a.title, summary: a.summary || '', coverImage: a.coverImage || '', content: a.content || '', status: a.status || 'published' }
  } else {
    editingId.value = null
    form.value = { title:'', summary:'', coverImage:'', content:'', status:'published' }
  }
  showForm.value = true
}

async function handleSave() {
  if (!form.value.title) return
  if (editingId.value) {
    await axios.put(`/admin/articles/${editingId.value}`, form.value)
  } else {
    await axios.post('/admin/articles', form.value)
  }
  showForm.value = false
  loadData()
}

async function handleDelete(id: string) {
  if (!confirm('确定删除？')) return
  await axios.delete(`/admin/articles/${id}`)
  loadData()
}
</script>

<style scoped>
.filters input { vertical-align: middle; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { width: 560px; max-height: 90vh; overflow-y: auto; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.badge.muted { background: var(--surface-2); color: var(--muted); }
</style>
