import { LayoutDashboard, Monitor, Layers, PlaySquare, Image as ImageIcon } from 'lucide-vue-next'

export const menus = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Screens',
    path: '/screens',
    icon: Monitor,
  },
  {
    name: 'Channels',
    path: '/channels',
    icon: Layers,
  },
  {
    name: 'Playlists',
    path: '/playlists',
    icon: PlaySquare,
  },
  {
    name: 'Media',
    path: '/media',
    icon: ImageIcon,
  }
];
