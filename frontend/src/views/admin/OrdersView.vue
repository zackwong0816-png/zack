<template>
  <div>
    <h3 style="margin-bottom:20px;">订单管理</h3>
    <div class="filters card" style="padding:16px;margin-bottom:20px;">
      <select v-model="statusFilter" class="form-input" style="max-width:200px;display:inline-block;margin-right:12px;" @change="loadData">
        <option value="">全部状态</option>
        <option value="pending">待付款</option>
        <option value="paid">已付款</option>
        <option value="shipped">已发货</option>
        <option value="completed">已完成</option>
        <option value="cancelled">已取消</option>
      </select>
    </div>
    <div class="card">
      <table class="data-table">
        <thead><tr><th>订单号</th><th>会员</th><th>商品</th><th>金额</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td>{{ o.orderNo }}</td>
            <td>{{ o.memberPhone || o.memberNickname }}</td>
            <td>{{ o.items?.map((i:any)=>i.name+'x'+i.qty).join('、') }}</td>
            <td>¥{{ o.totalAmount?.toFixed(2) }}</td>
            <td><span :class="'badge status-' + o.status">{{ statusText(o.status) }}</span></td>
            <td>{{ o.createdAt?.slice(0,10) }}</td>
            <td>
              <button v-if="o.status === 'paid'" class="btn btn-sm btn-primary" @click="ship(o.id)">发货</button>
              <button v-if="o.status === 'pending'" class="btn btn-sm btn-danger" @click="cancel(o.id)">取消</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi } from '@/api'
const orders = ref<any[]>([])
const statusFilter = ref('')
onMounted(() => loadData())
async function loadData() { orders.value = await orderApi.list({ status: statusFilter.value || undefined }) as any[] }
async function ship(id: string) { await orderApi.updateStatus(id, 'shipped'); loadData() }
async function cancel(id: string) { if (confirm('确定取消？')) { await orderApi.cancel(id); loadData() } }
function statusText(s: string) { return {pending:'待付款',paid:'已付款',shipped:'已发货',completed:'已完成',cancelled:'已取消'}[s]||s }
</script>
<style scoped>
.filters select { vertical-align: middle; }
.status-pending { background: #fff3e0; color: #e65100; }
.status-paid { background: #e3f2fd; color: #1565c0; }
.status-shipped { background: #e8f5e9; color: #2e7d32; }
.status-completed { background: var(--surface-2); color: var(--muted); }
.status-cancelled { background: var(--surface-2); color: var(--muted); }
</style>