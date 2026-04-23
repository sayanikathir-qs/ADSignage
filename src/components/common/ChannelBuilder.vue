<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import {
  ArrowLeft,
  Play,
  Save,
  Upload,
  Trash2,
  Calendar,
  Settings,
  Layout,
  List,
  FolderOpen,
  X,
  ExternalLink,
} from 'lucide-vue-next'
import { usePlaylistStore } from '@/stores/playlist'
import { useChannelsStore } from '@/stores/channel'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()

const channelId = ref(route.params.channelId)
const channelName = ref('')
const activeTab = ref('playlist')

// Channel items (right panel - drop zone)
const channelItems = ref([])

const layouts = ref([{ id: 1, name: 'Main 01', isDefault: true }])
const selectedLayout = ref(layouts.value[0])

// Schedule modal state
const showScheduleModal = ref(false)
const showPreviewModal = ref(false)
const selectedItemIndex = ref(null)
const selectedItem = ref(null)

const playlistStore = usePlaylistStore()
const channelStore = useChannelsStore()

// Load real playlists and channel data on mount
onMounted(async () => {
  await playlistStore.fetchPlaylists()
  await channelStore.fetchChannels()
  const channel = channelStore.getById(Number(channelId.value))
  if (channel) {
    channelName.value = channel.name
    channelItems.value = channel.items || []
  }
})

// Map store data to the shape ChannelBuilder needs
const availablePlaylists = computed(() =>
  playlistStore.getAll.map(p => ({
    id: p.id,
    name: p.name,
    duration: p.duration || '00:00:00',
    type: p.type || 'video',
  }))
)

const scheduleData = ref({
  dateRange: {
    start: '15/04/2026',
    end: '15/05/2026'
  },
  weeklySchedule: {
    Monday: { start: '12:06', end: '12:06' },
    Tuesday: { start: '00:00', end: '00:00' },
    Wednesday: { start: '00:00', end: '00:00' },
    Thursday: { start: '00:00', end: '00:00' },
    Friday: { start: '00:00', end: '00:00' },
    Saturday: { start: '00:00', end: '00:00' },
    Sunday: { start: '00:00', end: '00:00' }
  }
})

const parseDuration = (durStr) => {
  if (!durStr) return 0
  const parts = durStr.split(':').reverse()
  let seconds = 0
  for (let i = 0; i < parts.length; i++) {
    seconds += parseInt(parts[i] || 0, 10) * Math.pow(60, i)
  }
  return seconds
}

