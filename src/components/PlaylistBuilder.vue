<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'
import { useMediaStore } from '@/stores/media'
import { usePlaylistStore } from '@/stores/playlist'
import { toast } from 'vue3-toastify'

const props = defineProps({
  playlist: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['back'])

const mediaStore = useMediaStore()
const playlistStore = usePlaylistStore()

// Folders and navigation state
const currentFolderId = ref(null)
const folderPath = ref([])

const currentFolders = computed(() => {
  return mediaStore.folders.filter(f => f.parentId === currentFolderId.value)
})

const currentMedia = computed(() => {
  // We need to handle null or undefined folderId for root level media
  return mediaStore.mediaItems.filter(m => {
    if (currentFolderId.value) {
      return m.folderId === currentFolderId.value
    } else {
      return !m.folderId
    }
  })
})

const navigateToFolder = (folder) => {
  currentFolderId.value = folder.id
  folderPath.value.push(folder)
}

const navigateUp = () => {
  folderPath.value.pop()
  if (folderPath.value.length > 0) {
    currentFolderId.value = folderPath.value[folderPath.value.length - 1].id
  } else {
    currentFolderId.value = null
  }
}

const navigateToRoot = () => {
  currentFolderId.value = null
  folderPath.value = []
}

// Selected items (right pane drop zone)
const playlistItems = ref([])

const showDuplicateWarning = ref(false)
const duplicateMediaName = ref('')

const onPlaylistChange = (evt) => {
  if (!evt.added) return
  const added = evt.added.element
  const isDuplicate = playlistItems.value.filter(i => i.id === added.id).length > 1
  if (isDuplicate) {
    duplicateMediaName.value = added.name
    showDuplicateWarning.value = true
  }
}

const tabs = ['Media', 'Library', 'Canvas', 'Apps', 'Settings']
const activeTab = ref('Media')

onMounted(async () => {
  await mediaStore.fetchMedia()
  await mediaStore.fetchFolders()
  await playlistStore.fetchPlaylists()
  // Restore previously saved items for this playlist
  const saved = playlistStore.getById(props.playlist.id)
  if (saved?.items && Array.isArray(saved.items) && saved.items.length > 0) {
    playlistItems.value = saved.items
  }
})

// ✅ Watch for store changes (in case media is deleted/added elsewhere)
watch(() => mediaStore.mediaItems, (newVal) => {
  // Optional: Remove deleted items from playlist if needed
  playlistItems.value = playlistItems.value.filter(item => 
    newVal.find(media => media.id === item.id)
  )
}, { deep: true })

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
  if (!durStr) return 10;
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

const publishPlaylist = async () => {
  if (playlistItems.value.length === 0) {
    toast.warning('Add media items before publishing')
    return
  }
  await playlistStore.updatePlaylist(props.playlist.id, {
    items: playlistItems.value,
    duration: totalDurationFormatted.value,
    lastEdited: new Date().toLocaleString(),
  })
  toast.success('Playlist published successfully')
}
</script>

<template>
  <div class="builder-container">
    <!-- Header -->
    <div class="builder-header">
      <div class="d-flex align-center ga-2">
        <button class="hdr-btn hdr-btn--back" @click="emit('back')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <span class="builder-title">{{ props.playlist.name }}</span>
      </div>
      <div class="header-actions">
        <button class="hdr-btn hdr-btn--preview" @click="handlePreview" :disabled="playlistItems.length === 0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          Preview
        </button>
        <button class="hdr-btn hdr-btn--publish" @click="publishPlaylist">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          Publish
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="builder-content">
      <!-- Left Panel -->
      <div class="panel source-panel">
        <p class="text-body-2 text-medium-emphasis mb-4">Use Drag and Drop to add items to playlist</p>
        
        <v-tabs v-model="activeTab" color="#fdc704" class="mb-4">
          <v-tab v-for="tab in tabs" :key="tab" :value="tab" class="text-none">{{ tab }}</v-tab>
        </v-tabs>

        <div class="tab-content" v-if="activeTab === 'Media'">
          <!-- Breadcrumb / Back Navigation -->
          <div v-if="currentFolderId" class="d-flex align-center mb-4 breadcrumb-nav">
            <v-btn icon="mdi-arrow-left" variant="text" size="small" @click="navigateUp" color="#fdc704"></v-btn>
            <v-icon class="mx-2" size="small" color="grey">mdi-chevron-right</v-icon>
            <span class="text-subtitle-2 font-weight-medium">{{ folderPath[folderPath.length - 1]?.name }}</span>
          </div>

          <!-- Folders -->
          <div class="folder-list mb-4" v-if="currentFolders.length > 0">
            <div 
              v-for="folder in currentFolders" 
              :key="folder.id" 
              class="folder-item"
              @click="navigateToFolder(folder)"
            >
              <div class="d-flex align-center">
                <v-icon color="#fdc704" class="mr-3">mdi-folder</v-icon>
                <span class="item-name">{{ folder.name }}</span>
              </div>
              <v-icon size="small" color="grey">mdi-chevron-right</v-icon>
            </div>
          </div>

          <!-- Media Items -->
          <draggable
            :list="currentMedia"
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

          <!-- Empty State -->
          <div v-if="currentFolders.length === 0 && currentMedia.length === 0" class="empty-folder text-center pa-4">
            <v-icon size="48" color="grey-lighten-2">mdi-folder-open-outline</v-icon>
            <p class="text-body-2 text-medium-emphasis mt-2">This folder is empty</p>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="panel target-panel">
        <div class="d-flex justify-space-between align-center mb-4 pb-2 border-bottom">
          <span class="text-subtitle-1 font-weight-bold" style="color: #fdc704">{{ props.playlist.name }}</span>
          <v-chip color="error" size="small" class="font-weight-bold rounded text-white">Total Duration - {{ totalDurationFormatted }}</v-chip>
        </div>

        <draggable
          v-model="playlistItems"
          group="media"
          item-key="uniqueId"
          class="drop-zone"
          :class="{ 'is-empty': playlistItems.length === 0 }"
          @change="onPlaylistChange"
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
              <v-icon color="#fdc704" size="24" class="mr-2">mdi-file-document-outline</v-icon>
              <span style="color: #fdc704">Please Drop your Media Files here</span>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Preview Dialog (popup) -->
    <v-dialog v-model="previewDialog" max-width="860" rounded="lg">
      <v-card rounded="lg" elevation="8">
        <div class="preview-dialog-header">
          <div>
            <div class="preview-dialog-title">Playlist Preview</div>
            <div class="preview-dialog-sub">{{ props.playlist.name }}</div>
          </div>
          <button class="preview-close-btn" @click="previewDialog = false">✕</button>
        </div>
        <v-divider />
        <div class="preview-dialog-body" style="position:relative">
          <!-- Media display -->
          <template v-if="playlistItems[currentPreviewIndex]">
            <template v-if="playlistItems[currentPreviewIndex].url">
              <video v-if="playlistItems[currentPreviewIndex].type === 'video'" controls autoplay
                :src="playlistItems[currentPreviewIndex].url" class="preview-media-el" />
              <img v-else-if="playlistItems[currentPreviewIndex].type === 'image'"
                :src="playlistItems[currentPreviewIndex].url"
                :alt="playlistItems[currentPreviewIndex].name" class="preview-media-el" />
              <iframe v-else-if="playlistItems[currentPreviewIndex].type === 'html'"
                :src="playlistItems[currentPreviewIndex].url" class="preview-media-el" style="border:none" />
              <div v-else class="preview-empty" style="height:440px">
                <v-icon size="64" :color="getIconColor(playlistItems[currentPreviewIndex].type)">{{ getIcon(playlistItems[currentPreviewIndex].type) }}</v-icon>
                <p class="preview-empty-text">{{ playlistItems[currentPreviewIndex].name }}</p>
              </div>
            </template>
            <div v-else class="preview-empty" style="height:440px">
              <v-icon size="64" :color="getIconColor(playlistItems[currentPreviewIndex].type)">{{ getIcon(playlistItems[currentPreviewIndex].type) }}</v-icon>
              <p class="preview-empty-text">{{ playlistItems[currentPreviewIndex].name }}</p>
            </div>
          </template>

          <!-- Nav arrows (only if multiple items) -->
          <template v-if="playlistItems.length > 1">
            <button class="slider-nav slider-nav--prev" :disabled="currentPreviewIndex === 0"
              @click="currentPreviewIndex--">&#8249;</button>
            <button class="slider-nav slider-nav--next" :disabled="currentPreviewIndex === playlistItems.length - 1"
              @click="currentPreviewIndex++">&#8250;</button>
          </template>

          <!-- Chips bar -->
          <div class="preview-item-chips" v-if="playlistItems[currentPreviewIndex]">
            <v-chip size="small" :color="getIconColor(playlistItems[currentPreviewIndex].type)" class="text-uppercase font-weight-bold">{{ playlistItems[currentPreviewIndex].type }}</v-chip>
            <v-chip size="small" color="grey-darken-2">Duration: {{ playlistItems[currentPreviewIndex].duration || '00:10' }}</v-chip>
            <span class="preview-counter">{{ currentPreviewIndex + 1 }} / {{ playlistItems.length }}</span>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Duplicate Media Warning -->
    <v-dialog v-model="showDuplicateWarning" max-width="420" rounded="lg">
      <v-card rounded="lg" elevation="8">
        <div class="preview-dialog-header">
          <div class="preview-dialog-title" style="color:#f59e0b">⚠ Duplicate Media</div>
          <button class="preview-close-btn" @click="showDuplicateWarning = false">✕</button>
        </div>
        <v-divider />
        <v-card-text class="pt-4 pb-2">
          <p><strong>{{ duplicateMediaName }}</strong> is already in this playlist.</p>
          <p class="text-medium-emphasis mt-1" style="font-size:0.85rem">It was added again. You can keep both or remove the duplicate.</p>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 d-flex justify-end">
          <v-btn variant="flat" color="warning" @click="showDuplicateWarning = false">OK, Keep Both</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
/* ── Preview popup ──────────────────── */
.preview-dialog-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; padding: 1rem 1.25rem 0.875rem;
}
.preview-dialog-title { font-size: 1rem; font-weight: 700; color: #111; }
.preview-dialog-sub { font-size: 0.8rem; color: #6b7280; margin-top: 2px; }
.preview-close-btn {
  background: #f3f4f6; border: none; border-radius: 50%; width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  color: #374151; flex-shrink: 0; font-size: 0.85rem;
}
.preview-close-btn:hover { background: #e5e7eb; }
.preview-dialog-body { background: #111; }
.preview-media-frame {
  width: 100%; height: 440px; display: flex; align-items: center;
  justify-content: center; background: #000;
}
.preview-media-el { width: 100%; height: 440px; object-fit: contain; background: #000; display: block; }
.preview-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 440px; gap: 1rem;
}
.preview-empty-text { color: #9ca3af; font-size: 0.9rem; text-align: center; }
.preview-item-chips { display: flex; gap: 6px; padding: 8px 12px; background: #1a1a1a; align-items: center; }
.preview-counter { color: #9ca3af; font-size: 0.78rem; margin-left: auto; }
.slider-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(0,0,0,0.55); color: #fff; border: none; border-radius: 50%;
  width: 40px; height: 40px; font-size: 1.6rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; z-index: 10;
}
.slider-nav:hover:not(:disabled) { background: rgba(0,0,0,0.85); }
.slider-nav:disabled { opacity: 0.3; cursor: default; }
.slider-nav--prev { left: 10px; }
.slider-nav--next { right: 10px; }

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
  padding: 12px 24px;
  background: #fff;
  min-height: 60px;
  border-bottom: 1px solid #e5e7eb;
  gap: 12px;
}

.builder-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hdr-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.hdr-btn:disabled { opacity: 0.45; cursor: default; }

.hdr-btn--back {
  background: #f3f4f6;
  color: #374151;
}
.hdr-btn--back:hover:not(:disabled) { background: #e5e7eb; }

.hdr-btn--preview {
  background: transparent;
  color: #fdc704;
  border: 1.5px solid #fdc704;
}
.hdr-btn--preview:hover:not(:disabled) { background: #fdf7d6; }

.hdr-btn--publish {
  background: #fdc704;
  color: #fff;
}
.hdr-btn--publish:hover:not(:disabled) { background: #e6b400; }

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
  border-color: #fdc704;
  box-shadow: 0 4px 12px rgba(253, 199, 4, 0.1);
}

.folder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 8px;
}

.folder-item:hover {
  border-color: #fdc704;
  background: #fffdf5;
  box-shadow: 0 4px 12px rgba(253, 199, 4, 0.1);
}

.breadcrumb-nav {
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
.bg-teal { background: #fdc704; }
.bg-warning { background: #f59e0b; }
.bg-error { background: #ef4444; }
.bg-grey { background: #9ca3af; }

.border-bottom {
  border-bottom: 2px solid #fdc704;
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
  border: 2px dashed #fdc704;
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
