import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export interface Product {
  id: string
  name: string
  desc: string
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  images: string[]
  stock: number
  sales: number
  rating: number
  status: 'active' | 'inactive'
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  sort: number
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)

  async function fetchProducts(params?: Record<string, string | number>) {
    loading.value = true
    try {
      const data = await api.get('/products', { params }) as any
      products.value = data.items
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(id: string) {
    return api.get(`/products/${id}`) as Promise<Product>
  }

  async function fetchCategories() {
    categories.value = await api.get('/categories') as Category[]
  }

  async function createProduct(payload: Partial<Product>) {
    const data = await api.post('/products', payload) as Product
    products.value.unshift(data)
    return data
  }

  async function updateProduct(id: string, payload: Partial<Product>) {
    const data = await api.put(`/products/${id}`, payload) as Product
    const idx = products.value.findIndex(p => p.id === id)
    if (idx > -1) products.value[idx] = data
    return data
  }

  async function deleteProduct(id: string) {
    await api.delete(`/products/${id}`)
    products.value = products.value.filter(p => p.id !== id)
  }

  return { products, categories, loading, fetchProducts, fetchProduct, fetchCategories, createProduct, updateProduct, deleteProduct }
})
