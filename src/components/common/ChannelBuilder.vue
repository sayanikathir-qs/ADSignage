<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Play, 
  Save, 
  Upload, 
  MoreVertical, 
  GripVertical,
  Trash2,
  Clock,
  Calendar,
  Settings,
  Layout,
  List
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

// Channel data
const channelId = ref(route.params.channelId)
const channelName = ref('Sayani')
const activeTab = ref('playlist')

// Playlist items
const playlistItems = ref([
  { id: 1, name: 'OutDoor ADD', duration: '00:00:00', type: 'video' },
  { id: 2, name: 'Sayani', duration: '00:00:06', type: 'video', scheduled: true },
  { id: 3, name: 'DEMO 37', duration: '00:00:34', type: 'video' },
  { id: 4, name: 'YT 2 videos', duration: '00:00:35', type: 'youtube' },
  { id: 5, name: 'ADS - Channel canvas', duration: '00:00:06', type: 'video' },
  { id: 6, name: '10secs tim - YT Channel', duration: '00:00:11', type: 'youtube' },
  { id: 7, name: 'Raindrop - Playlist', duration: '00:00:15', type: 'playlist' },
])

const layouts = ref([
  { id: 1, name: 'Main 01', isDefault: true }
])

const selectedLayout = ref(layouts.value[0])

// Computed
const totalDuration = computed(() => {
  // Calculate total duration logic here
  return '00:01:47'
})

// Methods
const handleBack = () => {
  router.push({ name: 'Channels' })
}

const handleSave = () => {
  // Save channel logic
  console.log('Saving channel...')
}

const handlePreview = () => {
  // Preview logic
  console.log('Previewing channel...')
}

const handlePublish = () => {
  // Publish logic
  console.log('Publishing channel...')
}

const handleDeleteItem = (itemId) => {
  playlistItems.value = playlistItems.value.filter(item => item.id !== itemId)
}

const handleAddPlaylist = () => {
  // Open dialog to add playlist
  console.log('Add playlist')
}

const getItemIcon = (type) => {
  switch(type) {
    case 'youtube': return '📺'
    case 'playlist': return '📋'
    default: return '🎬'
  }
}
</script>

