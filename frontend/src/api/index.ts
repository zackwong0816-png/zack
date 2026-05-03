import api from './axios'

export const authApi = {
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  register: (data: { phone: string; password: string; nickname?: string }) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  profile: () => api.get('/auth/profile'),
  adminLogin: (username: string, password: string) => api.post('/auth/admin/login', { username, password }),
}

export const productApi = {
  list: (params?: any) => api.get('/products', { params }),
  detail: (id: string) => api.get(`/products/${id}`),
  categories: () => api.get('/categories'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity: number) => api.post('/cart/items', { productId, quantity }),
  update: (productId: string, quantity: number) => api.put(`/cart/items/${productId}`, { quantity }),
  remove: (productId: string) => api.delete(`/cart/items/${productId}`),
  clear: () => api.delete('/cart'),
}

export const orderApi = {
  create: (data: any) => api.post('/orders', data),
  list: (params?: any) => api.get('/orders', { params }),
  detail: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.put(`/orders/${id}/cancel`),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
}

export const memberApi = {
  profile: () => api.get('/members/me'),
  update: (data: any) => api.put('/members/me', data),
  changePassword: (oldPw: string, newPw: string) => api.put('/members/me/password', { oldPassword: oldPw, newPassword: newPw }),
  orders: () => api.get('/members/me/orders'),
  points: () => api.get('/members/me/points'),
}

export const couponApi = {
  list: () => api.get('/coupons'),
  claim: (id: string) => api.post(`/coupons/${id}/claim`),
  create: (data: any) => api.post('/coupons', data),
}

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  members: (params?: any) => api.get('/admin/members', { params }),
  updateMember: (id: string, data: any) => api.put(`/admin/members/${id}`, data),
  messages: (params?: any) => api.get('/admin/messages', { params }),
  replyMessage: (id: string, reply: string) => api.put(`/admin/messages/${id}/reply`, { reply }),
  updateSettings: (data: any) => api.put('/admin/settings', data),
}
