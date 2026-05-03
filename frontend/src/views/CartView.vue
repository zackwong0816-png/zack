<template>
  <div class="cart-page">
    <header class="topnav"><div class="container topnav-inner">
      <a href="/" class="logo">NOVA</a>
      <RouterLink to="/products" class="btn btn-sm btn-outline">继续购物</RouterLink>
      <div class="nav-actions">
        <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="btn btn-sm btn-primary">登录</RouterLink>
        <RouterLink v-else to="/member" class="btn btn-sm btn-outline">会员中心</RouterLink>
      </div>
    </div></header>

    <div class="container cart-body">
      <h1>购物车</h1>
      <div v-if="cartStore.items.length === 0" class="empty-cart text-center">
        <p class="text-muted">购物车是空的</p>
        <RouterLink to="/products" class="btn btn-primary" style="margin-top:24px;">去购物</RouterLink>
      </div>
      <div v-else class="cart-layout">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.productId" class="cart-item">
            <div class="item-img">{{ item.name.charAt(0) }}</div>
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="text-muted">¥{{ item.price }}</p>
            </div>
            <div class="item-qty">
              <button @click="cartStore.updateQuantity(item.productId, item.quantity - 1)">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="cartStore.updateQuantity(item.productId, item.quantity + 1)">+</button>
            </div>
            <div class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
            <button class="item-remove" @click="cartStore.removeItem(item.productId)">删除</button>
          </div>
        </div>
        <div class="cart-summary card">
          <h3>合计</h3>
          <div class="summary-row"><span>商品总数</span><span>{{ cartStore.count }} 件</span></div>
          <div class="summary-row total"><span>应付金额</span><span class="price">¥{{ cartStore.total.toFixed(2) }}</span></div>
          <button class="btn btn-primary btn-lg" style="width:100%;margin-top:16px;" @click="checkout">去结算</button>
          <button class="btn btn-outline" style="width:100%;margin-top:8px;" @click="cartStore.clear()">清空购物车</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

function checkout() {
  if (!authStore.isLoggedIn) {
    toast.error('请先登录')
    router.push('/login')
    return
  }
  router.push('/checkout')
}
</script>

<style scoped>
.cart-body { padding: 40px 24px; }
.cart-body h1 { margin-bottom: 32px; font-family: var(--font-display); }
.empty-cart { padding: 80px 0; }
.cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 40px; align-items: start; }
.cart-item {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 0; border-bottom: 1px solid var(--border);
}
.item-img { width: 64px; height: 64px; background: var(--surface-2); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.item-info { flex: 1; }
.item-info h4 { font-size: 14px; margin-bottom: 4px; }
.item-qty { display: flex; align-items: center; gap: 8px; }
.item-qty button { width: 28px; height: 28px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 4px; font-size: 14px; }
.item-total { font-weight: 600; min-width: 80px; text-align: right; }
.item-remove { color: var(--muted); font-size: 13px; }
.item-remove:hover { color: #d32f2f; }
.cart-summary h3 { margin-bottom: 16px; font-size: 16px; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: var(--muted); }
.summary-row.total { border-top: 1px solid var(--border); margin-top: 8px; padding-top: 16px; font-size: 16px; }
.summary-row .price { font-size: 24px; font-weight: 700; color: var(--accent); }
</style>
