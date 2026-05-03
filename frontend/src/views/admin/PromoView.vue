<template>
  <div>
    <div class="page-header flex justify-between items-center">
      <h3>促销管理</h3>
      <button class="btn btn-primary" @click="openForm()">新建促销</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead><tr><th>名称</th><th>类型</th><th>状态</th><th>开始日期</th><th>结束日期</th><th>浏览</th><th>销量</th><th>销售额</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="p in promos" :key="p._id">
            <td>{{ p.name }}</td>
            <td><span class="badge">{{ typeMap[p.type] || p.type }}</span></td>
            <td><span :class="statusClass(p.status)">{{ statusMap[p.status] || p.status }}</span></td>
            <td>{{ p.startDate ? new Date(p.startDate).toLocaleDateString('zh-CN') : '—' }}</td>
            <td>{{ p.endDate ? new Date(p.endDate).toLocaleDateString('zh-CN') : '—' }}</td>
            <td>{{ p.views }}</td>
            <td>{{ p.orders }}</td>
            <td>¥{{ p.sales }}</td>
            <td>
              <button class="btn btn-sm btn-outline" @click="openForm(p)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(p._id)" style="margin-left:8px;">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!promos.length" class="text-center text-muted" style="padding:40px;">暂无数据</div>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal card">
        <h3 style="margin-bottom:20px;">{{ editingId ? '编辑促销' : '新建促销' }}</h3>
        <div class="form-group"><label class="form-label">名称 *</label><input v-model="form.name" class="form-input" /></div>
        <div class="form-group"><label class="form-label">描述</label><textarea v-model="form.desc" class="form-textarea" rows="2"></textarea></div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">类型</label>
            <select v-model="form.type" class="form-input">
              <option value="discount">满减</option>
              <option value="coupon">优惠券</option>
              <option value="flash">秒杀</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">状态</label>
            <select v-model="form.status" class="form-input">
              <option value="upcoming">未开始</option>
              <option value="active">进行中</option>
              <option value="ended">已结束</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">开始日期</label><input v-model="form.startDate" type="date" class="form-input" /></div>
          <div class="form-group"><label class="form-label">结束日期</label><input v-model="form.endDate" type="date" class="form-input" /></div>
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

const promos = ref<any[]>([])
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name:'', desc:'', type:'discount', status:'upcoming', startDate:'', endDate:'' })

const typeMap: Record<string,string> = { discount:'满减', coupon:'优惠券', flash:'秒杀' }
const statusMap: Record<string,string> = { upcoming:'未开始', active:'进行中', ended:'已结束' }

function statusClass(s: string) {
  if (s === 'active') return 'badge'
  if (s === 'ended') return 'badge muted'
  return 'badge muted'
}

onMounted(() => { loadData() })

async function loadData() {
  const res = await axios.get('/admin/promos')
  promos.value = res.data
}

function openForm(p?: any) {
  if (p) {
    editingId.value = p._id
    form.value = {
      name: p.name, desc: p.desc || '', type: p.type || 'discount',
      status: p.status || 'upcoming',
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
    }
  } else {
    editingId.value = null
    form.value = { name:'', desc:'', type:'discount', status:'upcoming', startDate:'', endDate:'' }
  }
  showForm.value = true
}

async function handleSave() {
  if (!form.value.name) return
  const payload = {
    ...form.value,
    startDate: form.value.startDate ? new Date(form.value.startDate) : undefined,
    endDate: form.value.endDate ? new Date(form.value.endDate) : undefined,
  }
  if (editingId.value) {
    await axios.put(`/admin/promos/${editingId.value}`, payload)
  } else {
    await axios.post('/admin/promos', payload)
  }
  showForm.value = false
  loadData()
}

async function handleDelete(id: string) {
  if (!confirm('确定删除？')) return
  await axios.delete(`/admin/promos/${id}`)
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
