export const routes = [
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
  },
  {
    path: '/channels/:channelId',
    name: 'ChannelBuilder',
    component: () => import('../components/common/ChannelBuilder.vue'),
    props: true,
    meta: { title: 'Channel Builder' }
  },
  {
    name: 'Applications',
    path: '/applications',
    component: () => import('../pages/Applications.vue')
  },
  {
    name: 'ApplicationDetail',
    path: '/applications/:appType',
    component: () => import('../pages/ApplicationDetail.vue'),
    props: true,
  },
  {
    name: 'Videoconvert',
    path: '/videoconvert',
    component: () => import('../pages/Videoconvert.vue')
  },
  {
    name: 'Payments',
    path: '/Payments',
    component: () => import('../pages/Payments.vue')
  },
  {
    name: 'Subcriptions',
    path: '/subcriptions',
    component: () => import('../pages/Subcriptions.vue')
  },
  {
    name: 'App downloads',
    path: '/appdownloads',
    component: () => import('../pages/Appdownloads.vue'),
    meta: { title: 'Downloads' }
  },
];
