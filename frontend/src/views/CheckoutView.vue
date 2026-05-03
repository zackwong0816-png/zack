<template>
  <div class="checkout-page">
    <header class="topnav"><div class="container topnav-inner">
      <a href="/" class="logo">NOVA</a>
      <span>确认订单</span>
    </div></header>

    <div class="container checkout-body">
      <div class="checkout-layout">
        <div class="checkout-main">
          <div class="card" style="margin-bottom:24px;">
            <h3>订单摘要</h3>
            <div v-for="item in cartStore.items" :key="item.productId" class="order-item">
              <span>{{ item.name }} x{{ item.quantity }}</span>
              <span>¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="card">
            <h3>支付方式</h3>
            <label class="pay-option"><input type="radio" value="wechat" v-model="payMethod" /> 微信支付</label>
            <label class="pay-option"><input type="radio" value="alipay" v-model="payMethod" /> 支付宝</label>
            <label class="pay-option"><input type="radio" value="card" v-model="payMethod" /> 银行卡</label>
          </div>
        </div>
        <div class="checkout-sidebar">
          <div class="card total-card">
            <h3>应付金额</h3>
            <div class="big-price">¥{{ cartStore.total.toFixed(2) }}</div>
            <button class="btn btn-primary btn-lg" style="width:100%;margin-top:16px;" @click="submitOrder" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交订单' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import api from '@/api/axios'

const cartStore = useCartStore()
const router = useRouter()
const toast = useToast()
const payMethod = ref('wechat')
const submitting = ref(false)

async function submitOrder() {
  submitting.value = true
  try {
    const items = cartStore.items.map(i => ({ productId: i.productId, name: i.name, price: i.price, qty: i.quantity }))
    await api.post('/orders', { items, totalAmount: cartStore.total, paymentMethod: payMethod.value })
    await cartStore.clear()
    router.push('/order-success')
  } catch (e) {
    toast.error('下单失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-body { padding: 40px 24px; }
.checkout-layout { display: grid; grid-template-columns: 1fr 320px; gap: 40px; }
.checkout-main h3 { margin-bottom: 16px; font-size: 16px; }
.order-item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; border-bottom: 1px solid var(--border); }
.pay-option { display: flex; align-items: center; gap: 8px; padding: 12px 0; cursor: pointer; font-size: 14px; }
.big-price { font-size: 36px; font-weight: 700; color: var(--accent); margin-top: 8px; }
</style>
