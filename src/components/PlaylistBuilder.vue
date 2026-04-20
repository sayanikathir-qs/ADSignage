<script setup>
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import { media as mockMedia } from '@/data/mockData'
import { toast } from 'vue3-toastify'

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back'])

// Available items (left pane)
const availableMedia = ref([...mockMedia])

// Selected items (right pane drop zone)
const playlistItems = ref([])

const tabs = ['Media', 'Library', 'Canvas', 'Apps', 'Settings']
const activeTab = ref('Media')

const getIcon = (type) => {
  switch (type) {
    case 'video': return 'mdi-video'
    case 'image': return 'mdi-image'
    case 'html': return 'mdi-language-html5'
    case 'pdf': return 'mdi-file-pdf-box'
    default: return 'mdi-file'
  }
}

const getIconColor = (type) => {
  switch (type) {
    case 'video': return 'indigo'
    case 'image': return 'teal'
    case 'html': return 'warning'
    case 'pdf': return 'error'
    default: return 'grey'
  }
}

// Duration utilities
const parseDuration = (durStr) => {
  if (!durStr) return 10; // Default 10 seconds for items like images
  const parts = durStr.split(':').reverse();
  let seconds = 0;
  for (let i = 0; i < parts.length; i++) {
    seconds += parseInt(parts[i], 10) * Math.pow(60, i);
  }
  return seconds;
}

const totalDurationSecs = computed(() => {
  return playlistItems.value.reduce((total, item) => total + parseDuration(item.duration), 0);
})

