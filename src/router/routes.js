export const routes = [
  // Auth routes (no sidebar/header)
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { layout: 'auth' }
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('../pages/SignUp.vue'),
    meta: { layout: 'auth' }
  },

  // App routes (require auth)
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/screens',
    name: 'Screens',
    component: () => import('../pages/Screens.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/channels',
    name: 'Channels',
    component: () => import('../pages/Channels.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/playlists',
    name: 'Playlists',
    component: () => import('../pages/Playlists.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/media',
    name: 'Media',
    component: () => import('../pages/Media.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/channels/:channelId',
    name: 'ChannelBuilder',
    component: () => import('../components/common/ChannelBuilder.vue'),
    props: true,
    meta: { title: 'Channel Builder', requiresAuth: true }
  },
  {
    name: 'Applications',
    path: '/applications',
    component: () => import('../pages/Applications.vue'),
    meta: { requiresAuth: true }
  },
  {
    name: 'ApplicationDetail',
    path: '/applications/:appType',
    component: () => import('../pages/ApplicationDetail.vue'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    name: 'Videoconvert',
    path: '/videoconvert',
    component: () => import('../pages/Videoconvert.vue'),
    meta: { requiresAuth: true }
  },
  {
    name: 'Payments',
    path: '/Payments',
    component: () => import('../pages/Payments.vue'),
    meta: { requiresAuth: true }
  },
  {
    name: 'Subscriptions',
    path: '/subscriptions',
    component: () => import('../pages/Subscriptions.vue'),
    meta: { requiresAuth: true }
  },
  {
    name: 'App downloads',
    path: '/appdownloads',
    component: () => import('../pages/Appdownloads.vue'),
    meta: { title: 'Downloads', requiresAuth: true }
  },
]
