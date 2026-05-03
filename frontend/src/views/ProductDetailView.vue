<template>
  <div class="detail-page">
    <header class="topnav"><div class="container topnav-inner">
      <a href="/" class="logo">NOVA</a>
      <nav class="nav-links">
        <RouterLink to="/products">产品</RouterLink>
      </nav>
      <div class="nav-actions">
        <RouterLink to="/cart" class="cart-btn">🛒<span class="badge" :class="{hidden: cartStore.count===0}">{{ cartStore.count }}</span></RouterLink>
      </div>
    </div></header>

    <div class="container detail-body" v-if="product">
      <div class="gallery">
        <div class="main-img">{{ product.name.charAt(0) }}</div>
        <div class="thumbs">
          <div v-for="n in 3" :key="n" class="thumb">{{ product.name.charAt(0) }}</div>
        </div>
      </div>
      <div class="info">
        <nav class="breadcrumb"><RouterLink to="/">首页</RouterLink> / <RouterLink to="/products">产品</RouterLink> / {{ product.name }}</nav>
        <h1 class="product-title">{{ product.name }}</h1>
        <p class="product-sub text-muted">{{ product.desc?.slice(0,80) }}</p>
        <div class="price-block">
          <span class="price">¥{{ product.price }}</span>
          <span v-if="product.originalPrice" class="original">¥{{ product.originalPrice }}</span>
        </div>
        <div class="stock text-muted">库存: {{ product.stock }} 件</div>
        <div class="qty-control">
          <button @click="qty = Math.max(1, qty-1)">−</button>
          <input v-model.number="qty" type="number" min="1" max="99" />
          <button @click="qty = Math.min(99, qty+1)">+</button>
        </div>
        <div class="action-btns">
          <button class="btn btn-primary btn-lg" @click="addToCart">加入购物车</button>
          <button class="btn btn-outline btn-lg" @click="buyNow">立即购买</button>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="container loading">加载中...</div>
    <div v-else class="container"><h1>产品未找到</h1></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToast()

const product = ref<any>(null)
const loading = ref(false)
const qty = ref(1)

onMounted(async () => {
  loading.value = true
  product.value = await productStore.fetchProduct(route.params.id as string)
  loading.value = false
})

function addToCart() {
  cartStore.addItem({ productId: product.value.id, name: product.value.name, price: product.value.price }, qty.value)
  toast.success('已加入购物车')
}

function buyNow() {
  cartStore.addItem({ productId: product.value.id, name: product.value.name, price: product.value.price }, qty.value)
  router.push('/checkout')
}
</script>

<style scoped>
.detail-body { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; padding: 40px 24px; }
.gallery .main-img { aspect-ratio: 1; background: var(--surface-2); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; font-size: 80px; color: var(--muted); margin-bottom: 12px; }
.thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.thumb { aspect-ratio: 1; background: var(--surface-2); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--muted); cursor: pointer; }
.breadcrumb { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.breadcrumb a { color: var(--muted); }
.breadcrumb a:hover { color: var(--accent); }
.product-title { font-size: 28px; margin-bottom: 12px; }
.product-sub { font-size: 14px; margin-bottom: 24px; }
.price-block { margin-bottom: 16px; }
.price { font-size: 32px; font-weight: 700; color: var(--accent); }
.original { font-size: 16px; color: var(--muted); text-decoration: line-through; margin-left: 12px; }
.stock { font-size: 13px; margin-bottom: 24px; }
.qty-control { display: flex; align-items: center; gap: 0; margin-bottom: 24px; }
.qty-control button { width: 40px; height: 40px; background: var(--surface-2); border: 1px solid var(--border); font-size: 18px; }
.qty-control input { width: 60px; height: 40px; text-align: center; background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-left: none; border-right: none; }
.action-btns { display: flex; gap: 12px; }
.loading { padding: 80px; text-align: center; color: var(--muted); }
</style>
