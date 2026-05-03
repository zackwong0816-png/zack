<template>
  <div>
    <div class="flex justify-between items-center" style="margin-bottom:20px;">
      <h3>分类管理</h3>
      <button class="btn btn-primary btn-sm" @click="openForm()">新增分类</button>
    </div>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>名称</th><th>别名</th><th>排序</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="c in categories" :key="c.id">
            <td>{{ c.name }}</td>
            <td>{{ c.slug }}</td>
            <td>{{ c.sort }}</td>
            <td><button class="btn btn-sm btn-outline" @click="openForm(c)">编辑</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showForm" class="modal-overlay" @click.self="showForm=false">
      <div class="modal card">
        <h3>{{ editing ? '编辑分类' : '新增分类' }}</h3>
        <div class="form-group"><label class="form-label">名称</label><input v-model="form.name" class="form-input" /></div>
        <div class="form-group"><label class="form-label">别名</label><input v-model="form.slug" class="form-input" /></div>
        <div class="form-group"><label class="form-label">排序</label><input v-model.number="form.sort" type="number" class="form-input" /></div>
        <div class="modal-actions"><button class="btn btn-outline" @click="showForm=false">取消</button><button class="btn btn-primary" @click="save">保存</button></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
const categories = ref<any[]>([])
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref({ name:'', slug:'', sort:0 })
onMounted(() => load())
async function load() { categories.value = await api.get('/categories') as any[] }
function openForm(c?: any) { editing.value = c || null; form.value = c ? { name: c.name, slug: c.slug, sort: c.sort } : { name:'', slug:'', sort:0 }; showForm.value = true }
async function save() { if (editing.value) await api.put(`/categories/${editing.value.id}`, form.value); else await api.post('/categories', form.value); showForm.value = false; load() }
</script>
<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { width:400px; padding:24px; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
</style>