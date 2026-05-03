<template>
  <div>
    <div class="page-header flex justify-between items-center">
      <h3>产品管理</h3>
      <button class="btn btn-primary" @click="openForm()">新增产品</button>
    </div>

    <div class="filters card" style="margin:20px 0;padding:16px;">
      <input v-model="keyword" class="form-input" placeholder="搜索产品名称..." style="max-width:300px;display:inline-block;margin-right:12px;" @keyup.enter="loadData" />
      <button class="btn btn-outline btn-sm" @click="loadData">搜索</button>
    </div>

    <div class="card">
      <table class="data-table">
        <thead><tr><th>名称</th><th>分类</th><th>价格</th><th>库存</th><th>销量</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.categoryName }}</td>
            <td>¥{{ p.price }}</td>
            <td>{{ p.stock }}</td>
            <td>{{ p.sales }}</td>
            <td><span :class="p.status === 'active' ? 'badge' : 'badge muted'">{{ p.status === 'active' ? '上架' : '下架' }}</span></td>
            <td>
              <button class="btn btn-sm btn-outline" @click="openForm(p)">编辑</button>
              <button class="btn btn-sm btn-danger" @click="handleDelete(p.id)" style="margin-left:8px;">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!products.length" class="text-center text-muted" style="padding:40px;">暂无数据</div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal card">
        <h3 style="margin-bottom:20px;">{{ editingId ? '编辑产品' : '新增产品' }}</h3>
        <div class="form-group"><label class="form-label">产品名称 *</label><input v-model="form.name" class="form-input" /></div>
        <div class="form-group"><label class="form-label">描述</label><textarea v-model="form.desc" class="form-textarea"></textarea></div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">价格 *</label><input v-model.number="form.price" type="number" class="form-input" /></div>
          <div class="form-group"><label class="form-label">原价</label><input v-model.number="form.originalPrice" type="number" class="form-input" /></div>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">库存 *</label><input v-model.number="form.stock" type="number" class="form-input" /></div>
          <div class="form-group"><label class="form-label">分类</label><select v-model="form.category" class="form-input"><option value="">请选择</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">标签（逗号分隔）</label><input v-model="form.tagsStr" class="form-input" placeholder="如：热销,新品" /></div>
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
import { productApi } from '@/api'

const products = ref<any[]>([])
const categories = ref<any[]>([])
const keyword = ref('')
const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name:'', desc:'', price:0, originalPrice:0, stock:0, category:'', tagsStr:'' })

onMounted(() => { loadData() })

async function loadData() {
  products.value = await productApi.list({ keyword: keyword.value || undefined }) as any[]
  categories.value = await productApi.categories() as any[]
}

function openForm(p?: any) {
  if (p) {
    editingId.value = p.id
    form.value = { name: p.name, desc: p.desc || '', price: p.price, originalPrice: p.originalPrice || 0, stock: p.stock, category: p.category?._id || p.category || '', tagsStr: (p.tags || []).join(',') }
  } else {
    editingId.value = null
    form.value = { name:'', desc:'', price:0, originalPrice:0, stock:0, category:'', tagsStr:'' }
  }
  showForm.value = true
}

async function handleSave() {
  if (!form.value.name || !form.value.price) return
  const payload = { ...form.value, tags: form.value.tagsStr.split(',').filter(Boolean), price: Number(form.value.price), stock: Number(form.value.stock) }
  if (editingId.value) {
    await productApi.update(editingId.value, payload)
  } else {
    await productApi.create(payload)
  }
  showForm.value = false
  loadData()
}

async function handleDelete(id: string) {
  if (!confirm('确定删除？')) return
  await productApi.delete(id)
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