const totalDurationFormatted = computed(() => {
  const duration = totalDurationSecs.value;
  const h = Math.floor(duration / 3600).toString().padStart(2, '0');
  const m = Math.floor((duration % 3600) / 60).toString().padStart(2, '0');
  const s = (duration % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
})

// Preview
const previewDialog = ref(false)
const currentPreviewIndex = ref(0)
const handlePreview = () => {
  if (playlistItems.value.length === 0) return
  currentPreviewIndex.value = 0
  previewDialog.value = true
}

const publishPlaylist = () => {
  console.log('Publishing playlist:', props.playlist)
  console.log('Playlist items:', playlistItems.value)
  if(playlistItems.value.length > 0){
    toast.success('Playlist published successfully')
    return
  }
  
}
</script>

<template>
  <div class="builder-container">
    <!-- Header -->
    <div class="builder-header">
      <div class="d-flex align-center ga-2">
        <v-btn icon="mdi-menu" variant="text" color="#14b8a6"></v-btn>
        <span class="text-h6 font-weight-bold">{{ props.playlist.name }}</span>
      </div>
      <div class="header-actions">
        <v-btn prepend-icon="mdi-publish" color="#14b8a6" variant="flat" class="text-none text-white" @click="publishPlaylist">Publish</v-btn>
        <v-btn prepend-icon="mdi-eye" color="#14b8a6" variant="outlined" class="text-none" @click="handlePreview" :disabled="playlistItems.length === 0">Preview</v-btn>
        <v-btn prepend-icon="mdi-arrow-left"  color="#14b8a6" variant="flat" class="text-none text-white" @click="emit('back')">  Back</v-btn> 
      </div>
    </div>

    <!-- Main Content -->
    <div class="builder-content">
      <!-- Left Panel -->
      <div class="panel source-panel">
        <p class="text-body-2 text-medium-emphasis mb-4">Use Drag and Drop to add items to playlist</p>
        
        <v-tabs v-model="activeTab" color="#14b8a6" class="mb-4">
          <v-tab v-for="tab in tabs" :key="tab" :value="tab" class="text-none">{{ tab }}</v-tab>
        </v-tabs>

        <div class="tab-content" v-if="activeTab === 'Media'">
          <draggable
            v-model="availableMedia"
            :group="{ name: 'media', pull: 'clone', put: false }"
            item-key="id"
            class="draggable-list"
            :clone="(item) => ({ ...item, uniqueId: Date.now() + Math.random() })"
          >
            <template #item="{ element }">
              <div class="media-list-item">
                <div class="item-info">
                  <span class="item-name">{{ element.name }}</span>
                  <div class="item-meta mt-1">
                    <span :class="`badge bg-${getIconColor(element.type)}`">{{ element.type }}</span>
                    <span class="text-caption text-medium-emphasis ml-2">{{ element.date }}</span>
                  </div>
                </div>
                <v-icon :color="getIconColor(element.type)">{{ getIcon(element.type) }}</v-icon>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="panel target-panel">
        <div class="d-flex justify-space-between align-center mb-4 pb-2 border-bottom">
          <span class="text-subtitle-1 font-weight-bold" style="color: #14b8a6">{{ props.playlist.name }}</span>
          <v-chip color="error" size="small" class="font-weight-bold rounded text-white">Total Duration - {{ totalDurationFormatted }}</v-chip>
        </div>

        <draggable
          v-model="playlistItems"
          group="media"
          item-key="uniqueId"
          class="drop-zone"
          :class="{ 'is-empty': playlistItems.length === 0 }"
        >
          <template #item="{ element, index }">
            <div class="playlist-row-item">
              <div class="drag-handle mr-2">
                <v-icon size="small" color="grey">mdi-drag-horizontal</v-icon>
              </div>
              <v-icon :color="getIconColor(element.type)" class="mr-3">{{ getIcon(element.type) }}</v-icon>
              <div class="item-info">
                <span class="item-name">{{ element.name }}</span>
                <span class="text-caption text-medium-emphasis">{{ element.duration || '00:10' }}</span>
              </div>
              <v-spacer></v-spacer>
              <v-btn icon="mdi-close" size="small" variant="text" color="grey" @click="playlistItems.splice(index, 1)"></v-btn>
            </div>
          </template>

          <template #footer v-if="playlistItems.length === 0">
            <div class="empty-drop">
              <v-icon color="#14b8a6" size="24" class="mr-2">mdi-file-document-outline</v-icon>
              <span style="color: #14b8a6">Please Drop your Media Files here</span>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Preview Dialog -->
    <v-dialog v-model="previewDialog" fullscreen transition="dialog-bottom-transition">
      <v-card class="bg-black">
        <v-toolbar color="rgba(0,0,0,0.8)" class="text-white">
          <v-btn icon variant="text" @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="font-weight-bold">Playlist Preview - {{ props.playlist.name }}</v-toolbar-title>
        </v-toolbar>
        
        <v-card-text class="pa-0 bg-black">
          <v-carousel v-model="currentPreviewIndex" hide-delimiters show-arrows="hover" height="calc(100vh - 64px)">
            <v-carousel-item v-for="(item, i) in playlistItems" :key="i">
              <v-sheet height="100%" width="100%" color="transparent" class="d-flex flex-column align-center justify-center">
                <v-icon size="120" :color="getIconColor(item.type)">{{ getIcon(item.type) }}</v-icon>
                <h2 class="text-white mt-6">{{ item.name }}</h2>
                <div class="d-flex align-center mt-4">
                  <v-chip :color="getIconColor(item.type)" class="mr-3 text-uppercase font-weight-bold">{{ item.type }}</v-chip>
                  <span class="text-medium-emphasis text-h6">Duration: {{ item.duration || '00:10' }}</span>
                </div>
              </v-sheet>
            </v-carousel-item>
          </v-carousel>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.builder-container {
  height: calc(100vh - 80px); /* Adjust to fit below app header */
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.builder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  min-height: 64px;
  border-bottom: 2px solid #f3f4f6;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.builder-content {
  display: flex;
  flex: 1;
  padding: 24px;
  gap: 24px;
  overflow: hidden;
}

.panel {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.draggable-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.media-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px dashed #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
}

.media-list-item:hover {
  border-color: #14b8a6;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: #1f2937;
}

.item-meta {
  display: flex;
  align-items: center;
}

.badge {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
  font-weight: bold;
  text-transform: capitalize;
}
.bg-indigo { background: #4f46e5; }
.bg-teal { background: #14b8a6; }
.bg-warning { background: #f59e0b; }
.bg-error { background: #ef4444; }
.bg-grey { background: #9ca3af; }

.border-bottom {
  border-bottom: 2px solid #14b8a6;
  margin-bottom: 24px;
}

.drop-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding: 4px;
}

.drop-zone.is-empty {
  justify-content: center;
  align-items: center;
  border: 2px dashed #14b8a6;
  background: rgba(20, 184, 166, 0.05);
  border-radius: 8px;
}

.empty-drop {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.playlist-row-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  cursor: grab;
}

.drag-handle {
  cursor: grab;
}
</style>
