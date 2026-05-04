import axios, { type AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：附加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nova_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理 + token 刷新
api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.response?.status === 401) {
      const auth = useAuthStore()
      const refreshToken = localStorage.getItem('nova_refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = res.data
          localStorage.setItem('nova_access_token', accessToken)
          auth.setToken(accessToken, newRefreshToken)
          err.config.headers.Authorization = `Bearer ${accessToken}`
          return api(err.config)
        } catch {
          auth.logout()
          router.push('/login')
        }
      } else {
        auth.logout()
        router.push('/login')
      }
    }
    return Promise.reject(err)
  }
)

export default api