const totalDuration = computed(() => {
  const secs = channelItems.value.reduce((sum, item) => sum + parseDuration(item.duration), 0)
  const h = Math.floor(secs / 3600).toString().padStart(2, '0')
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const handleBack = () => router.push({ name: 'Channels' })

const handleSave = async () => {
  await channelStore.updateChannel(Number(channelId.value), {
    name: channelName.value,
    items: channelItems.value,
  })
  toast.success('Channel saved')
}

const handlePreview = () => {
  showPreviewModal.value = true
}

const handlePublish = async () => {
  await channelStore.updateChannel(Number(channelId.value), {
    name: channelName.value,
    items: channelItems.value,
    status: 'Published',
  })
  toast.success('Channel published successfully')
}

const handleDeleteItem = (index) => {
  channelItems.value.splice(index, 1)
}

const openScheduleModal = (item, index) => {
  selectedItem.value = item
  selectedItemIndex.value = index
  showScheduleModal.value = true
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  selectedItem.value = null
  selectedItemIndex.value = null
}

const handleSchedule = () => {
  if (selectedItemIndex.value !== null) {
    channelItems.value[selectedItemIndex.value] = {
      ...channelItems.value[selectedItemIndex.value],
      scheduled: true,
      scheduleData: JSON.parse(JSON.stringify(scheduleData.value)),
    }
  }
  closeScheduleModal()
}

</script>

<template>
  <div class="channel-builder">
    <!-- Top Header -->
    <header class="builder-header">
      <div class="header-left">
        <button class="btn-back" @click="handleBack">
          <ArrowLeft :size="20" />
        </button>
        <div class="channel-info">
          <h1 class="channel-title">{{ channelName }}</h1>
          <span class="draft-badge">Draft</span>
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
      
      <div class="layout-selector" v-if="activeTab === 'playlist'">
        <span class="layout-name">{{ selectedLayout.name }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Playlist Tab -->
      <div v-if="activeTab === 'playlist'" class="playlist-layout">
        <!-- Left Panel - Available Playlists -->
        <div class="left-panel">
          <div class="panel-header">
            <h2 class="panel-title">
              <FolderOpen :size="18" class="mr-2" />
              Available Playlists
            </h2>
          </div>
          
          <p class="drag-hint">Use Drag and Drop to add items to channel</p>
          
          <div class="playlist-list">
            <draggable
              v-model="availablePlaylists"
              :group="{ name: 'channel', pull: 'clone', put: false }"
              item-key="id"
              class="draggable-list"
              :clone="(item) => ({ ...item, uniqueId: Date.now() + Math.random() })"
            >
              <template #item="{ element }">
                <div class="playlist-item">
                  <div class="item-info">
                    <div class="item-name">
                      {{ element.name }}
                      <ExternalLink :size="14" style="margin-left:4px;opacity:0.5;vertical-align:middle" />
                    </div>
                    <div class="item-duration">{{ element.duration }}</div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- Right Panel - Channel Drop Zone -->
        <div class="right-panel">
          <div class="preview-header">
            <h2 class="preview-title">
              <Layout :size="18" class="mr-2" />
              {{ selectedLayout.name }}
            </h2>
            <span class="total-badge">
              Total: {{ totalDuration }}
            </span>
          </div>
          
          <draggable
            v-model="channelItems"
            group="channel"
            item-key="uniqueId"
            class="drop-zone"
            :class="{ 'is-empty': channelItems.length === 0 }"
          >
            <template #item="{ element, index }">
              <div :class="['channel-item', element.scheduled ? 'is-scheduled' : 'is-inactive']">
                <div class="item-info">
                  <div class="item-name">
                    {{ element.name }}
                    <ExternalLink :size="14" style="margin-left:4px;opacity:0.5;vertical-align:middle" />
                  </div>
                  <div class="item-duration">{{ element.duration }}</div>
                </div>

                <span :class="['status-chip', element.scheduled ? 'chip-scheduled' : 'chip-inactive']">
                  {{ element.scheduled ? 'Scheduled' : 'Inactive' }}
                </span>

                <div class="item-actions">
                  <button
                    class="btn-action btn-schedule-action"
                    @click.stop="openScheduleModal(element, index)"
                  >
                    <Calendar :size="14" />
                    Schedule
                  </button>
                  <button
                    class="btn-action btn-delete"
                    @click.stop="handleDeleteItem(index)"
                  >
                    <Trash2 :size="14" />
                    Delete
                  </button>
                </div>
              </div>
            </template>

            <template #footer v-if="channelItems.length === 0">
              <div class="empty-drop">
                <Layout :size="48" color="#fdc704" />
                <span style="color: #fdc704">Drop playlists here to build your channel</span>
              </div>
            </template>
          </draggable>
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
              <Layout :size="64" color="#fdc704" />
            </div>
            <div class="layout-name">{{ layout.name }}</div>
            <div v-if="layout.isDefault" class="layout-badge">Default</div>
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
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay" @click.self="showPreviewModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Channel Preview — {{ channelName }}</h3>
          <button class="btn-close" @click="showPreviewModal = false">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <div v-if="channelItems.length === 0" class="preview-empty">
            <Layout :size="48" color="#fdc704" />
            <p>No playlists added to this channel yet.</p>
          </div>
          <div v-else class="preview-list">
            <div v-for="(item, i) in channelItems" :key="i" class="preview-item">
              <span class="preview-index">{{ i + 1 }}</span>
              <div class="preview-item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-duration">{{ item.duration }}</div>
              </div>
              <span :class="['status-chip', item.scheduled ? 'chip-scheduled' : 'chip-inactive']">
                {{ item.scheduled ? 'Scheduled' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <span class="total-badge">Total: {{ totalDuration }}</span>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click.self="closeScheduleModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Schedule Timing</h3>
          <button class="btn-close" @click="closeScheduleModal">
            <X :size="20" />
          </button>
        </div>
        
        <div class="modal-body">
          <div class="date-range-section">
            <label class="section-label">Date Range</label>
            <div class="date-range-input">
              <input 
                type="text" 
                v-model="scheduleData.dateRange.start" 
                class="date-input"
                placeholder="DD/MM/YYYY"
              />
              <span class="date-separator">-</span>
              <input 
                type="text" 
                v-model="scheduleData.dateRange.end" 
                class="date-input"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>

          <div class="weekly-schedule">
            <div 
              v-for="day in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']" 
              :key="day"
              class="day-row"
            >
              <span class="day-label">{{ day }}</span>
              <div class="time-inputs">
                <div class="time-input-group">
                  <input 
                    type="time" 
                    v-model="scheduleData.weeklySchedule[day].start"
                    class="time-input"
                  />
                </div>
                <span class="time-separator">-</span>
                <div class="time-input-group">
                  <input 
                    type="time" 
                    v-model="scheduleData.weeklySchedule[day].end"
                    class="time-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-schedule-submit" @click="handleSchedule">
            Schedule
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.channel-builder {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background-color: #f8fafc;
}

/* Header */
.builder-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
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
  color: #64748b;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-back:hover {
  background-color: #f1f5f9;
  color: #fdc704;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.channel-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.draft-badge {
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
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
}

.btn-outline {
  background: white;
  color: #475569;
}

.btn-outline:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
}

.btn-primary {
  background-color: #fdc704;
  border-color: #fdc704;
  color: white;
}

.btn-primary:hover {
  background-color: #e6b400;
  border-color: #e6b400;
}

/* Tabs */
.tabs-container {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 0;
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
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  transition: all 0.2s;
}

.tab:hover {
  color: #fdc704;
}

.tab.active {
  color: #fdc704;
  border-bottom-color: #fdc704;
}

.layout-selector {
  padding: 1rem 0;
}

.layout-name {
  background-color: #f1f5f9;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow: auto;
}

.playlist-layout {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 2rem;
  height: calc(100vh - 280px);
}

/* Left Panel */
.left-panel {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-self: start;
}

.panel-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
}

.panel-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.drag-hint {
  padding: 0 1.5rem;
  margin: 0.75rem 0;
  font-size: 0.875rem;
  color: #64748b;
  font-style: italic;
}

.playlist-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.draggable-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background-color: #f8fafc;
  border: 1px dashed #fdc704;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
}

.playlist-item:hover {
  background-color: #f1f5f9;
  border-color: #fdc704;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
}

.item-drag {
  cursor: grab;
  padding: 0.25rem;
}

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.item-duration {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8rem;
  color: #64748b;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-schedule-action {
  background: #eff6ff;
  color: #3b82f6;
  border: 1px solid #bfdbfe;
}

.btn-schedule-action:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

.btn-delete {
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
}

.btn-delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.status-chip {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

.chip-scheduled {
  background: #dcfce7;
  color: #16a34a;
}

.chip-inactive {
  background: #f1f5f9;
  color: #94a3b8;
}

/* Right Panel */
.right-panel {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #fdc704;
}

.preview-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #fdc704;
  display: flex;
  align-items: center;
}

.total-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #fee2e2;
  color: #dc2626;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.drop-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  padding: 4px;
  min-height: 300px;
}

