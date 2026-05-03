<template>
  <div>
    <div class="page-header flex justify-between items-center">
      <h3>门店管理</h3>
      <button class="btn btn-primary" @click="openForm()">新增门店</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead><tr><th>名称</th><th>城市</th><th>地址</th><th>电话</th><th>营业时间</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="s in stores" :key="s._id">
            <td>{{ s.name }}</td>
            <td>{{ s.city }}</td>
            <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ s.address }}</td>
            <td>{{ s.phone || '—' }}</td>
            <td>{{ s.hours || '—' }}</td>
            <td><span :class="s.active !== false ? 'badge' : 'badge muted'">{{ s.active !== false ? '营业中' : '已关闭' }}</span></td>
            <td>
              <button class="btn btn-sm btn-outline" @click="openForm(s)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(s._id)" style="margin-left:8px;">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!stores.length" class="text-center text-muted" style="padding:40px;">暂无数据</div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal card">
        <h3 style="margin-bottom:20px;">{{ editingId ? '编辑门店' : '新增门店' }}</h3>
        <div class="form-group"><label class="form-label">名称 *</label><input v-model="form.name" class="form-input" /></div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">城市</label><input v-model="form.city" class="form-input" placeholder="如：北京市" /></div>
          <div class="form-group"><label class="form-label">电话</label><input v-model="form.phone" class="form-input" /></div>
        </div>
        <div class="form-group"><label class="form-label">地址 *</label><input v-model="form.address" class="form-input" /></div>
        <div class="form-group"><label class="form-label">营业时间</label><input v-model="form.hours" class="form-input" placeholder="如：10:00-22:00" /></div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">经度</label><input v-model.number="form.lng" type="number" step="0.0001" class="form-input" /></div>
          <div class="form-group"><label class="form-label">纬度</label><input v-model.number="form.lat" type="number" step="0.0001" class="form-input" /></div>
        </div>
        <div class="form-group"><label class="form-label">状态</label>
          <select v-model="form.active" class="form-input">
            <option :value="true">营业中</option>
            <option :value="false">已关闭</option>
          </select>
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

const stores = ref<any[]>([])
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name:'', address:'', phone:'', hours:'', city:'北京市', lat:0, lng:0, active:true })

onMounted(() => { loadData() })

async function loadData() {
  const res = await axios.get('/admin/stores')
  stores.value = res.data
}

function openForm(s?: any) {
  if (s) {
    editingId.value = s._id
    form.value = { name: s.name, address: s.address, phone: s.phone || '', hours: s.hours || '', city: s.city || '北京市', lat: s.lat || 0, lng: s.lng || 0, active: s.active !== false }
  } else {
    editingId.value = null
    form.value = { name:'', address:'', phone:'', hours:'', city:'北京市', lat:0, lng:0, active:true }
  }
  showForm.value = true
}

async function handleSave() {
  if (!form.value.name || !form.value.address) return
  if (editingId.value) {
    await axios.put(`/admin/stores/${editingId.value}`, form.value)
  } else {
    await axios.post('/admin/stores', form.value)
  }
  showForm.value = false
  loadData()
}

async function handleDelete(id: string) {
  if (!confirm('确定删除？')) return
  await axios.delete(`/admin/stores/${id}`)
  loadData()
}
</script>

<style scoped>
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { width: 560px; max-height: 90vh; overflow-y: auto; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.badge.muted { background: var(--surface-2); color: var(--muted); }
</style>
