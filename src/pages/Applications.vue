<template>
  <div class="apps-page">
    <div class="apps-grid">
      <div
        v-for="app in APP_TYPES"
        :key="app.type"
        class="app-card"
        @click="$router.push(`/applications/${app.type}`)"
      >
        <div class="app-icon-wrap">
          <!-- YouTube -->
          <template v-if="app.type === 'youtube'">
            <svg viewBox="0 0 90 62" class="brand-icon">
              <rect width="90" height="62" rx="14" fill="#FF0000"/>
              <polygon points="37,16 37,46 64,31" fill="white"/>
            </svg>
          </template>

          <!-- News Ticker -->
          <template v-else-if="app.type === 'news-ticker'">
            <div class="news-icon">
              <div class="news-top">NEWS</div>
              <div class="news-bottom">BREAKING NEWS</div>
            </div>
          </template>

          <!-- Facebook -->
          <template v-else-if="app.type === 'facebook'">
            <svg viewBox="0 0 90 90" class="brand-icon">
              <circle cx="45" cy="45" r="45" fill="#1877F2"/>
              <path d="M61 45H51V37c0-2.8 1.8-3.5 3-3.5h6V24h-8c-9 0-11 6.7-11 11v10H35v10h6v28h10V55h8l2-10z" fill="white"/>
            </svg>
          </template>

          <!-- Weather -->
          <template v-else-if="app.type === 'weather'">
            <svg viewBox="0 0 90 70" class="brand-icon" style="width:80px">
              <circle cx="60" cy="22" r="18" fill="#FDB813"/>
              <ellipse cx="35" cy="45" rx="22" ry="16" fill="#87CEEB"/>
              <ellipse cx="52" cy="50" rx="26" ry="18" fill="#B0D8F5"/>
              <ellipse cx="30" cy="55" rx="18" ry="13" fill="white"/>
              <ellipse cx="50" cy="57" rx="24" ry="14" fill="white"/>
            </svg>
          </template>

          <!-- Restaurant Menu -->
          <template v-else-if="app.type === 'restaurant-menu'">
            <svg viewBox="0 0 80 80" class="brand-icon" style="width:64px">
              <rect x="8" y="8" width="64" height="64" rx="10" fill="none" stroke="#9b59b6" stroke-width="4"/>
              <line x1="8" y1="28" x2="72" y2="28" stroke="#9b59b6" stroke-width="4"/>
              <circle cx="28" cy="18" r="5" fill="#9b59b6"/>
              <circle cx="52" cy="18" r="5" fill="#9b59b6"/>
              <line x1="22" y1="44" x2="58" y2="44" stroke="#9b59b6" stroke-width="3" stroke-linecap="round"/>
              <line x1="22" y1="56" x2="46" y2="56" stroke="#9b59b6" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </template>

          <!-- Instagram -->
          <template v-else-if="app.type === 'instagram'">
            <svg viewBox="0 0 90 90" class="brand-icon">
              <defs>
                <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                  <stop offset="0%" stop-color="#fdf497"/>
                  <stop offset="5%" stop-color="#fdf497"/>
                  <stop offset="45%" stop-color="#fd5949"/>
                  <stop offset="60%" stop-color="#d6249f"/>
                  <stop offset="90%" stop-color="#285AEB"/>
                </radialGradient>
              </defs>
              <rect width="90" height="90" rx="20" fill="url(#ig-grad)"/>
              <circle cx="45" cy="45" r="17" fill="none" stroke="white" stroke-width="5"/>
              <circle cx="66" cy="24" r="5" fill="white"/>
            </svg>
          </template>

          <!-- Noticeboard -->
          <template v-else-if="app.type === 'noticeboard'">
            <svg viewBox="0 0 80 80" class="brand-icon" style="width:64px">
              <rect x="8" y="16" width="64" height="52" rx="6" fill="none" stroke="#374151" stroke-width="4"/>
              <line x1="28" y1="10" x2="28" y2="24" stroke="#374151" stroke-width="4" stroke-linecap="round"/>
              <line x1="52" y1="10" x2="52" y2="24" stroke="#374151" stroke-width="4" stroke-linecap="round"/>
              <polygon points="40,32 34,48 40,44 46,48" fill="#f59e0b"/>
              <line x1="28" y1="55" x2="52" y2="55" stroke="#374151" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </template>

          <!-- RSS Feed -->
          <template v-else-if="app.type === 'rss-feed'">
            <svg viewBox="0 0 80 80" class="brand-icon" style="width:64px">
              <rect width="80" height="80" rx="14" fill="#fdc704"/>
              <circle cx="22" cy="58" r="8" fill="white"/>
              <path d="M18 36c14 0 26 12 26 26" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
              <path d="M18 18c24 0 44 20 44 44" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
            </svg>
          </template>

          <!-- Google Slides -->
          <template v-else-if="app.type === 'google-slides'">
            <svg viewBox="0 0 80 80" class="brand-icon" style="width:64px">
              <rect x="10" y="8" width="60" height="64" rx="6" fill="#F4B400"/>
              <rect x="10" y="8" width="60" height="64" rx="6" fill="white"/>
              <path d="M50 8 L70 28 L50 28 Z" fill="#F4B400" opacity="0.4"/>
              <rect x="50" y="8" width="20" height="20" rx="0" fill="none"/>
              <path d="M50 8 L70 8 L70 28 L50 28Z" fill="#F4B400" opacity="0.5"/>
              <rect x="20" y="38" width="40" height="5" rx="2" fill="#F4B400"/>
              <rect x="20" y="50" width="30" height="5" rx="2" fill="#F4B400"/>
            </svg>
          </template>

          <!-- Clock -->
          <template v-else-if="app.type === 'clock'">
            <svg viewBox="0 0 80 80" class="brand-icon" style="width:64px">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#10b981" stroke-width="6"/>
              <line x1="40" y1="16" x2="40" y2="40" stroke="#10b981" stroke-width="5" stroke-linecap="round"/>
              <line x1="40" y1="40" x2="56" y2="48" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
              <circle cx="40" cy="40" r="4" fill="#10b981"/>
            </svg>
          </template>

          <!-- Countdown -->
          <template v-else-if="app.type === 'countdown'">
            <svg viewBox="0 0 80 80" class="brand-icon" style="width:64px">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#ef4444" stroke-width="6"/>
              <text x="40" y="48" text-anchor="middle" font-size="28" font-weight="bold" fill="#ef4444">00</text>
            </svg>
          </template>

          <!-- QR Code -->
          <template v-else-if="app.type === 'qr-code'">
            <svg viewBox="0 0 80 80" class="brand-icon" style="width:64px">
              <rect x="10" y="10" width="24" height="24" rx="2" fill="none" stroke="#374151" stroke-width="4"/>
              <rect x="16" y="16" width="12" height="12" rx="1" fill="#374151"/>
              <rect x="46" y="10" width="24" height="24" rx="2" fill="none" stroke="#374151" stroke-width="4"/>
              <rect x="52" y="16" width="12" height="12" rx="1" fill="#374151"/>
              <rect x="10" y="46" width="24" height="24" rx="2" fill="none" stroke="#374151" stroke-width="4"/>
              <rect x="16" y="52" width="12" height="12" rx="1" fill="#374151"/>
              <rect x="46" y="46" width="6" height="6" rx="1" fill="#374151"/>
              <rect x="58" y="46" width="6" height="6" rx="1" fill="#374151"/>
              <rect x="46" y="58" width="6" height="6" rx="1" fill="#374151"/>
              <rect x="58" y="58" width="6" height="6" rx="1" fill="#374151"/>
            </svg>
          </template>
        </div>

        <h3 class="app-name">{{ app.name.toUpperCase() }}</h3>
        <p class="app-count">{{ store.getCount(app.type) }} instance{{ store.getCount(app.type) !== 1 ? 's' : '' }} added</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { APP_TYPES } from '@/stores/applications'
import { useApplicationsStore } from '@/stores/applications'

const store = useApplicationsStore()
</script>

<style scoped>
.apps-page {
  padding: 24px 32px;
  background: #f5f7fa;
  min-height: 100vh;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.app-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 32px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.app-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.app-icon-wrap {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-icon {
  width: 80px;
  height: 80px;
}

/* News Ticker special icon */
.news-icon {
  width: 100px;
  height: 68px;
  background: #1a1a2e;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.news-top {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 2px;
}

.news-bottom {
  background: #e53935;
  color: white;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 4px 8px;
  text-align: center;
}

.app-name {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  text-align: center;
  letter-spacing: 0.5px;
  margin: 0;
}

.app-count {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
  text-align: center;
}

@media (max-width: 1200px) {
  .apps-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .apps-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .apps-page { padding: 16px; }
  .apps-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>