.drop-zone.is-empty {
  justify-content: center;
  align-items: center;
  border: 2px dashed #fdc704;
  background: rgba(20, 184, 166, 0.05);
  border-radius: 8px;
}

.empty-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  color: #fdc704;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
}

.channel-item:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.channel-item:active {
  cursor: grabbing;
}

.channel-item.is-scheduled {
  border-left: 3px solid #22c55e;
}

.channel-item.is-inactive {
  border-left: 3px solid #e2e8f0;
  opacity: 0.85;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #64748b;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background-color: #f1f5f9;
  color: #1e293b;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.date-range-section {
  margin-bottom: 2rem;
}

.section-label {
  display: block;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.date-range-input {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.date-input {
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #1e293b;
  width: 120px;
  text-align: center;
}

.date-input:focus {
  outline: none;
}

.date-separator {
  color: #94a3b8;
  font-weight: 500;
}

.weekly-schedule {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.day-label {
  width: 100px;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.time-input-group {
  flex: 1;
}

.time-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  background: white;
}

.time-input:focus {
  outline: none;
  border-color: #fdc704;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.time-separator {
  color: #94a3b8;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn-schedule-submit {
  background: #fdc704;
  color: #1e293b;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-schedule-submit:hover {
  background: #f59e0b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

/* Preview Modal */
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #94a3b8;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.preview-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdc704;
  color: white;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.preview-item-info {
  flex: 1;
  min-width: 0;
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
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.layout-card:hover {
  border-color: #fdc704;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
}

.layout-card.selected {
  border-color: #fdc704;
  background-color: #f0fdfa;
}

.layout-thumbnail {
  margin-bottom: 1rem;
}

.layout-name {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.layout-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: #fdc704;
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

/* Settings View */
.settings-view {
  max-width: 600px;
  margin: 0 auto;
}

.settings-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.settings-section h3 {
  margin: 0 0 1.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #fdc704;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.mr-2 {
  margin-right: 0.5rem;
}
</style>