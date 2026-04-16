export const dashboardStats = [
  { label: 'Total Screens', value: 24, icon: 'Monitor' },
  { label: 'Active Channels', value: 8, icon: 'Layers' },
  { label: 'Playlists', value: 15, icon: 'PlaySquare' },
  { label: 'Media Files', value: 156, icon: 'Image' }
];

export const screens = [
  { id: 1, name: 'Main Lobby 01', status: 'Online', location: 'Floor 1', lastSeen: '2 mins ago' },
  { id: 2, name: 'Cafeteria South', status: 'Online', location: 'Floor 2', lastSeen: '5 mins ago' },
  { id: 3, name: 'Elevator Bank A', status: 'Offline', location: 'Floor 1', lastSeen: '1 hour ago' },
  { id: 4, name: 'Meeting Room 302', status: 'Online', location: 'Floor 3', lastSeen: 'Just now' },
];

export const channels = [
  { id: 1, name: 'Corporate News', playlist: 'Internal Updates', status: 'Active' },
  { id: 2, name: 'Ad Loop B', playlist: 'Client Promo 2026', status: 'Active' },
  { id: 3, name: 'Lunch Specials', playlist: 'Food & Beverage', status: 'Paused' },
];

export const playlists = [
  { id: 1, name: 'Morning Welcome', duration: '00:15:00', items: 12, lastEdited: '2 hours ago' },
  { id: 2, name: 'Client Promo 2026', duration: '00:05:30', items: 5, lastEdited: 'Yesterday' },
  { id: 3, name: 'Safety Instructions', duration: '00:02:45', items: 3, lastEdited: '3 days ago' },
  { id: 4, name: 'Sayani', duration: '00:00:06', items: 1, lastEdited: 'Wed, Apr 15, 2026 7:58 AM' },
];

export const media = [
  { id: 1, name: 'Summer_Promo_2024.mp4', type: 'video', size: '120 MB', date: '2026-04-10', customer: 'Acme Corp', duration: '0:50', resolution: null, gradient: 'linear-gradient(135deg,#3730a3,#1e3a5f)' },
  { id: 2, name: 'storefront_banner.jpg', type: 'image', size: '2.4 MB', date: '2026-04-11', customer: 'RetailHub', duration: null, resolution: '1920×1080', gradient: 'linear-gradient(135deg,#064e3b,#1e3a5f)' },
  { id: 3, name: 'menu_board_v3.html', type: 'html', size: '340 KB', date: '2026-04-12', customer: 'Food Co', duration: null, resolution: null, gradient: 'linear-gradient(135deg,#78350f,#b45309)' },
  { id: 4, name: 'company_intro.mp4', type: 'video', size: '450 MB', date: '2026-04-12', customer: 'TechStart', duration: '2:15', resolution: null, gradient: 'linear-gradient(135deg,#1e3a5f,#164e63)' },
  { id: 5, name: 'lobby_display.pdf', type: 'pdf', size: '18 MB', date: '2026-04-13', customer: 'Acme Corp', duration: null, resolution: null, gradient: 'linear-gradient(135deg,#3f1d1d,#7f1d1d)', pages: '12 pages' },
  { id: 6, name: 'sale_banner_red.jpg', type: 'image', size: '3.1 MB', date: '2026-04-13', customer: 'RetailHub', duration: null, resolution: '1920×1080', gradient: 'linear-gradient(135deg,#4c1d95,#1e1b4b)' },
  { id: 7, name: 'weather_widget.html', type: 'html', size: '220 KB', date: '2026-04-14', customer: 'CityMall', duration: null, resolution: null, gradient: 'linear-gradient(135deg,#0c4a6e,#0369a1)' },
  { id: 8, name: 'new_arrivals.mp4', type: 'video', size: '85 MB', date: '2026-04-14', customer: 'Fashion+', duration: '1:02', resolution: null, gradient: 'linear-gradient(135deg,#14532d,#166534)' },
  { id: 9, name: 'brand_logo.png', type: 'image', size: '512 KB', date: '2026-04-14', customer: 'TechStart', duration: null, resolution: '512×512', gradient: 'linear-gradient(135deg,#1c1917,#292524)' },
  { id: 10, name: 'digital_menu.html', type: 'html', size: '180 KB', date: '2026-04-15', customer: 'Food Co', duration: null, resolution: null, gradient: 'linear-gradient(135deg,#450a0a,#7f1d1d)' },
];

export const mediaStats = [
  { label: 'Total Storage', value: '2.4 TB', sub: '67% of 3.6 TB used', color: '#14b8a6' },
  { label: 'Total Files', value: '18,429', sub: 'Across all customers', color: '#6366f1' },
  { label: 'Videos', value: '4,218', sub: '1.8 TB total', color: '#8b5cf6' },
  { label: 'Images',        value: '12,847', sub: '580 GB total',              color: '#14b8a6' },
];
