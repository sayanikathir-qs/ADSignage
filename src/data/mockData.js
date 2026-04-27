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

export const screenGroups = [
  { id: 1, name: 'WebGroup' },
  { id: 2, name: 'LG WALL' },
];

export const screensData = [
  { id: 1, name: 'Samsung', type: 'Web', groupId: 1, status: 'offline', offlineAt: 'Oct 8, 2024, 6:58pm', channel: 'Sayani' },
  { id: 2, name: 'OutDoor', type: null, groupId: 2, status: 'offline', offlineAt: 'Jun 3, 2024, 6:30pm', channel: 'CostAcoffee' },
  { id: 3, name: 'Office NEC 75 4K', type: null, groupId: 2, status: 'offline', offlineAt: 'Sep 11, 2023, 8:51am', channel: 'Demo3' },
];

export const channels = [
  { id: 1, name: 'Sayani', status: 'Draft Saved. Publish required.', lastEdited: 'Wed, Apr 15, 2026 7:15 AM' },
  { id: 2, name: 'DEMO 37', status: 'Published.', lastEdited: 'Tue, Mar 17, 2026 6:35 PM' },
  { id: 3, name: 'YT 2 video - Channel', status: 'Published.', lastEdited: 'Tue, Feb 25, 2026 7:20 PM' },
  { id: 4, name: 'ADS - Channel canvas', status: 'Published.', lastEdited: 'Wed, Apr 15, 2026 7:39 AM' },
  { id: 5, name: '10secs tirn - YT Channel', status: 'Published.', lastEdited: 'Wed, Apr 30, 2025 6:49 PM' },
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
  { label: 'Total Storage', value: '2.4 TB', sub: '67% of 3.6 TB used', color: '#fdc704' },
  { label: 'Total Files', value: '18,429', sub: 'Across all customers', color: '#6366f1' },
  { label: 'Videos', value: '4,218', sub: '1.8 TB total', color: '#8b5cf6' },
  { label: 'Images', value: '12,847', sub: '580 GB total', color: '#fdc704' },
];

export const topCustomers = [
  { name: 'Nexus Retail', screens: 142, plan: 'Enterprise', storage: '480 GB', status: 'active' },
  { name: 'CityMall Group', screens: 98, plan: 'Pro', storage: '320 GB', status: 'active' },
  { name: 'Food Co', screens: 67, plan: 'Pro', storage: '210 GB', status: 'active' },
  { name: 'TechStart Inc', screens: 45, plan: 'Standard', storage: '95 GB', status: 'active' },
  { name: 'RetailHub', screens: 38, plan: 'Standard', storage: '78 GB', status: 'inactive' },
];

export const liveActivity = [
  { text: 'Nexus Retail paired 3 new screens in Chicago store', time: '2 min ago' },
  { text: 'CityMall Group updated Morning Welcome playlist', time: '8 min ago' },
  { text: 'Food Co published Digital Menu channel', time: '15 min ago' },
  { text: 'TechStart Inc uploaded 4 new media files', time: '22 min ago' },
  { text: 'RetailHub screen "Outdoor South" went offline', time: '35 min ago' },
];

export const invoices = [
  { id: 'D3BFF31E-0001', term: 'month', amount: '£ 10', paidAt: '25/03/2024 18:21:51', period: '25/03/2024 - 25/04/2024' },
  { id: 'D3BFF31E-0010', term: 'month', amount: '£ 10', paidAt: '25/04/2024 20:24:10', period: '25/04/2024 - 25/05/2024' },
  { id: 'D3BFF31E-0017', term: 'month', amount: '£ 10', paidAt: '25/05/2024 20:22:17', period: '25/05/2024 - 25/06/2024' },
  { id: 'D3BFF31E-0025', term: 'month', amount: '£ 5', paidAt: '30/12/2024 13:25:58', period: '30/12/2024 - 30/01/2025' },
  { id: 'D3BFF31E-0027', term: 'month', amount: '£ 5', paidAt: '30/01/2025 14:26:52', period: '30/01/2025 - 28/02/2025' },
  { id: 'D3BFF31E-0028', term: 'month', amount: '£ 5', paidAt: '28/02/2025 14:26:25', period: '28/02/2025 - 30/03/2025' },
];

export const subscriptions = [
  {
    id: 1,
    startedAt: '30/12/2024 13:26:05',
    amount: '£ 5',
    term: 'monthly',
    nextPayment: '30/03/2025 14:25:55',
    lastPayment: '30/12/2024 13:25:55',
    pairedTotal: '0 / 1',
    status: 'Active'
  },
  {
    id: 2,
    startedAt: '25/03/2024 18:21:53',
    amount: '£ 10',
    term: 'monthly',
    nextPayment: '25/06/2024 19:21:47',
    lastPayment: '25/03/2024 18:21:47',
    pairedTotal: '0 / 2',
    status: 'Active'
  }
];