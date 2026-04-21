<script setup>
import { Search, MoreVertical, X } from 'lucide-vue-next'
import { ref, onMounted, nextTick } from 'vue'
import { usePlaylistStore } from '@/stores/playlist'
import PlaylistBuilder from '@/components/PlaylistBuilder.vue'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog.vue'

const playlistStore = usePlaylistStore()
const activePlaylist = ref(null)
const createDialog = ref(false)
const newPlaylistName = ref('')
const deleteDialog = ref({ open: false, item: null })
const playlistInput = ref(null)

onMounted(async () => {
  await playlistStore.fetchPlaylists()
})

const openCreateDialog = async () => {
  createDialog.value = true
  newPlaylistName.value = ''
  await nextTick()
  playlistInput.value?.focus()
}

const handleCreate = async () => {
  if (!newPlaylistName.value?.trim()) return
  
  const result = await playlistStore.createPlaylist({
    name: newPlaylistName.value.trim(),
    customer: 'Default',
    items: [],
    duration: '00:00:00',
    lastEdited: 'Just now',
    status: 'active'
  })
  
  if (result.success) {
    createDialog.value = false
    newPlaylistName.value = ''
  }
}

const handleEdit = (playlist) => {
  activePlaylist.value = playlist
}

const openDeleteDialog = (playlist) => {
  deleteDialog.value.item = playlist
  deleteDialog.value.open = true
}

const handleConfirmDelete = async () => {
  if (!deleteDialog.value.item) return
  
  const result = await playlistStore.deletePlaylist(deleteDialog.value.item.id)
  
  if (result.success) {
    deleteDialog.value.open = false
    deleteDialog.value.item = null
  }
}
</script>

<template>
  <div v-if="activePlaylist" class="builder-view">
    <PlaylistBuilder :playlist="activePlaylist" @back="activePlaylist = null" />
  </div>

  <div v-else class="page-container">
    <div class="playlist-header">
      <div class="search-bar">
        <input type="text" placeholder="Search.." />
        <button class="search-btn">
          <Search :size="18" color="#9ca3af" />
        </button>
      </div>
      <v-btn 
        color="#14b8a6" 
        variant="flat" 
        prepend-icon="mdi-plus-circle-outline" 
        @click="openCreateDialog" 
        class="text-none font-weight-bold rounded-lg"
      >
        Create Playlist
      </v-btn>
    </div>

    <div class="playlist-wrapper">
      <div v-if="playlistStore.loading && !playlistStore.playlistItems.length" class="text-center py-8">
        Loading playlists...
      </div>
      
      <div v-else-if="!playlistStore.playlistItems?.length" class="text-center py-8 text-gray-500">
        No playlists found. Create one to get started!
      </div>

      <div v-else class="playlist-list">
        <div 
          v-for="playlist in playlistStore.playlistItems" 
          :key="playlist.id" 
          class="playlist-item" 
          @click="activePlaylist = playlist"
        >
          <div class="playlist-icon">
            <v-icon color="#14b8a6" size="28">mdi-play-circle-outline</v-icon>
          </div>
          <div class="playlist-info">
            <h4>{{ playlist.name }}</h4>
            <span class="duration">{{ playlist.duration || '00:00:00' }}</span>
          </div>
          <div class="playlist-meta">
            <v-icon size="small" color="success" class="mr-2">mdi-run</v-icon>
            <span class="last-edited">Last Edited: {{ playlist.lastEdited || playlist.date }}</span>
          </div>
          <div class="playlist-actions" @click.stop>
            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <button class="more-options" v-bind="props">
                  <MoreVertical :size="20" />
                </button>
              </template>
              <v-list density="compact" min-width="160">
                <v-list-item @click.stop="handleEdit(playlist)">
                  <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-pencil</v-icon></template>
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click.stop="openDeleteDialog(playlist)" base-color="error">
                  <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Custom Dialog (Matches Channel Dialog Style) -->
    <div v-if="createDialog" class="dialog-overlay" @click.self="createDialog = false">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>New Playlist Instance</h3>
          <button class="close-btn" @click="createDialog = false">
            <X :size="20" />
          </button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <label>Playlist Name*</label>
            <input
              type="text"
              v-model="newPlaylistName"
              class="form-input"
              placeholder="Enter playlist name"
              @keyup.enter="handleCreate"
              ref="playlistInput"
            />
          </div>
        </div>

        <div class="dialog-footer">
          <button 
            class="btn-primary" 
            @click="handleCreate" 
            :disabled="playlistStore.loading || !newPlaylistName.trim()"
          >
            {{ playlistStore.loading ? 'Creating...' : 'Create Playlist' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Dialog -->
    <ConfirmationDialog
      v-model="deleteDialog.open"
      title="Delete Playlist"
      :message="`Delete '${deleteDialog.item?.name}'?`"
      detail="This cannot be undone."
      icon="mdi-delete-alert"
      icon-color="error"
      confirm-text="Delete"
      confirm-color="error"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<style scoped>
/* --- Page & Layout Styles --- */
.page-container { padding: 32px 40px; max-width: 1440px; margin: 0 auto; }
.builder-view { height: 100%; }
.playlist-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.search-bar { display: flex; align-items: center; width: 300px; background: white; border-radius: 8px; border: 1px solid #14b8a6; overflow: hidden; height: 40px; }
.search-bar input { flex: 1; border: none; padding: 0 1rem; font-size: 0.9rem; outline: none; height: 100%; }
.search-bar input::placeholder { color: #9ca3af; }
.search-btn { background: transparent; border: none; padding: 0 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; height: 100%; border-left: 1px solid #14b8a6; }
.playlist-wrapper { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.03); }
.playlist-list { display: flex; flex-direction: column; gap: 16px; }
.playlist-item { display: flex; align-items: center; background: white; padding: 16px 24px; border-radius: 12px; border: 1px solid #f3f4f6; gap: 24px; cursor: pointer; transition: all 0.2s; }
.playlist-item:hover { border-color: #14b8a6; box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1); transform: translateY(-1px); }
.playlist-icon { width: 48px; height: 48px; border-radius: 50%; border: 1px dashed #14b8a6; background-color: rgba(20, 184, 166, 0.05); display: flex; align-items: center; justify-content: center; }
.playlist-info { flex: 1; }
.playlist-info h4 { margin: 0 0 4px 0; color: #1f2937; font-weight: 500; font-size: 1rem; }
.duration { font-size: 0.75rem; color: #9ca3af; }
.playlist-meta { display: flex; align-items: center; min-width: 250px; }
.last-edited { font-size: 0.8rem; color: #6b7280; }
.playlist-actions { display: flex; align-items: center; justify-content: center; }
.more-options { background: transparent; border: 1px solid #e5e7eb; color: #4b5563; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 16px; transition: all 0.2s; }
.more-options:hover { background: #f3f4f6; color: #111827; }

/* --- Custom Dialog Styles (Matches Channel Dialog) --- */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.2s ease-out;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.dialog-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f3f4f6;
}

.btn-primary {
  background-color: #14b8a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0d9488;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>