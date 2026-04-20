<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { 
  LayoutDashboard, Monitor, List, PlaySquare, Image, 
  Grid, Video, CreditCard, Package, Download, 
  Menu, Send, Eye, Save, ExternalLink, Trash2, Clock, Plus, Settings, Layout 
} from 'lucide-vue-next'

const route = useRoute()
const activeTab = ref('playlist')
const channelName = ref(route.query.name || 'Sayani')

// Mock playlist data (replace with API call)
const playlists = ref([
  { id: 1, name: 'OutDoor ADD', duration: '00:00:00' },
  { id: 2, name: 'Sayani', duration: '00:00:06' },
  { id: 3, name: 'DEMO 37', duration: '00:00:34' },
  { id: 4, name: 'YT 2 videos', duration: '00:00:35' },
  { id: 5, name: 'ADS - Channel canvas', duration: '00:00:06' },
  { id: 6, name: '10secs tim - YT Channel', duration: '00:00:11' },
  { id: 7, name: 'Raindrop - Playlist', duration: '00:00:15' }
])

const canvasItems = ref([
  { id: 2, name: 'Sayani', duration: '00:00:06' }
])

const addToCanvas = (item) => {
  if (!canvasItems.value.find(i => i.id === item.id)) {
    canvasItems.value.push({ ...item })
  }
}

const removeFromCanvas = (id) => {
  canvasItems.value = canvasItems.value.filter(item => item.id !== id)
}

const handlePublish = () => console.log('Publishing channel...')
const handlePreview = () => console.log('Opening preview...')
const handleSave = () => console.log('Saving channel...')
</script>

<template>
  <div class="channel-builder">


    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <Menu :size="20" class="menu-icon" />
          <input 
            v-model="channelName" 
            class="channel-name-input" 
            placeholder="Channel Name"
          />
        </div>
        
        <div class="header-actions">
          <button class="btn-action" @click="handlePublish">
            <Send :size="14" /> Publish
          </button>
          <button class="btn-action" @click="handlePreview">
            <Eye :size="14" /> Preview
          </button>
          <button class="btn-action" @click="handleSave">
            <Save :size="14" /> Save
          </button>
        </div>
      </header>

      <!-- Builder Area -->
      <div class="builder-container">
        <!-- Left Panel: Playlist -->
        <div class="panel left-panel">
          <div class="tabs">
            <button 
              :class="['tab', { active: activeTab === 'playlist' }]"
              @click="activeTab = 'playlist'"
            >Playlist</button>
            <button 
              :class="['tab', { active: activeTab === 'layout' }]"
              @click="activeTab = 'layout'"
            >Layout</button>
            <button 
              :class="['tab', { active: activeTab === 'settings' }]"
              @click="activeTab = 'settings'"
            >Settings</button>
          </div>

          <div class="playlist-scroll">
            <div 
              v-for="item in playlists" 
              :key="item.id" 
              class="playlist-item"
              @click="addToCanvas(item)"
            >
              <div class="item-header">
                <span class="item-name">{{ item.name }}</span>
                <ExternalLink :size="12" class="edit-icon" />
              </div>
              <span class="duration-badge">{{ item.duration }}</span>
            </div>
          </div>
        </div>

        <!-- Right Panel: Canvas -->
        <div class="panel right-panel">
          <div class="canvas-header">Main 01</div>
          <div class="canvas-area">
            <div v-if="canvasItems.length === 0" class="empty-state">
              Click a playlist item to add it here
            </div>
            
            <div 
              v-for="item in canvasItems" 
              :key="item.id" 
              class="canvas-item"
            >
              <div class="canvas-item-header">
                <span class="item-name">{{ item.name }}</span>
                <ExternalLink :size="12" class="edit-icon" />
              </div>
              <div class="canvas-item-actions">
                <span class="duration-badge">{{ item.duration }}</span>
                <button class="btn-schedule">Schedule</button>
                <button class="btn-delete" @click="removeFromCanvas(item.id)">
                  <Trash2 :size="12" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* CSS Variables for theming */
:root {
  --sidebar-bg: #1e293b;
  --sidebar-text: #94a3b8;
  --sidebar-active: #f59e0b;
  --sidebar-active-bg: rgba(245, 158, 11, 0.1);
  --main-bg: #f8fafc;
  --card-bg: #ffffff;
  --border-color: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent: #f59e0b;
  --accent-hover: #d97706;
  --badge-bg: #fef3c7;
  --badge-text: #92400e;
  --schedule-bg: #ccfbf1;
  --schedule-text: #0f766e;
  --delete-bg: #ffe4e6;
  --delete-text: #be123c;
}

.channel-builder {
  display: flex;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--main-bg);
  color: var(--text-primary);
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.logo-text {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active);
  border-left: 3px solid var(--sidebar-active);
  font-weight: 500;
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-header {
  height: 64px;
  background: var(--main-bg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-icon {
  color: var(--text-secondary);
  cursor: pointer;
}

.channel-name-input {
  background: transparent;
  border: none;
  border-bottom: 1px dashed var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  padding: 0.25rem 0;
  outline: none;
  width: 200px;
}

.channel-name-input:focus {
  border-bottom-color: var(--accent);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  background: var(--accent);
  padding: 0.25rem;
  border-radius: 6px;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Builder Container */
.builder-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  flex: 1;
  overflow: hidden;
}

.panel {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Left Panel */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem;
}

.tab {
  padding: 1rem 0;
  margin-right: 1.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: var(--accent);
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  border-radius: 2px;
}

.playlist-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playlist-item {
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.playlist-item:hover {
  border-color: var(--accent);
  background: #fffbeb;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.edit-icon {
  color: var(--text-secondary);
  cursor: pointer;
}

.duration-badge {
  display: inline-block;
  background: var(--badge-bg);
  color: var(--badge-text);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
}

/* Right Panel */
.canvas-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.canvas-area {
  flex: 1;
  padding: 1rem 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  padding: 3rem 0;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
}

.canvas-item {
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.canvas-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-schedule {
  background: var(--schedule-bg);
  color: var(--schedule-text);
  border: none;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-delete {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--delete-bg);
  color: var(--delete-text);
  border: none;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: auto;
}

.btn-delete:hover {
  background: #fecdd3;
}

/* Scrollbar Styling */
.playlist-scroll::-webkit-scrollbar,
.canvas-area::-webkit-scrollbar {
  width: 6px;
}

.playlist-scroll::-webkit-scrollbar-thumb,
.canvas-area::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.playlist-scroll::-webkit-scrollbar-thumb:hover,
.canvas-area::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>