<template>
  <div class="channel-builder">
    <!-- Header -->
    <header class="builder-header">
      <div class="header-left">
        <button class="btn-icon btn-back" @click="handleBack">
          <ArrowLeft :size="20" />
        </button>
        <div class="channel-title">
          <h2>{{ channelName }}</h2>
          <span class="channel-status">Draft</span>
        </div>
      </div>
      
      <div class="header-actions">
        <button class="btn btn-outline" @click="handlePreview">
          <Play :size="16" />
          Preview
        </button>
        <button class="btn btn-outline" @click="handleSave">
          <Save :size="16" />
          Save
        </button>
        <button class="btn btn-primary" @click="handlePublish">
          <Upload :size="16" />
          Publish
        </button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs-container">
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'playlist' }]"
          @click="activeTab = 'playlist'"
        >
          <List :size="16" />
          Playlist
        </button>
        <button 
          :class="['tab', { active: activeTab === 'layout' }]"
          @click="activeTab = 'layout'"
        >
          <Layout :size="16" />
          Layout
        </button>
        <button 
          :class="['tab', { active: activeTab === 'settings' }]"
          @click="activeTab = 'settings'"
        >
          <Settings :size="16" />
          Settings
        </button>
      </div>
      
      <div class="layout-info" v-if="activeTab === 'playlist'">
        <span class="layout-label">{{ selectedLayout.name }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="builder-content">
      <!-- Playlist Tab -->
      <div v-if="activeTab === 'playlist'" class="playlist-view">
        <!-- Left Panel - Available Playlists -->
        <div class="playlist-panel">
          <div class="panel-header">
            <h3>Playlist Items</h3>
            <button class="btn-add" @click="handleAddPlaylist">
              <span>+ Add</span>
            </button>
          </div>
          
          <div class="playlist-items">
            <div 
              v-for="item in playlistItems" 
              :key="item.id"
              class="playlist-item"
            >
              <div class="item-drag">
                <GripVertical :size="16" color="#9ca3af" />
              </div>
              
              <div class="item-icon">
                {{ getItemIcon(item.type) }}
              </div>
              
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-duration">
                  <Clock :size="12" />
                  {{ item.duration }}
                </div>
              </div>
              
              <div class="item-actions">
                <button 
                  v-if="item.scheduled"
                  class="btn-scheduled"
                  title="Scheduled"
                >
                  <Calendar :size="14" />
                </button>
                <button 
                  class="btn-delete"
                  @click="handleDeleteItem(item.id)"
                  title="Delete"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
          
          <div class="playlist-footer">
            <div class="total-duration">
              <Clock :size="16" />
              <span>Total Duration: {{ totalDuration }}</span>
            </div>
          </div>
        </div>

        <!-- Right Panel - Layout Preview -->
        <div class="layout-preview">
          <div class="preview-header">
            <h3>Layout Preview</h3>
            <button class="btn-edit-layout">Edit Layout</button>
          </div>
          
          <div class="preview-screen">
            <div class="screen-placeholder">
              <Layout :size="48" color="#9ca3af" />
              <span>{{ selectedLayout.name }}</span>
            </div>
          </div>
          
          <div class="zone-info">
            <div class="zone-item">
              <span class="zone-name">Main Zone</span>
              <span class="zone-resolution">1920x1080</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Layout Tab -->
      <div v-else-if="activeTab === 'layout'" class="layout-view">
        <div class="layout-grid">
          <div 
            v-for="layout in layouts" 
            :key="layout.id"
            :class="['layout-card', { selected: selectedLayout.id === layout.id }]"
            @click="selectedLayout = layout"
          >
            <div class="layout-thumbnail">
              <Layout :size="64" color="#14b8a6" />
            </div>
            <div class="layout-name">{{ layout.name }}</div>
            <div v-if="layout.isDefault" class="layout-badge">Default</div>
          </div>
          
          <div class="layout-card add-layout">
            <div class="add-layout-content">
              <span class="add-icon">+</span>
              <span>Add Layout</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-else-if="activeTab === 'settings'" class="settings-view">
        <div class="settings-section">
          <h3>Channel Information</h3>
          <div class="form-group">
            <label>Channel Name</label>
            <input type="text" v-model="channelName" class="form-input" />
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Playback Settings</h3>
          <div class="form-group">
            <label>Repeat Mode</label>
            <select class="form-select">
              <option>Loop Continuously</option>
              <option>Play Once</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.channel-builder {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}

/* Header */
.builder-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-back:hover {
  background-color: #f3f4f6;
  color: #14b8a6;
}

.channel-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.channel-title h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.channel-status {
  background-color: #fef3c7;
  color: #d97706;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-outline:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  background-color: #14b8a6;
  border: 1px solid #14b8a6;
  color: white;
}

.btn-primary:hover {
  background-color: #0d9488;
  border-color: #0d9488;
}

/* Tabs */
.tabs-container {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.tab:hover {
  color: #14b8a6;
}

.tab.active {
  color: #14b8a6;
  border-bottom-color: #14b8a6;
}

.layout-info {
  padding: 1rem 0;
}

.layout-label {
  background-color: #f3f4f6;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

/* Main Content */
.builder-content {
  flex: 1;
  padding: 2rem;
  overflow: auto;
}

/* Playlist View */
.playlist-view {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  height: calc(100vh - 250px);
}

.playlist-panel {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.btn-add {
  background-color: #14b8a6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-add:hover {
  background-color: #0d9488;
}

.playlist-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  cursor: move;
  transition: all 0.2s;
}

.playlist-item:hover {
  background-color: #f3f4f6;
  border-color: #d1d5db;
}

.item-drag {
  cursor: move;
  padding: 0.25rem;
}

.item-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 6px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-duration {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-scheduled {
  background: none;
  border: none;
  color: #14b8a6;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-scheduled:hover {
  background-color: #f3f4f6;
}

.btn-delete {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.btn-delete:hover {
  background-color: #fef2f2;
}

.playlist-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.total-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
}

/* Layout Preview */
.layout-preview {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.btn-edit-layout {
  background: none;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-edit-layout:hover {
  background-color: #f9fafb;
}

.preview-screen {
  flex: 1;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.screen-placeholder {
  text-align: center;
  color: #6b7280;
}

.screen-placeholder span {
  display: block;
  margin-top: 0.75rem;
  font-weight: 500;
}

.zone-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.zone-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.zone-name {
  font-weight: 500;
  color: #374151;
}

.zone-resolution {
  color: #6b7280;
}

/* Layout View */
.layout-view {
  max-width: 800px;
  margin: 0 auto;
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.layout-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.layout-card:hover {
  border-color: #14b8a6;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
}

.layout-card.selected {
  border-color: #14b8a6;
  background-color: #f0fdfa;
}

.layout-thumbnail {
  margin-bottom: 1rem;
}

.layout-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.5rem;
}

.layout-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: #14b8a6;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.add-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
}

.add-layout-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.add-icon {
  font-size: 2rem;
  color: #14b8a6;
}

/* Settings View */
.settings-view {
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-section h3 {
  margin: 0 0 1.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}
</style>