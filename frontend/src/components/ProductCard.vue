<template>
  <div class="product-card" @click="$router.push(`/products/${product.id}`)">
    <div class="product-img">
      <div class="product-tags" v-if="product.tags?.length">
        <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="img-placeholder">{{ product.name.charAt(0) }}</div>
    </div>
    <div class="product-body">
      <h3 class="product-name">{{ product.name }}</h3>
      <p class="product-desc text-muted">{{ product.desc?.slice(0, 30) }}</p>
      <div class="product-footer">
        <div class="product-price">
          <span class="price">¥{{ product.price }}</span>
          <span v-if="product.originalPrice" class="original">¥{{ product.originalPrice }}</span>
        </div>
        <button class="btn btn-sm btn-primary" @click.stop="addToCart">加入购物车</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/stores/product'

const props = defineProps<{ product: Product }>()
const cartStore = useCartStore()
const toast = useToast()

function addToCart() {
  cartStore.addItem({
    productId: props.product.id,
    name: props.product.name,
    price: props.product.price,
    image: props.product.images?.[0]
  })
  toast.success('已加入购物车')
}
</script>

<style scoped>
.product-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); overflow: hidden; cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}
.product-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.product-img { position: relative; padding-top: 100%; background: var(--surface-2); }
.img-placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 48px; color: var(--muted); font-family: var(--font-display);
}
.product-tags { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
.tag { background: var(--accent); color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 4px; }
.product-body { padding: 16px; }
.product-name { font-size: 15px; font-weight: 500; margin-bottom: 6px; }
.product-desc { font-size: 13px; margin-bottom: 12px; }
.product-footer { display: flex; align-items: center; justify-content: space-between; }
.product-price .price { font-size: 18px; font-weight: 600; color: var(--accent); }
.product-price .original { font-size: 12px; color: var(--muted); text-decoration: line-through; margin-left: 6px; }
</style>
