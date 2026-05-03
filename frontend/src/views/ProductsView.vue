<template>
  <div class="products-page">
    <header class="topnav">
      <div class="container topnav-inner">
        <a href="/" class="logo">NOVA</a>
        <nav class="nav-links">
          <RouterLink to="/products">产品</RouterLink>
          <a href="/stores">门店</a>
          <a href="/about">关于我们</a>
        </nav>
        <div class="nav-actions">
          <RouterLink to="/cart" class="cart-btn">🛒<span class="badge" :class="{hidden: cartStore.count===0}">{{ cartStore.count }}</span></RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="btn btn-sm btn-primary">登录</RouterLink>
          <RouterLink v-else to="/member" class="btn btn-sm btn-outline">会员中心</RouterLink>
        </div>
      </div>
    </header>

    <div class="container page-body">
      <aside class="filter-sidebar">
        <h3>分类</h3>
        <ul class="cat-list">
          <li :class="{active: !activeCategory}" @click="setCategory('')">全部</li>
          <li v-for="cat in productStore.categories" :key="cat.id" :class="{active: activeCategory===cat.id}" @click="setCategory(cat.id)">{{ cat.name }}</li>
        </ul>
      </aside>

      <main class="product-main">
        <div class="search-bar">
          <input v-model="keyword" type="text" class="form-input" placeholder="搜索产品..." @keyup.enter="search" />
          <button class="btn btn-primary" @click="search">搜索</button>
        </div>

        <div v-if="loading" class="loading">加载中...</div>
        <div v-else>
          <p class="result-count text-muted">{{ products.length }} 个产品</p>
          <div class="product-grid">
            <ProductCard v-for="p in products" :key="p.id" :product="p" />
          </div>
          <div v-if="!products.length" class="empty-state text-center text-muted">
            <p>没有找到相关产品</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import ProductCard from '@/components/ProductCard.vue'

const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const products = ref(productStore.products)
const loading = ref(false)
const keyword = ref('')
const activeCategory = ref('')

onMounted(async () => {
  loading.value = true
  await productStore.fetchCategories()
  await loadProducts()
  loading.value = false
})

async function loadProducts(params: Record<string, any> = {}) {
  await productStore.fetchProducts({ status: 'active', ...params })
  products.value = productStore.products
}

function setCategory(id: string) {
  activeCategory.value = id
  loadProducts({ category: id || undefined })
}

function search() {
  loadProducts({ keyword: keyword.value || undefined, category: activeCategory.value || undefined })
}
</script>

<style scoped>
.page-body { display: grid; grid-template-columns: 200px 1fr; gap: 40px; padding: 40px 24px; }
.filter-sidebar h3 { font-size: 14px; color: var(--muted); margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
.cat-list { list-style: none; }
.cat-list li { padding: 8px 12px; border-radius: var(--radius); cursor: pointer; font-size: 14px; color: var(--muted); }
.cat-list li:hover { background: var(--surface); color: var(--text); }
.cat-list li.active { background: var(--accent); color: #fff; }

.search-bar { display: flex; gap: 12px; margin-bottom: 24px; }
.search-bar .form-input { flex: 1; }
.result-count { margin-bottom: 16px; font-size: 13px; }
.product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
.empty-state { padding: 80px 0; }
</style>
