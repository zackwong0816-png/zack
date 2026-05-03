<template>
  <div>
    <h3 style="margin-bottom:20px;">会员管理</h3>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>昵称</th><th>手机号</th><th>等级</th><th>积分</th><th>注册时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="m in members" :key="m.id">
            <td>{{ m.nickname }}</td>
            <td>{{ m.phone }}</td>
            <td><span :class="'badge level-' + m.level">{{ levelText(m.level) }}</span></td>
            <td>{{ m.points }}</td>
            <td>{{ m.createdAt?.slice(0,10) }}</td>
            <td><button class="btn btn-sm btn-outline" @click="openEdit(m)">调整积分</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="showEdit" class="modal-overlay" @click.self="showEdit=false">
      <div class="modal card">
        <h3>调整会员</h3>
        <div class="form-group"><label class="form-label">积分</label><input v-model.number="editForm.points" type="number" class="form-input" /></div>
        <div class="form-group"><label class="form-label">等级</label><select v-model="editForm.level" class="form-input"><option value="bronze">普通</option><option value="silver">银</option><option value="gold">金</option></select></div>
        <div class="modal-actions"><button class="btn btn-outline" @click="showEdit=false">取消</button><button class="btn btn-primary" @click="saveEdit">保存</button></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'
const members = ref<any[]>([])
const showEdit = ref(false)
const editForm = ref({ id:'', points:0, level:'bronze' })
onMounted(() => load())
async function load() { members.value = await adminApi.members() as any[] }
function levelText(l: string) { return {bronze:'普通',silver:'银',gold:'金'}[l]||l }
function openEdit(m: any) { editForm.value = { id: m.id, points: m.points, level: m.level }; showEdit.value = true }
async function saveEdit() { await adminApi.updateMember(editForm.value.id, { points: editForm.value.points, level: editForm.value.level }); showEdit.value = false; load() }
</script>
<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { width:400px; padding:24px; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:16px; }
.level-bronze { background: #795548; color: #fff; }
.level-silver { background: #9e9e9e; color: #fff; }
.level-gold { background: #ffc107; color: #000; }
</style>