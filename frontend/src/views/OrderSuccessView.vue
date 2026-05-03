<template>
  <div class="order-success text-center">
    <div class="success-icon">✓</div>
    <h1>下单成功！</h1>
    <p class="text-muted">感谢您的购买，订单已确认</p>
    <div class="action-btns">
      <RouterLink to="/member" class="btn btn-primary">查看订单</RouterLink>
      <RouterLink to="/products" class="btn btn-outline">继续购物</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.order-success { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
.success-icon { width: 80px; height: 80px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40px; color: #fff; margin-bottom: 24px; }
.order-success h1 { margin-bottom: 12px; font-family: var(--font-display); }
.order-success p { margin-bottom: 32px; }
.action-btns { display: flex; gap: 12px; }
</style>
