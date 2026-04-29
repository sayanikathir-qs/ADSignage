import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('auth_token')
  const isLoggedIn = !!token

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { path: '/login' }
  }

  if (to.meta.layout === 'auth' && isLoggedIn) {
    return { path: '/' }
  }
})

export default router
