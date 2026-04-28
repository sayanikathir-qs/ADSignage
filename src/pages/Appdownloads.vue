<template>
  <div class="downloads-page">
    <div class="container">
      <div class="download-card">
        <h2 class="card-title">Download player software</h2>

        <div class="platform-grid">
          <a
            v-for="p in platforms"
            :key="p.name"
            class="platform-card"
            href="#"
            @click.prevent="handleDownload(p)"
          >
            <div class="platform-icon-wrap">
              <!-- Android -->
              <svg v-if="p.key === 'android'" viewBox="0 0 576 512" class="platform-svg">
                <path fill="#3DDC84" d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55"/>
              </svg>

              <!-- Linux / Tux -->
              <svg v-else-if="p.key === 'linux'" viewBox="0 0 24 24" class="platform-svg">
                <!-- Body -->
                <ellipse cx="12" cy="17" rx="6.5" ry="6" fill="#000"/>
                <!-- White belly -->
                <ellipse cx="12" cy="17.5" rx="4" ry="4.5" fill="#fff"/>
                <!-- Head -->
                <ellipse cx="12" cy="7.5" rx="5" ry="5.5" fill="#000"/>
                <!-- Face white area -->
                <ellipse cx="12" cy="8" rx="3.5" ry="3.8" fill="#fff8dc"/>
                <!-- Eyes -->
                <circle cx="10.2" cy="7" r="1.1" fill="#fff"/>
                <circle cx="13.8" cy="7" r="1.1" fill="#fff"/>
                <circle cx="10.5" cy="7" r="0.5" fill="#222"/>
                <circle cx="14.1" cy="7" r="0.5" fill="#222"/>
                <!-- Beak -->
                <path d="M11 9 L12 10.2 L13 9 Z" fill="#f5a623"/>
                <!-- Feet -->
                <ellipse cx="9.5" cy="23.2" rx="2.2" ry="1" fill="#f5a623" transform="rotate(-15,9.5,23.2)"/>
                <ellipse cx="14.5" cy="23.2" rx="2.2" ry="1" fill="#f5a623" transform="rotate(15,14.5,23.2)"/>
                <!-- Wings -->
                <ellipse cx="6" cy="16" rx="1.5" ry="3.5" fill="#000" transform="rotate(-20,6,16)"/>
                <ellipse cx="18" cy="16" rx="1.5" ry="3.5" fill="#000" transform="rotate(20,18,16)"/>
              </svg>

              <!-- Windows -->
              <svg v-else-if="p.key === 'windows'" viewBox="0 0 88 88" class="platform-svg">
                <rect x="0"  y="0"  width="40" height="40" rx="2" fill="#0078D4"/>
                <rect x="44" y="0"  width="44" height="40" rx="2" fill="#0078D4"/>
                <rect x="0"  y="44" width="40" height="44" rx="2" fill="#0078D4"/>
                <rect x="44" y="44" width="44" height="44" rx="2" fill="#0078D4"/>
              </svg>

              <!-- Amazon Fire TV -->
              <svg v-else-if="p.key === 'amazon'" viewBox="0 0 100 100" class="platform-svg">
                <!-- 'a' letter -->
                <text x="50" y="72" text-anchor="middle" font-size="85" font-weight="900"
                      font-family="Georgia, serif" fill="#1a1a1a">a</text>
                <!-- Amazon smile arrow -->
                <path d="M22 83 Q50 97 78 83" fill="none" stroke="#FF9900" stroke-width="5"
                      stroke-linecap="round"/>
                <polygon points="75,79 82,83 76,88" fill="#FF9900"/>
              </svg>
            </div>

            <span class="platform-name">{{ p.name }}</span>
            <span class="platform-version">{{ p.version }}</span>
          </a>
        </div>

        <p class="description">
          Digital Signage is content on screens, but you'll have to decide how your screen
          is going to communicate with our system. You can connect your screen to an
          Android, Linux, Windows, Web HTML5 or Amazon Fire TV Stick.
        </p>
      </div>
    </div>

    <!-- Download notification -->
    <transition name="fade">
      <div v-if="showNotification" class="notification">
        <div class="notification-content">
          <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span>Downloading {{ selectedPlatform }}...</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showNotification  = ref(false)
const selectedPlatform  = ref('')

const platforms = [
  { key: 'android', name: 'Android',  version: 'v2.1.0', downloadUrl: '/downloads/app-android.apk' },
  { key: 'linux',   name: 'Linux',    version: 'v2.1.0', downloadUrl: '/downloads/app-linux.deb'   },
  { key: 'windows', name: 'Windows',  version: 'v2.1.0', downloadUrl: '/downloads/app-windows.exe' },
  { key: 'amazon',  name: 'Fire TV',  version: 'v2.1.0', downloadUrl: '/downloads/app-firetv.apk'  },
]

const handleDownload = (p) => {
  selectedPlatform.value  = p.name
  showNotification.value  = true
  setTimeout(() => {
    window.location.href   = p.downloadUrl
    showNotification.value = false
  }, 800)
}
</script>

<style scoped>
.downloads-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 32px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

/* Main card */
.download-card {
  background: white;
  border-radius: 12px;
  padding: 48px 40px 40px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  text-align: center;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 40px;
}

/* Platform grid */
.platform-grid {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 48px;
  margin-bottom: 36px;
  flex-wrap: wrap;
}

.platform-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
  padding: 16px;
  border-radius: 10px;
  transition: background 0.2s, transform 0.2s;
}

.platform-card:hover {
  background: #f8f9fa;
  transform: translateY(-4px);
}

.platform-icon-wrap {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-svg {
  width: 80px;
  height: 80px;
}

.platform-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.platform-version {
  font-size: 12px;
  color: #9ca3af;
}

/* Description */
.description {
  max-width: 680px;
  margin: 0 auto;
  font-size: 14px;
  line-height: 1.7;
  color: #6b7280;
}

/* Notification toast */
.notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: #22c55e;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
}

.check-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

@media (max-width: 600px) {
  .downloads-page { padding: 16px; }
  .download-card  { padding: 32px 20px; }
  .platform-grid  { gap: 24px; }
  .platform-svg   { width: 60px; height: 60px; }
}
</style>
