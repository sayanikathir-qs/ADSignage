<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { channels as channelsMock } from '../data/mockData'
import { MoreVertical, Search, Plus, ArrowRightCircle } from 'lucide-vue-next'
import CreateChannelDialog from '../components/dialogs/CreateChannelDialog.vue'
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.vue'

const router = useRouter()
const searchQuery = ref('')
const showCreateDialog = ref(false)
const channels = ref([...channelsMock])
const newChannel = ref('')


const deleteDialog = ref({
  open: false,
  item: null
})

const filteredChannels = computed(() => {
  if (!searchQuery.value) return channels.value
  return channels.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const settoscreen = (channel) => {
  router.push({
    name: 'ScreenAssign',  // Your route name for screen assignment
    params: { channelId: channel.id }
  })
}

const handleCreate = (newChannel) => {
  channels.value.push({
    id: channels.value.length + 1,
    name: newChannel.name,
    status: 'Draft Saved. Publish required.',
    lastEdited: new Date().toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    })
  })
  showCreateDialog.value = false
  newChannel.value = ''

}

const handleEdit = (channel) => {
  router.push({
    name: 'ChannelBuilder',  // Your existing route for editing
    params: { channelId: channel.id },
    // Optional: pass initial data via state if needed
    state: { channelData: channel } 
  })
}

const openDeleteDialog = (channel) => {
  deleteDialog.value.item = channel
  deleteDialog.value.open = true
}

const handleConfirmDelete = () => {
  if (!deleteDialog.value.item) return
  
  const index = channels.value.findIndex(p => p.id === deleteDialog.value.item.id)
  if (index !== -1) {
    channels.value.splice(index, 1)
  }
  
  deleteDialog.value.open = false
  deleteDialog.value.item = null
}

const duplicateChannel = (channel) => {
  channels.value.push({
    id: channels.value.length + 1,
    name: channel.name,
    status: 'Draft Saved. Publish required.',
    lastEdited: new Date().toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    })
  })
}

</script>

<template>
  <div class="channels-page">
    <!-- Top Action Bar -->
    <div class="top-bar">
      <button class="btn-new-channel" @click="showCreateDialog = true">
        <Plus :size="16" />
        New Channel
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar-container">
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
        />
        <button class="search-btn">
          <Search :size="18" color="#14b8a6" />
        </button>
      </div>
    </div>

    <!-- Channel List -->
    <div class="channel-list">
      <div
        v-for="channel in filteredChannels"
        :key="channel.id"
        class="channel-item"
      >
        <!-- Left Arrow Icon -->
        <div class="channel-arrow">
          <ArrowRightCircle :size="36" color="#14b8a6" />
        </div>

        <!-- Channel Info -->
        <div class="channel-info">
          <span class="channel-name">{{ channel.name }}</span>
          <span
            :class="['status-badge', channel.status === 'Published.' ? 'badge-published' : 'badge-draft']"
          >
            {{ channel.status }}
          </span>
        </div>

        <!-- Last Edited -->
        <!-- <div class="channel-meta">
          <span class="running-icon">🏃</span>
          <span class="last-edited">Last Edited on: {{ channel.lastEdited }}</span>
        </div> -->

        <div class="channel-actions" @click.stop>
            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <button class="more-options" v-bind="props">
                  <MoreVertical :size="20" />
                </button>
              </template>
              <v-list density="compact" min-width="160">
                <v-list-item @click.stop="handleEdit(channel)">
                  <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-pencil</v-icon></template>
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click.stop="openDeleteDialog(channel)" base-color="error">
                  <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
                <v-list-item @click.stop="duplicateChannel(channel)">
                  <template v-slot:prepend>
                    <v-icon size="small" class="mr-2" color="orange">mdi-content-duplicate</v-icon>
                  </template>
                  <v-list-item-title>Duplicate</v-list-item-title>
                </v-list-item>
                <v-list-item @click.stop="settoscreen(channel)">
                  <template v-slot:prepend>
                    <v-icon size="small" class="mr-2">mdi-television-play</v-icon>
                  </template>
                  <v-list-item-title>Set to Screen</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
      </div>
    </div>

    <!-- Create Channel Dialog -->
    <CreateChannelDialog
      :is-open="showCreateDialog"
      @close="showCreateDialog = false"
      @create="handleCreate"
    />

    <ConfirmationDialog
      v-model="deleteDialog.open"
      title="Delete Playlist"
      :message="`Are you sure you want to delete '${deleteDialog.item?.name}'?`"
      detail="This action cannot be undone."
      icon="mdi-delete-alert"
      icon-color="error"
      confirm-text="Delete"
      confirm-color="error"
      cancel-text="Cancel"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<style scoped>
.channels-page {
  padding: 1.5rem 2rem;
  min-height: 100%;
  background-color: #f9fafb;
}
.channel-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.btn-new-channel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #14b8a6;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-new-channel:hover {
  background-color: #14b8a6;
}

/* Search Bar */
.search-bar-container {
  margin-bottom: 1.5rem;
}

.search-bar {
  display: flex;
  align-items: center;
  width: 280px;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.search-input {
  flex: 1;
  padding: 0.55rem 0.75rem;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: #374151;
  background: transparent;
}

.search-btn {
  padding: 0.5rem 0.75rem;
  background: white;
  border: none;
  border-left: 1.5px solid #e5e7eb;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Channel List */
.channel-list {
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.channel-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.15s;
  cursor: pointer;
}

.channel-item:last-child {
  border-bottom: none;
}

.channel-item:hover {
  background-color: #fafafa;
}

/* Arrow Icon */
.channel-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  
}

/* Channel Info */
.channel-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.channel-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  width: fit-content;
}

.badge-published {
  background-color:#14b8a6;
  color: white;
}

.badge-draft {
  background-color: transparent;
  color: #ef4444;
  padding-left: 0;
}

/* Meta: last edited */
.channel-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.running-icon {
  font-size: 1rem;
}

.last-edited {
  font-size: 0.78rem;
  color: #6b7280;
}

/* More Options */
.more-options {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  flex-shrink: 0;
}
.more-options {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  transition: all 0.2s;
}
.more-options:hover {
  background-color: #f3f4f6;
  border-color: #14b8a6;
}
</style>
