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
  }
];
