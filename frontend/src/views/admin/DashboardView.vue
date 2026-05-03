<template>
  <div class="dashboard">
    <div class="stats-grid">
      <div class="stat-card card">
        <div class="stat-label">今日订单</div>
        <div class="stat-value">{{ stats.todayOrders || 0 }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-label">今日销售额</div>
        <div class="stat-value accent">¥{{ stats.todaySales?.toFixed(2) || '0.00' }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-label">总会员数</div>
        <div class="stat-value">{{ stats.totalMembers || 0 }}</div>
      </div>
      <div class="stat-card card">
        <div class="stat-label">待处理订单</div>
        <div class="stat-value accent">{{ stats.pendingOrders || 0 }}</div>
      </div>
    </div>
    <div class="recent-orders card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">最近订单</h3>
      <table class="data-table">
        <thead><tr><th>订单号</th><th>会员</th><th>金额</th><th>状态</th><th>时间</th></tr></thead>
        <tbody>
          <tr v-for="o in recentOrders" :key="o.id">
            <td>{{ o.orderNo }}</td>
            <td>{{ o.memberPhone || o.memberNickname }}</td>
            <td>¥{{ o.totalAmount?.toFixed(2) }}</td>
            <td><span :class="'badge status-' + o.status">{{ statusText(o.status) }}</span></td>
            <td>{{ o.createdAt?.slice(0, 16).replace('T', ' ') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminApi } from '@/api'

const stats = ref<any>({})
const recentOrders = ref<any[]>([])

onMounted(async () => {
  try {
    const data = await adminApi.dashboard() as any
    stats.value = data.stats || {}
    recentOrders.value = data.recentOrders || []
  } catch { /* ignore */ }
})

function statusText(s: string) {
  return { pending: '待付款', paid: '已付款', shipped: '已发货', completed: '已完成', cancelled: '已取消' }[s] || s
}
</script>

<style scoped>
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-card { padding: 24px; }
.stat-label { font-size: 13px; color: var(--muted); margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: 700; }
.stat-value.accent { color: var(--accent); }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { text-align: left; padding: 12px 8px; color: var(--muted); font-size: 12px; border-bottom: 1px solid var(--border); }
.data-table td { padding: 12px 8px; border-bottom: 1px solid var(--border); }
.data-table tr:last-child td { border-bottom: none; }
</style>
