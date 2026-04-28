import { defineStore } from 'pinia'
import { ref } from 'vue'

export const APP_TYPES = [
  { type: 'youtube',          name: 'YouTube',         icon: 'youtube',         color: '#FF0000' },
  { type: 'news-ticker',      name: 'News Ticker',     icon: 'newsticker',      color: '#1a1a2e' },
  { type: 'facebook',         name: 'Facebook',        icon: 'facebook',        color: '#1877F2' },
  { type: 'weather',          name: 'Weather',         icon: 'weather',         color: '#38b2f8' },
  { type: 'restaurant-menu',  name: 'Restaurant Menu', icon: 'restaurantmenu',  color: '#9b59b6' },
  { type: 'instagram',        name: 'Instagram',       icon: 'instagram',       color: '#E1306C' },
  { type: 'noticeboard',      name: 'Noticeboard',     icon: 'noticeboard',     color: '#f59e0b' },
  { type: 'rss-feed',         name: 'RSS Feed',        icon: 'rssfeed',         color: '#fdc704' },
  { type: 'google-slides',    name: 'Google Slides',   icon: 'googleslides',    color: '#F4B400' },
  { type: 'clock',            name: 'Clock',           icon: 'clock',           color: '#10b981' },
  { type: 'countdown',        name: 'Countdown',       icon: 'countdown',       color: '#ef4444' },
  { type: 'qr-code',          name: 'QR Code',         icon: 'qrcode',          color: '#374151' },
]

export const APP_FORMS = {
  youtube: [
    { key: 'url',       label: 'YouTube URL *',          type: 'url',      placeholder: 'e.g. https://www.youtube.com/', required: true },
    { key: 'subtitles', label: 'Toggle Subtitles',       type: 'checkbox' },
  ],
  'news-ticker': [
    { key: 'content',  label: 'Ticker Text *',            type: 'textarea', placeholder: 'Enter news ticker text...', required: true },
    { key: 'speed',    label: 'Scroll Speed',             type: 'select',   options: ['Slow', 'Medium', 'Fast'] },
  ],
  facebook: [
    { key: 'url',      label: 'Facebook Page URL *',      type: 'url',      placeholder: 'e.g. https://www.facebook.com/page', required: true },
  ],
  weather: [
    { key: 'location', label: 'Location *',               type: 'text',     placeholder: 'e.g. London, UK', required: true },
    { key: 'unit',     label: 'Temperature Unit',         type: 'select',   options: ['Celsius', 'Fahrenheit'] },
  ],
  'restaurant-menu': [
    { key: 'url',      label: 'Menu URL *',               type: 'url',      placeholder: 'e.g. https://your-menu.com/', required: true },
  ],
  instagram: [
    { key: 'username', label: 'Instagram Username *',     type: 'text',     placeholder: 'e.g. @username', required: true },
  ],
  noticeboard: [
    { key: 'content',  label: 'Notice Content *',         type: 'textarea', placeholder: 'Enter notice content...', required: true },
  ],
  'rss-feed': [
    { key: 'url',      label: 'RSS Feed URL *',           type: 'url',      placeholder: 'e.g. https://feeds.example.com/rss', required: true },
  ],
  'google-slides': [
    { key: 'url',      label: 'Google Slides URL *',      type: 'url',      placeholder: 'e.g. https://docs.google.com/presentation/...', required: true },
    { key: 'autoplay', label: 'Auto Play',                type: 'checkbox' },
  ],
  clock: [
    { key: 'timezone', label: 'Timezone',                 type: 'text',     placeholder: 'e.g. Europe/London' },
    { key: 'format',   label: 'Format',                   type: 'select',   options: ['12h', '24h'] },
  ],
  countdown: [
    { key: 'targetDate', label: 'Target Date *',          type: 'date',     required: true },
    { key: 'message',    label: 'Message',                type: 'text',     placeholder: 'e.g. Days until launch!' },
  ],
  'qr-code': [
    { key: 'url',      label: 'URL to encode *',          type: 'url',      placeholder: 'e.g. https://your-site.com', required: true },
    { key: 'label',    label: 'Label',                    type: 'text',     placeholder: 'e.g. Scan to visit us' },
  ],
}

const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()

export const useApplicationsStore = defineStore('applications', () => {
  const instances = ref({
    youtube: [
      { id: 1, name: '20secs timer', duration: '00:00:26', lastRun: fmt(new Date('2024-11-27T04:38:00')), url: 'https://www.youtube.com/watch?v=abc1', subtitles: false },
      { id: 2, name: '10secs timer', duration: '00:00:11', lastRun: fmt(new Date('2024-11-27T04:32:00')), url: 'https://www.youtube.com/watch?v=abc2', subtitles: false },
      { id: 3, name: 'LSMEYT',       duration: '00:02:41', lastRun: fmt(new Date('2024-10-07T18:12:00')), url: 'https://www.youtube.com/watch?v=abc3', subtitles: false },
      { id: 4, name: 'MENU BOARD',   duration: '00:11:37', lastRun: fmt(new Date('2023-04-14T15:13:00')), url: 'https://www.youtube.com/watch?v=abc4', subtitles: false },
      { id: 5, name: 'Flos',         duration: '00:11:37', lastRun: fmt(new Date('2023-02-07T11:11:00')), url: 'https://www.youtube.com/watch?v=abc5', subtitles: true  },
    ],
    'news-ticker':     [],
    facebook:          [],
    weather:           [],
    'restaurant-menu': [],
    instagram:         [],
    noticeboard: [
      { id: 6, name: 'Welcome Board', duration: '00:05:00', lastRun: fmt(new Date('2024-10-01T09:00:00')), content: 'Welcome to our store!' },
    ],
    'rss-feed':       [],
    'google-slides':  [],
    clock:            [],
    countdown:        [],
    'qr-code':        [],
  })

  const getCount   = (type) => (instances.value[type] ?? []).length
  const getList    = (type) => instances.value[type] ?? []

  const add = (type, data) => {
    if (!instances.value[type]) instances.value[type] = []
    instances.value[type].unshift({
      ...data,
      id: Date.now(),
      duration: '00:00:00',
      lastRun: fmt(new Date()),
    })
  }

  const update = (type, id, data) => {
    const list = instances.value[type]
    if (!list) return
    const i = list.findIndex(x => x.id === id)
    if (i !== -1) list[i] = { ...list[i], ...data }
  }

  const remove = (type, id) => {
    if (!instances.value[type]) return
    instances.value[type] = instances.value[type].filter(x => x.id !== id)
  }

  return { instances, getCount, getList, add, update, remove }
})
