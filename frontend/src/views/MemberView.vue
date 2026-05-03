<template>
  <div class="member-page">
    <header class="topnav"><div class="container topnav-inner">
      <a href="/" class="logo">NOVA</a>
    </div></header>

    <div class="container member-layout" v-if="authStore.member || profile">
      <aside class="member-sidebar card">
        <div class="member-avatar">{{ (profile?.nickname || authStore.member?.nickname || 'U').charAt(0) }}</div>
        <h3>{{ profile?.nickname || authStore.member?.nickname }}</h3>
        <p class="text-muted">{{ profile?.phone || authStore.member?.phone }}</p>
        <span class="level-badge">{{ levelText }}</span>
        <nav class="member-menu">
          <a href="#" class="active">📊 会员中心</a>
          <RouterLink to="/cart">🛒 购物车</RouterLink>
          <a href="#" @click.prevent="authStore.logout(); $router.push('/')">🚪 退出登录</a>
        </nav>
      </aside>
      <main class="member-content">
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-val">{{ profile?.points || authStore.member?.points || 0 }}</div>
            <div class="stat-label">我的积分</div>
          </div>
          <div class="stat-card card">
            <div class="stat-val">{{ orders.length }}</div>
            <div class="stat-label">全部订单</div>
          </div>
          <div class="stat-card card">
            <div class="stat-val">{{ pendingOrders }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
        <div class="card" style="margin-top:24px;">
          <h3>最近订单</h3>
          <div v-if="orders.length === 0" class="text-muted" style="padding:24px 0;">暂无订单</div>
          <div v-else>
            <div v-for="o in orders.slice(0,5)" :key="o.id" class="order-row">
              <div>
                <div class="order-prods">{{ o.items.map((i:any)=>i.name).join('、') }}</div>
                <div class="text-muted" style="font-size:12px;">{{ o.createdAt?.slice(0,10) }}</div>
              </div>
              <span :class="'status-badge status-' + o.status">{{ statusText(o.status) }}</span>
            </div>
          </div>
          <RouterLink to="/products" class="btn btn-outline" style="margin-top:16px;">去购物</RouterLink>
        </div>
      </main>
    </div>
    <div v-else class="loading-page">加载中...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { RouterLink } from 'vue-router'
import api from '@/api/axios'

const authStore = useAuthStore()
const profile = ref<any>(null)
const orders = ref<any[]>([])

const levelText = computed(() => ({ bronze: '🥉 普通会员', silver: '🥈 银会员', gold: '🥇 金会员' }[profile.value?.level || authStore.member?.level || 'bronze']))

const pendingOrders = computed(() => orders.value.filter((o: any) => ['pending','paid','shipped'].includes(o.status)).length)

onMounted(async () => {
  try {
    profile.value = await api.get('/auth/profile')
    orders.value = await api.get('/orders') as any[]
  } catch { /* not logged in */ }
})

function statusText(status: string) {
  return { pending: '待付款', paid: '待发货', shipped: '已发货', completed: '已完成', cancelled: '已取消' }[status] || status
}
</script>

<style scoped>
.member-layout { display: grid; grid-template-columns: 260px 1fr; gap: 40px; padding: 40px 24px; }
.member-sidebar { text-align: center; padding: 32px 24px; }
.member-avatar { width: 72px; height: 72px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #fff; margin: 0 auto 12px; }
.member-avatar { background: var(--accent); }
.member-sidebar h3 { margin-bottom: 4px; font-size: 16px; }
.member-sidebar p { font-size: 13px; margin-bottom: 8px; }
.level-badge { display: inline-block; font-size: 12px; background: var(--surface-2); padding: 2px 12px; border-radius: 12px; margin-bottom: 24px; }
.member-menu { text-align: left; margin-top: 24px; }
.member-menu a { display: flex; align-items: center; gap: 8px; padding: 10px 0; font-size: 14px; color: var(--muted); border-bottom: 1px solid var(--border); }
.member-menu a:hover, .member-menu a.active { color: var(--accent); }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.stat-card { text-align: center; padding: 24px; }
.stat-val { font-size: 32px; font-weight: 700; color: var(--accent); }
.stat-label { font-size: 13px; color: var(--muted); margin-top: 4px; }
.order-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
.order-prods { margin-bottom: 4px; }
.status-badge { font-size: 12px; padding: 2px 10px; border-radius: 12px; }
.status-pending { background: #fff3e0; color: #e65100; }
.status-paid { background: #e3f2fd; color: #1565c0; }
.status-shipped { background: #e8f5e9; color: #2e7d32; }
.status-completed { background: var(--surface-2); color: var(--muted); }
.loading-page { padding: 80px; text-align: center; color: var(--muted); }
</style>
