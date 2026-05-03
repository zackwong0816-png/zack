import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(JSON.parse(localStorage.getItem('nova_cart') || '[]'))

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const total = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))

  function save() {
    localStorage.setItem('nova_cart', JSON.stringify(items.value))
  }

  async function addItem(product: Omit<CartItem, 'quantity'>, qty = 1) {
    const idx = items.value.findIndex(i => i.productId === product.productId)
    if (idx > -1) {
      items.value[idx].quantity += qty
    } else {
      items.value.push({ ...product, quantity: qty })
    }
    save()
    try {
      await api.post('/cart/items', { productId: product.productId, quantity: qty })
    } catch {
      // 离线乐观更新，已本地保存
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }
    item.quantity = quantity
    save()
    try {
      await api.put(`/cart/items/${productId}`, { quantity })
    } catch {
      // 离线乐观更新
    }
  }

  async function removeItem(productId: string) {
    items.value = items.value.filter(i => i.productId !== productId)
    save()
    try {
      await api.delete(`/cart/items/${productId}`)
    } catch {
      // 离线乐观更新
    }
  }

  async function clear() {
    items.value = []
    save()
    try {
      await api.delete('/cart')
    } catch {
      // 离线乐观更新
    }
  }

  async function syncFromServer() {
    try {
      const serverItems = await api.get('/cart')
      items.value = serverItems
      save()
    } catch {
      // ignore
    }
  }

  return { items, count, total, addItem, updateQuantity, removeItem, clear, syncFromServer }
})
