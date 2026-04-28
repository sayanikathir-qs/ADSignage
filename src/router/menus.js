import { LayoutDashboard, Monitor,Download,AppWindow,RotateCcw,Layers, CreditCard ,PlaySquare, Repeat ,Image as ImageIcon, Grid } from 'lucide-vue-next'

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
  },
  {
    name:'Applications',
    path:'/applications',
    icon:Grid,
  },
  {
    name:'Videoconvert',
    path:'/videoconvert',
    icon:RotateCcw,
  },
  {
    name:'Payments',
    path:'/Payments',
    icon:CreditCard,
  },
  {
    name:'Subcriptions',
    path:'/subcriptions',
    icon:Repeat,
  },
  {
    name:'App downloads',
    path:'/appdownloads',
    icon:Download,
  }


];
