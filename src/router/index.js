import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue')
  },
  {
    path: '/screens',
    name: 'Screens',
    component: () => import('../pages/Screens.vue')
  },
  {
    path: '/channels',
    name: 'Channels',
    component: () => import('../pages/Channels.vue')
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: () => import('../pages/Playlists.vue')
  },
  {
    path: '/media',
    name: 'Media',
    component: () => import('../pages/Media.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
