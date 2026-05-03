<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">NOVA CMS</div>
      <nav>
        <RouterLink to="/admin/dashboard">📊 数据统计</RouterLink>
        <RouterLink to="/admin/products">📦 产品管理</RouterLink>
        <RouterLink to="/admin/orders">📋 订单管理</RouterLink>
        <RouterLink to="/admin/members">👥 会员管理</RouterLink>
        <RouterLink to="/admin/categories">🏷️ 分类管理</RouterLink>
        <RouterLink to="/admin/coupons">🎫 优惠券</RouterLink>
        <RouterLink to="/admin/content">📝 内容管理</RouterLink>
        <RouterLink to="/admin/stores">🏪 门店管理</RouterLink>
        <RouterLink to="/admin/promo">🔥 促销管理</RouterLink>
        <RouterLink to="/admin/messages">💬 留言管理</RouterLink>
        <RouterLink to="/admin/settings">⚙️ 系统设置</RouterLink>
      </nav>
    </aside>
    <div class="admin-main">
      <header class="admin-header">
        <h2>{{ pageTitle }}</h2>
        <div class="admin-user">
          <span>管理员</span>
          <a href="#" @click.prevent="logout">退出</a>
        </div>
      </header>
      <div class="admin-content">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    dashboard: '数据统计', products: '产品管理', orders: '订单管理',
    members: '会员管理', categories: '分类管理', coupons: '优惠券',
    content: '内容管理', stores: '门店管理', promo: '促销管理',
    messages: '留言管理', settings: '系统设置'
  }
  return map[route.name as string] || '管理后台'
})

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.admin-layout { display: grid; grid-template-columns: 220px 1fr; min-height: 100vh; background: var(--bg); }
.admin-sidebar { background: var(--surface); border-right: 1px solid var(--border); padding: 24px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.sidebar-logo { font-size: 16px; font-weight: 700; letter-spacing: 2px; padding: 0 20px 24px; border-bottom: 1px solid var(--border); margin-bottom: 16px; }
.admin-sidebar nav a { display: flex; align-items: center; gap: 10px; padding: 12px 20px; font-size: 14px; color: var(--muted); transition: all 0.2s; }
.admin-sidebar nav a:hover, .admin-sidebar nav a.router-link-active { background: var(--surface-2); color: var(--text); }
.admin-main { display: flex; flex-direction: column; }
.admin-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 32px; border-bottom: 1px solid var(--border); background: var(--surface); position: sticky; top: 0; z-index: 10; }
.admin-header h2 { font-size: 18px; }
.admin-user { display: flex; align-items: center; gap: 16px; font-size: 14px; color: var(--muted); }
.admin-user a { color: var(--accent); }
.admin-content { padding: 32px; flex: 1; }
</style>
