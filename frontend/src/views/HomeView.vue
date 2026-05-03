<template>
  <div class="home">
    <!-- TopNav -->
    <header class="topnav">
      <div class="container topnav-inner">
        <a href="/" class="logo">NOVA</a>
        <nav class="nav-links">
          <RouterLink to="/products">产品</RouterLink>
          <a href="/stores">门店</a>
          <a href="/about">关于我们</a>
          <a href="/contact">联系我们</a>
        </nav>
        <div class="nav-actions">
          <RouterLink to="/cart" class="cart-btn">
            🛒
            <span class="badge" :class="{ hidden: cartStore.count === 0 }">{{ cartStore.count }}</span>
          </RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="btn btn-sm btn-primary">登录</RouterLink>
          <RouterLink v-else to="/member" class="btn btn-sm btn-outline">会员中心</RouterLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">NOVA</h1>
        <p class="hero-sub">探索品质生活的无限可能</p>
        <RouterLink to="/products" class="btn btn-primary btn-lg">浏览产品</RouterLink>
      </div>
    </section>

    <!-- Products -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">热门产品</h2>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else class="product-grid">
          <ProductCard v-for="p in products" :key="p.id" :product="p" />
        </div>
        <div class="text-center mt-lg">
          <RouterLink to="/products" class="btn btn-outline">查看全部</RouterLink>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="section stats-section">
      <div class="container grid grid-3 gap-6">
        <div class="stat-item">
          <div class="stat-number">120<span>万</span></div>
          <p>忠实用户的选择与信赖</p>
        </div>
        <div class="stat-item">
          <div class="stat-number">98<span>%</span></div>
          <p>用户好评率，持续领跑行业</p>
        </div>
        <div class="stat-item">
          <div class="stat-number">500<span>+</span></div>
          <p>覆盖城市的门店网络</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-logo">NOVA</div>
            <p class="text-muted">探索品质生活的无限可能</p>
          </div>
          <div class="footer-links">
            <h4>快速链接</h4>
            <RouterLink to="/products">产品列表</RouterLink>
            <RouterLink to="/about">关于我们</RouterLink>
            <RouterLink to="/contact">联系我们</RouterLink>
            <RouterLink to="/stores">门店查询</RouterLink>
          </div>
          <div class="footer-links">
            <h4>会员服务</h4>
            <RouterLink to="/login">登录账号</RouterLink>
            <RouterLink to="/register">免费注册</RouterLink>
            <RouterLink to="/cart">购物车</RouterLink>
            <RouterLink to="/member">会员中心</RouterLink>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="text-muted">© 2024 NOVA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore, useCartStore, useProductStore } from '@/stores'
import ProductCard from '@/components/ProductCard.vue'

const authStore = useAuthStore()
const cartStore = useCartStore()
const productStore = useProductStore()

const products = ref(productStore.products)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  await productStore.fetchProducts({ status: 'active', limit: 6 })
  products.value = productStore.products
  loading.value = false
})
</script>

<style scoped>
.topnav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(10,10,10,0.9); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  height: var(--topnav-h);
}
.topnav-inner { height: 100%; display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 22px; font-weight: 700; letter-spacing: 4px; }
.nav-links { display: flex; gap: 32px; }
.nav-links a:hover { color: var(--accent); transition: color 0.2s; }
.nav-actions { display: flex; align-items: center; gap: 16px; }
.cart-btn { position: relative; font-size: 20px; }
.badge { position: absolute; top: -8px; right: -10px; }
.badge.hidden { display: none; }

.hero {
  height: 70vh; display: flex; align-items: center; justify-content: center;
  background: radial-gradient(ellipse at center, #1e1e1e 0%, #0a0a0a 70%);
  text-align: center;
}
.hero-title { font-family: var(--font-display); font-size: 72px; letter-spacing: 12px; margin-bottom: 16px; }
.hero-sub { font-size: 18px; color: var(--muted); margin-bottom: 32px; }

.section { padding: 80px 0; }
.section-title { font-family: var(--font-display); font-size: 32px; margin-bottom: 40px; text-align: center; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
.loading { text-align: center; color: var(--muted); padding: 40px; }

.stats-section { background: var(--surface); padding: 60px 0; text-align: center; }
.stat-item .stat-number { font-size: 48px; font-weight: 700; color: var(--accent); }
.stat-item .stat-number span { font-size: 20px; }
.stat-item p { color: var(--muted); margin-top: 8px; }

.footer { border-top: 1px solid var(--border); padding: 60px 0 24px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
.footer-logo { font-size: 22px; font-weight: 700; letter-spacing: 4px; margin-bottom: 12px; }
.footer-links h4 { margin-bottom: 16px; font-size: 14px; color: var(--muted); }
.footer-links a { display: block; margin-bottom: 8px; font-size: 14px; color: var(--muted); }
.footer-links a:hover { color: var(--accent); }
.footer-bottom { border-top: 1px solid var(--border); padding-top: 24px; text-align: center; font-size: 13px; }
</style>
