<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChannelsStore } from '@/stores/channel'  // ✅ Import store
import { MoreVertical, Search, Plus, ArrowRightCircle } from 'lucide-vue-next'
import CreateChannelDialog from '../components/dialogs/CreateChannelDialog.vue'
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.vue'

const router = useRouter()
const channelStore = useChannelsStore()  // ✅ Initialize store

const searchQuery = ref('')
const showCreateDialog = ref(false)

const deleteDialog = ref({
  open: false,
  item: null
})

// ✅ Fetch channels on mount
onMounted(async () => {
  await channelStore.fetchChannels()
})

const filteredChannels = computed(() => {
  const channels = channelStore.channels  // Get raw array from store
  
  if (!searchQuery.value) return channels
  
  const query = searchQuery.value.toLowerCase()
  return channels.filter(c => 
    c.name?.toLowerCase().includes(query) ||
    c.location?.toLowerCase().includes(query) ||
    c.customer?.toLowerCase().includes(query)
  )
})


// ✅ Create uses store action
const handleCreate = async (newChannel) => {
  try {
    await channelStore.createChannel(newChannel)
    showCreateDialog.value = false
  } catch (error) {
    console.error('Create failed:', error)
  }
}

const handleEdit = (channel) => {
  router.push({
    name: 'ChannelBuilder',
    params: { channelId: channel.id },
    state: { channelData: channel } 
  })
}

const openDeleteDialog = (channel) => {
  deleteDialog.value.item = channel
  deleteDialog.value.open = true
}

// ✅ Delete uses store action
const handleConfirmDelete = async () => {
  if (!deleteDialog.value.item) return
  
  try {
    await channelStore.deleteChannel(deleteDialog.value.item.id)
    deleteDialog.value.open = false
    deleteDialog.value.item = null
  } catch (error) {
    console.error('Delete failed:', error)
  }
}

// ✅ Duplicate uses store action
const duplicateChannel = async (channel) => {
  try {
    await channelStore.duplicateChannel(channel.id)
  } catch (error) {
    console.error('Duplicate failed:', error)
  }
}
</script>

<template>
  <div class="channels-page">
    <!-- Loading State -->
    <div v-if="channelStore.loading" class="loading-overlay">
      <v-progress-circular indeterminate color="#fdc704" size="40" />
    </div>

    <!-- Top Action Bar -->
    <div class="top-bar" v-else>
      <button class="btn-new-channel" @click="showCreateDialog = true">
        <Plus :size="16" />
        New Channel
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar-container" >
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search channels..."
          class="search-input"
        />
        <button class="search-btn">
          <Search :size="18" color="#fdc704" />
        </button>
      </div>
    </div>

    <!-- Channel List -->
    <div class="channel-list" v-if="!channelStore.loading">
      <!-- Empty State -->
      <div v-if="filteredChannels.length === 0" class="empty-state">
        <v-icon size="64" color="grey-lighten-2" class="mb-3">mdi-television-off</v-icon>
        <p class="text-body-1 text-medium-emphasis">
          {{ searchQuery ? 'No channels match your search' : 'No channels yet' }}
        </p>
        <v-btn 
          v-if="!searchQuery"
          class="mt-3" 
          color="#fdc704" 
          variant="flat"
          @click="showCreateDialog = true"
        >
          Create Your First Channel
        </v-btn>
      </div>

      <!-- Channel Items -->
      <div
        v-for="channel in filteredChannels"
        :key="channel.id"
        class="channel-item"
      >
        <!-- Left Arrow Icon -->
        <div class="channel-arrow">
          <ArrowRightCircle :size="36" color="#fdc704" />
        </div>

        <!-- Channel Info -->
        <div class="channel-info">
          <span class="channel-name">{{ channel.name }}</span>
          <span
            :class="['status-badge', channel.status?.includes('Published') ? 'badge-published' : 'badge-draft']"
          >
            {{ channel.status }}
          </span>
        </div>

        <!-- Actions -->
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

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model="deleteDialog.open"
      title="Delete Channel"
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

.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.channel-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: #9ca3af;
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
  background-color: #fdc704;
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
  background-color: #e6b400;
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

.search-input::placeholder {
  color: #9ca3af;
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

.search-btn:hover {
  background: #f9fafb;
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
  background-color: #fdc704;
  color: white;
}

.badge-draft {
  background-color: transparent;
  color: #ef4444;
  padding-left: 0;
}

/* More Options */
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
  border-color: #fdc704;
  color: #111827;
}

/* Responsive */
@media (max-width: 768px) {
  .channels-page {
    padding: 1rem;
  }
  
  .search-bar {
    width: 100%;
  }
  
  .channel-item {
    padding: 0.75rem 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .channel-actions {
    order: 3;
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}
</style>