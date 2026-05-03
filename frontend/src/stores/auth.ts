import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export interface Member {
  id: string
  phone: string
  nickname: string
  level: 'bronze' | 'silver' | 'gold'
  points: number
  avatar: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('nova_access_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('nova_refresh_token'))
  const member = ref<Member | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => localStorage.getItem('nova_admin_role') === 'admin')

  function setToken(accessToken: string, refresh?: string) {
    token.value = accessToken
    localStorage.setItem('nova_access_token', accessToken)
    if (refresh) {
      refreshToken.value = refresh
      localStorage.setItem('nova_refresh_token', refresh)
    }
  }

  async function login(phone: string, password: string) {
    const data = await api.post('/auth/login', { phone, password }) as any
    setToken(data.accessToken, data.refreshToken)
    member.value = data.member
    localStorage.setItem('nova_admin_role', data.role || '')
    return data
  }

  async function register(payload: { phone: string; password: string; nickname?: string }) {
    const data = await api.post('/auth/register', payload) as any
    setToken(data.accessToken, data.refreshToken)
    member.value = data.member
    return data
  }

  async function fetchProfile() {
    if (!token.value) return null
    try {
      member.value = await api.get('/auth/profile')
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    refreshToken.value = null
    member.value = null
    localStorage.removeItem('nova_access_token')
    localStorage.removeItem('nova_refresh_token')
    localStorage.removeItem('nova_admin_role')
  }

  return { token, member, isLoggedIn, isAdmin, setToken, login, register, fetchProfile, logout }
})
