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

  function snapshot(): CartItem[] {
    return JSON.parse(JSON.stringify(items.value))
  }

  function restore(snap: CartItem[]) {
    items.value = snap
    save()
  }

  async function addItem(product: Omit<CartItem, 'quantity'>, qty = 1) {
    const snap = snapshot()
    const idx = items.value.findIndex(i => i.productId === product.productId)
    if (idx > -1) {
      items.value[idx].quantity += qty
    } else {
      items.value.push({ ...product, quantity: qty })
    }
    save()
    try {
      const updated = await api.post('/cart/items', { productId: product.productId, quantity: qty }) as unknown as CartItem[]
      items.value = updated
      save()
    } catch (e: any) {
      restore(snap)
      throw e
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(productId)
      return
    }
    const snap = snapshot()
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    item.quantity = quantity
    save()
    try {
      const updated = await api.put(`/cart/items/${productId}`, { quantity }) as unknown as CartItem[]
      items.value = updated
      save()
    } catch (e: any) {
      restore(snap)
      throw e
    }
  }

  async function removeItem(productId: string) {
    const snap = snapshot()
    items.value = items.value.filter(i => i.productId !== productId)
    save()
    try {
      const updated = await api.delete(`/cart/items/${productId}`) as unknown as CartItem[]
      items.value = updated
      save()
    } catch (e: any) {
      restore(snap)
      throw e
    }
  }

  async function clear() {
    const snap = snapshot()
    items.value = []
    save()
    try {
      await api.delete('/cart')
    } catch (e: any) {
      restore(snap)
      throw e
    }
  }

  async function syncFromServer() {
    try {
      const serverItems = await api.get('/cart') as unknown as CartItem[]
      items.value = serverItems
      save()
    } catch {
      // ignore
    }
  }

  return { items, count, total, addItem, updateQuantity, removeItem, clear, syncFromServer }
})
