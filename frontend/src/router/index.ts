import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  { path: '/products', component: () => import('@/views/ProductsView.vue') },
  { path: '/products/:id', component: () => import('@/views/ProductDetailView.vue') },
  { path: '/cart', component: () => import('@/views/CartView.vue') },
  { path: '/checkout', component: () => import('@/views/CheckoutView.vue') },
  { path: '/login', component: () => import('@/views/LoginView.vue') },
  { path: '/register', component: () => import('@/views/RegisterView.vue') },
  { path: '/member', component: () => import('@/views/MemberView.vue'), meta: { requiresAuth: true } },
  { path: '/order-success', component: () => import('@/views/OrderSuccessView.vue') },
  { path: '/about', component: () => import('@/views/AboutView.vue') },
  { path: '/contact', component: () => import('@/views/ContactView.vue') },
  { path: '/stores', component: () => import('@/views/StoresView.vue') },
  { path: '/content', component: () => import('@/views/ContentView.vue') },
  // Admin routes
  { path: '/admin/login', component: () => import('@/views/admin/AdminLoginView.vue') },
  { path: '/admin', component: () => import('@/views/admin/AdminLayout.vue'), children: [
    { path: '', redirect: '/admin/dashboard' },
    { path: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
    { path: 'products', component: () => import('@/views/admin/ProductsView.vue') },
    { path: 'orders', component: () => import('@/views/admin/OrdersView.vue') },
    { path: 'members', component: () => import('@/views/admin/MembersView.vue') },
    { path: 'categories', component: () => import('@/views/admin/CategoriesView.vue') },
    { path: 'coupons', component: () => import('@/views/admin/CouponsView.vue') },
    { path: 'content', component: () => import('@/views/admin/ContentView.vue') },
    { path: 'stores', component: () => import('@/views/admin/StoresView.vue') },
    { path: 'promo', component: () => import('@/views/admin/PromoView.vue') },
    { path: 'messages', component: () => import('@/views/admin/MessagesView.vue') },
    { path: 'settings', component: () => import('@/views/admin/SettingsView.vue') },
  ], meta: { requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login'
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/admin/login'
  }
})

export default router
