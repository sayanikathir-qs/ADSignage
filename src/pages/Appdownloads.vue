<template>
  <div class="downloads-page">

    <!-- Main Content -->
    <main class="container">
      <div class="download-section">
        <h2 class="section-title">Download player software</h2>
        
        <div class="platform-grid">
          <!-- Android -->
          <a 
            v-for="platform in platforms" 
            :key="platform.name"
            :href="platform.downloadUrl"
            class="platform-card"
            :class="platform.name.toLowerCase()"
            @click.prevent="handleDownload(platform)"
            
          >
            <div class="platform-icon" :class="platform.name.toLowerCase()">
              <component :is="platform.icon" />
            </div>
            <span class="platform-name">{{ platform.name }}</span>
            <span v-if="platform.version" class="platform-version">{{ platform.version }}</span>
          </a>
        </div>

        <p class="description">
          Digital Signage is content on screens, but you'll have to decide how your screen 
          is going to communicate with our system. You can connect your screen to an 
          Android, Linux, Windows, Web HTML5 or Amazon Fire TV Stick.
        </p>
      </div>
    </main>

    <!-- Download Modal/Notification -->
    <transition name="fade">
      <div v-if="showNotification" class="notification">
        <div class="notification-content">
          <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Downloading {{ selectedPlatform }}...</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  userAvatar: {
    type: String,
    default: '/default-avatar.png'
  },
  apiBaseUrl: {
    type: String,
    default: ''
  }
})

// Reactive state
const showNotification = ref(false)
const selectedPlatform = ref('')

// Platform data
const platforms = ref([
  {
    name: 'Android',
    downloadUrl: '/downloads/app-android.apk',
    version: 'v2.1.0',
    icon: 'AndroidIcon'
  },
  {
    name: 'Linux',
    downloadUrl: '/downloads/app-linux.deb',
    version: 'v2.1.0',
    icon: 'LinuxIcon'
  },
  {
    name: 'Windows',
    downloadUrl: '/downloads/app-windows.exe',
    version: 'v2.1.0',
    icon: 'WindowsIcon'
  },
  {
    name: 'Fire TV',
    downloadUrl: '/downloads/app-firetv.apk',
    version: 'v2.1.0',
    icon: 'AmazonIcon'
  }
])

// Icon components (SVG)
const AndroidIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.568.1521l-2.0225 3.503C15.5902 8.4897 13.8533 8.1786 12 8.1786c-1.8532 0-3.5902.3111-5.1362.8712L4.8413 5.5466a.4161.4161 0 00-.568-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589.3432 18.6617h23.3136c0-4.0028-2.3457-7.475-5.7734-9.3403"/>
    </svg>
  `
}

const LinuxIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.504 0c-.155 0-.315.008-.479.021-4.226.333-3.105 4.807-3.14 6.298-.076 1.092-.3 1.953-1.05 3.021-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a1.058 1.058 0 00-.324.261c-.746.875-.833 2.353-.259 3.851.573 1.497 1.772 2.478 2.968 2.442.357-.01.696-.115 1.004-.307 1.012.682 2.423 1.062 3.945 1.062.715 0 1.405-.085 2.063-.244.247.177.516.307.8.384 1.114.301 2.477-.586 3.222-2.094.745-1.508.63-3.255-.223-4.278a1.054 1.054 0 00-.033-.379c.353-1.117.237-2.338-.348-3.494-.504-1.003-1.498-2.175-2.324-2.954-.639-.751-.917-1.653-.98-2.828-.023-.746.214-2.586-.68-4.063-.681-.894-1.757-1.394-3.12-1.394"/>
    </svg>
  `
}

const WindowsIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
    </svg>
  `
}

const AmazonIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M.045 18.019c.372-.469 1.026-.526 1.454-.199.373.285.664.654.975 1.003.453.51.917 1.012 1.454 1.437.515.406 1.097.683 1.747.787.687.11 1.338-.05 1.934-.386.643-.363 1.157-.865 1.613-1.437.512-.642.915-1.353 1.238-2.116.353-.834.598-1.702.737-2.596.123-.793.16-1.593.112-2.393-.042-.693-.147-1.378-.315-2.053-.168-.675-.402-1.328-.702-1.959-.3-.631-.665-1.225-1.095-1.782-.43-.557-.924-1.06-1.482-1.509-.558-.449-1.178-.827-1.86-1.134-.682-.307-1.428-.518-2.238-.633-.81-.115-1.684-.092-2.622.069-.938.161-1.838.465-2.7.912-.862.447-1.645 1.036-2.349 1.767-.704.731-1.288 1.606-1.752 2.625-.464 1.019-.768 2.18-.912 3.483-.144 1.303-.088 2.748.167 4.335.255 1.587.71 3.035 1.365 4.344.655 1.309 1.51 2.38 2.565 3.213 1.055.833 2.31 1.326 3.765 1.479 1.455.153 3.11-.034 4.965-.561 1.855-.527 3.51-1.294 4.965-2.301 1.455-1.007 2.61-2.254 3.465-3.741.855-1.487 1.309-3.214 1.362-5.181.053-1.967-.353-3.874-1.218-5.721-.865-1.847-2.19-3.334-3.975-4.461-1.785-1.127-4.03-1.69-6.735-1.69-2.705 0-5.025.638-6.96 1.914-1.935 1.276-3.375 3.091-4.32 5.445-.945 2.354-1.155 5.249-.63 8.685.525 3.436 1.89 6.306 4.095 8.61 2.205 2.304 5.25 3.456 9.135 3.456 3.885 0 7.08-1.38 9.585-4.14 2.505-2.76 3.757-6.75 3.757-11.97 0-5.22-1.425-9.21-4.275-11.97-2.85-2.76-6.525-4.14-11.025-4.14-4.5 0-8.175 1.38-11.025 4.14C1.425 6.69 0 10.68 0 15.9c0 5.22 1.252 9.21 3.757 11.97 2.505 2.76 5.7 4.14 9.585 4.14 3.885 0 6.93-1.152 9.135-3.456 2.205-2.304 3.57-5.174 4.095-8.61.525-3.436.315-6.331-.63-8.685-.945-2.354-2.385-4.169-4.32-5.445C19.687 4.54 17.367 3.902 14.662 3.902z"/>
      <path d="M13.5 16.5c-.5-.5-1.5-1-2.5-1s-2 .5-2.5 1 .5 1.5 1 2 1.5 1 2.5 1 2-.5 2.5-1-.5-1.5-1-2z"/>
    </svg>
  `
}

// Methods
const toggleMenu = () => {
  // Emit event to parent component
  emit('menu-toggle')
}

const handleDownload = (platform) => {
  selectedPlatform.value = platform.name
  showNotification.value = true
  
  // Simulate download start
  setTimeout(() => {
    window.location.href = platform.downloadUrl
    showNotification.value = false
  }, 500)
}

const handleImageError = (e) => {
  // Fallback to default avatar
  e.target.src = '/default-avatar.png'
}

// Emit
const emit = defineEmits(['menu-toggle', 'download'])
</script>

<style scoped>
.downloads-page {
  min-height: 100vh;
  background-color: #f8f9f5;
}

/* Header Styles */
.header {
  background: #ffffff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.menu-btn:hover {
  background-color: #f0f0f0;
}

.menu-icon {
  width: 24px;
  height: 24px;
  color: #f1c40f;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

/* Main Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.download-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  color: #1a1a1a;
  font-weight: 600;
}

/* Platform Grid */
.platform-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.platform-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: #333;
  padding: 1.5rem 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  min-width: 100px;
}

.platform-card:hover {
  background: #f8f9fa;
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.platform-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-icon svg {
  width: 100%;
  height: 100%;
}

.platform-icon.android {
  color: #3DDC84;
}

.platform-icon.linux {
  color: #000000;
}

.platform-icon.windows {
  color: #00A4EF;
}

.platform-icon.amazon {
  color: #FF9900;
}

.platform-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.platform-version {
  font-size: 0.75rem;
  color: #888;
  font-weight: 400;
}

/* Description */
.description {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  color: #555;
  font-size: 0.95rem;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #2ecc71;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.check-icon {
  width: 20px;
  height: 20px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .container {
    padding: 2rem 1rem;
  }

  .download-section {
    padding: 2rem 1rem;
  }

  .platform-grid {
    gap: 2rem;
  }

  .platform-icon {
    width: 60px;
    height: 60px;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .description {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .platform-grid {
    gap: 1.5rem;
  }

  .platform-card {
    min-width: 80px;
    padding: 1rem 0.5rem;
  }

  .platform-icon {
    width: 50px;
    height: 50px;
  }

  .platform-name {
    font-size: 0.85rem;
  }
}
</style>