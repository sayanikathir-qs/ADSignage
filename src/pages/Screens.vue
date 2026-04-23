<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScreensStore } from '@/stores/screen'
import { useChannelsStore } from '@/stores/channel'
import {
  Monitor,
  Search,
  Play,
  MoreVertical,
  ExternalLink,
  Tv2,
  FileInput,
  RotateCcw,
  Pencil,
  Wrench,
  RefreshCw,
  Unlink,
  Trash2,
  Plus,
  X,
} from 'lucide-vue-next'

const screensStore = useScreensStore()
const channelsStore = useChannelsStore()

const searchQuery = ref('')

// Load data on mount
onMounted(async () => {
  await screensStore.fetchScreens()
  await channelsStore.fetchChannels()
})

// Computed properties from store
const localScreens = computed(() => screensStore.screens)
const localGroups = computed(() => screensStore.groups)
const localChannels = computed(() => channelsStore.channels)

const filteredGroupedScreens = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return localGroups.value.map(group => ({
    ...group,
    screens: localScreens.value.filter(s => {
      const inGroup = s.groupId === group.id
      if (!q) return inGroup
      return inGroup && (s.name.toLowerCase().includes(q) || (s.channel || '').toLowerCase().includes(q))
    }),
  }))
})

const ungroupedScreens = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return localScreens.value.filter(s => {
    const isUngrouped = !s.groupId
    if (!q) return isUngrouped
    return isUngrouped && (s.name.toLowerCase().includes(q) || (s.channel || '').toLowerCase().includes(q))
  })
})

// ── New Screen Dialog ─────────────────────────────
const showNewScreen = ref(false)
const newScreen = ref({ 
  name: '', 
  type: 'Web', 
  pairingCode: ['', '', '', '', '', ''], 
  freeTrial: false, 
  subscription: '' 
})
const pairingRefs = ref([])

const openNewScreenDialog = () => {
  newScreen.value = { 
    name: '', 
    type: 'Web', 
    pairingCode: ['', '', '', '', '', ''], 
    freeTrial: false, 
    subscription: '' 
  }
  showNewScreen.value = true
}

const onPairingInput = (i, e) => {
  const val = e.target.value.slice(-1).toUpperCase()
  newScreen.value.pairingCode[i] = val
  if (val && i < 5) pairingRefs.value[i + 1]?.focus()
}

const onPairingKeydown = (i, e) => {
  if (e.key === 'Backspace' && !newScreen.value.pairingCode[i] && i > 0) {
    pairingRefs.value[i - 1]?.focus()
  }
}

const handleAddScreen = async () => {
  if (!newScreen.value.name.trim()) return
  const code = newScreen.value.pairingCode.join('')
  
  await screensStore.createScreen({
    name: newScreen.value.name.trim(),
    type: newScreen.value.type,
    pairingCode: code,
    freeTrial: newScreen.value.freeTrial,
    subscription: newScreen.value.subscription,
  })
  showNewScreen.value = false
}

// ── New Screen Group Dialog ────────────────────────
const showNewGroup = ref(false)
const newGroup = ref({ name: '', selectedScreenIds: [] })

const openNewGroupDialog = () => {
  newGroup.value = { name: '', selectedScreenIds: [] }
  showNewGroup.value = true
}

const handleCreateGroup = async () => {
  if (!newGroup.value.name.trim()) return
  await screensStore.createGroup({
    name: newGroup.value.name.trim(),
    screenIds: newGroup.value.selectedScreenIds,
  })
  showNewGroup.value = false
}

// ─ Assign Channel to Group Dialog ────────────────────
const showAssignChannel = ref(false)
const assignChannelGroup = ref(null)
const selectedChannel = ref('')

const openAssignChannelDialog = (group) => {
  assignChannelGroup.value = group
  const groupScreens = localScreens.value.filter(s => s.groupId === group.id)
  selectedChannel.value = groupScreens[0]?.channel || ''
  showAssignChannel.value = true
}

const handleAssignChannelToGroup = async () => {
  if (!assignChannelGroup.value) return
  await screensStore.assignChannelToGroup(
    assignChannelGroup.value.id, 
    selectedChannel.value || null
  )
  showAssignChannel.value = false
}

// ── Set Content Dialog (for individual screen) ─────────
const showSetContent = ref(false)
const contentScreen = ref(null)
const selectedContentChannel = ref('')

const openSetContentDialog = (screen) => {
  contentScreen.value = screen
  selectedContentChannel.value = screen.channel || ''
  showSetContent.value = true
}

const handleSetContent = async () => {
  if (!contentScreen.value) return
  await screensStore.updateScreenChannel(
    contentScreen.value.id,
    selectedContentChannel.value || null
  )
  showSetContent.value = false
}

// ── Screen context menu actions ────────────────────
const handleMenuAction = async (action, screenId) => {
  if (action === 'delete') {
    await screensStore.deleteScreen(screenId)
  }
  if (action === 'removeChannel') {
    await screensStore.updateScreenChannel(screenId, null)
  }
  if (action === 'setContent') {
    const screen = localScreens.value.find(s => s.id === screenId)
    if (screen) openSetContentDialog(screen)
  }
}

// ── Screen Preview (Fullscreen - follows Media.vue pattern) ─────────
const showPreviewDialog = ref(false)
const previewScreen = ref(null)
const refreshing = ref(false)

const openPreview = (screen) => {
  previewScreen.value = screen
  showPreviewDialog.value = true
}

const getChannelPreviewUrl = (channelName) => {
  if (!channelName) return null
  const channel = channelsStore.channels.find(c => c.name === channelName)
  if (channel?.previewUrl) return channel.previewUrl
  // Mock previews for demo
  const mockPreviews = {
    'star sports': 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1',
    'DEMO 37': 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1',
    'YT 2 video': 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1',
  }
  return mockPreviews[channelName] || null
}

const getGroupName = (groupId) => {
  if (!groupId) return null
  const group = localGroups.value.find(g => g.id === groupId)
  return group?.name || null
}

const refreshScreenPreview = async () => {
  if (!previewScreen.value) return
  refreshing.value = true
  try {
    await screensStore.fetchScreens()
    const updated = localScreens.value.find(s => s.id === previewScreen.value.id)
    if (updated) previewScreen.value = { ...updated }
  } catch (error) {
    console.error('Error refreshing preview:', error)
  } finally {
    refreshing.value = false
  }
}

const menuItems = [
  { action: 'setContent', icon: FileInput, label: 'Set Content' },
  { action: 'rotate', icon: RotateCcw, label: 'Rotate Screen' },
  { action: 'rename', icon: Pencil, label: 'Rename/Edit' },
  { action: 'repair', icon: Wrench, label: 'Repair' },
  { action: 'refresh', icon: RefreshCw, label: 'Refresh' },
  { action: 'removeChannel', icon: Unlink, label: 'Remove channel' },
  { action: 'delete', icon: Trash2, label: 'Delete', danger: true },
]

const screenTypes = ['Web', 'Android', 'Samsung', 'LG', 'Raspberry Pi', 'Windows']
const subscriptions = ['Basic - $9/mo', 'Pro - $29/mo', 'Enterprise - $99/mo']
</script>

<template>
  <div class="screens-page">
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="top-bar-actions">
        <button class="btn-new" @click="openNewScreenDialog">
          <Tv2 :size="16" />
          New Screen
        </button>
        <button class="btn-new btn-new-group" @click="openNewGroupDialog">
          <Plus :size="16" />
          New Screen Group
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="search-row">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="search-input"
        />
        <button class="search-btn">
          <Search :size="18" color="#fdc704" />
        </button>
      </div>
    </div>

    <!-- Ungrouped Screens -->
    <div v-if="ungroupedScreens.length > 0" class="ungrouped-section">
      <!-- <h3 class="section-title">Ungrouped Screens</h3> -->
      <div class="screens-list">
        <div
          v-for="screen in ungroupedScreens"
          :key="screen.id"
          class="screen-row"
        >
          <div class="screen-icon">
            <Monitor :size="32" color="#fdc704" />
          </div>
          <div class="screen-info">
            <div class="screen-name-row">
              <span class="screen-name">{{ screen.name }}</span>
              <span v-if="screen.type" class="type-badge">{{ screen.type }}</span>
            </div>
            <div class="screen-status">
              <span class="status-offline">OFFLINE</span>
              <span class="offline-time">Offline at: {{ screen.offlineAt }}</span>
            </div>
          </div>
          <div class="screen-channel" v-if="screen.channel">
            <span class="running-icon">🏃</span>
            <span class="channel-name">{{ screen.channel }}</span>
            <ExternalLink :size="14" class="ext-icon" />
          </div>
          <div class="screen-channel empty" v-else>
            <span class="no-channel">No channel</span>
          </div>
          <button class="btn-preview" @click="openPreview(screen)">
            <Play :size="14" />
            Preview
          </button>
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <button class="more-btn" v-bind="props" @click.stop>
                <MoreVertical :size="18" />
              </button>
            </template>
            <v-list density="compact" min-width="180">
              <v-list-item
                v-for="item in menuItems"
                :key="item.action"
                :base-color="item.danger ? 'error' : undefined"
                @click="handleMenuAction(item.action, screen.id)"
              >
                <template #prepend>
                  <component :is="item.icon" :size="14" class="mr-2" />
                </template>
                <v-list-item-title>{{ item.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>

    <!-- Groups + Screens -->
    <div class="groups-container">
      <div
        v-for="group in filteredGroupedScreens"
        :key="group.id"
        class="group-block"
      >
        <!-- Group Header -->
        <div class="group-header">
          <span class="group-name">{{ group.name }}</span>
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <button class="more-btn" v-bind="props" @click.stop>
                <MoreVertical :size="18" />
              </button>
            </template>
            <v-list density="compact" min-width="180">
              <v-list-item @click="openAssignChannelDialog(group)">
                <template #prepend><Tv2 :size="14" class="mr-2" /></template>
                <v-list-item-title>Assign Channel to Group</v-list-item-title>
              </v-list-item>
              <v-list-item @click="console.log('rename group', group.id)">
                <template #prepend><Pencil :size="14" class="mr-2" /></template>
                <v-list-item-title>Rename Group</v-list-item-title>
              </v-list-item>
              <v-list-item @click="console.log('delete group', group.id)" base-color="error">
                <template #prepend><Trash2 :size="14" class="mr-2" /></template>
                <v-list-item-title>Delete Group</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Screen Rows -->
        <div
          v-for="screen in group.screens"
          :key="screen.id"
          class="screen-row"
        >
          <div class="screen-icon">
            <Monitor :size="32" color="#fdc704" />
          </div>
          <div class="screen-info">
            <div class="screen-name-row">
              <span class="screen-name">{{ screen.name }}</span>
              <span v-if="screen.type" class="type-badge">{{ screen.type }}</span>
            </div>
            <div class="screen-status">
              <span class="status-offline">OFFLINE</span>
              <span class="offline-time">Offline at: {{ screen.offlineAt }}</span>
            </div>
          </div>
          <div class="screen-channel" v-if="screen.channel">
            <span class="running-icon">🏃</span>
            <span class="channel-name">{{ screen.channel }}</span>
            <ExternalLink :size="14" class="ext-icon" />
          </div>
          <div class="screen-channel empty" v-else>
            <span class="no-channel">No channel</span>
          </div>
          <button class="btn-preview" @click="openPreview(screen)">
            <Play :size="14" />
            Preview
          </button>
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <button class="more-btn" v-bind="props" @click.stop>
                <MoreVertical :size="18" />
              </button>
            </template>
            <v-list density="compact" min-width="180">
              <v-list-item
                v-for="item in menuItems"
                :key="item.action"
                :base-color="item.danger ? 'error' : undefined"
                @click="handleMenuAction(item.action, screen.id)"
              >
                <template #prepend>
                  <component :is="item.icon" :size="14" class="mr-2" />
                </template>
                <v-list-item-title>{{ item.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <div v-if="group.screens.length === 0" class="empty-group">
          No screens in this group. Create a group with screens or assign existing screens.
        </div>
      </div>
    </div>
  </div>

  <!-- ── Create New Screen Dialog ──────────────────── -->
  <div v-if="showNewScreen" class="dialog-overlay" @click.self="showNewScreen = false">
    <div class="dialog-box">
      <div class="dialog-head">
        <h3>Create New Screen</h3>
        <button class="dlg-close" @click="showNewScreen = false"><X :size="20" /></button>
      </div>

      <div class="dialog-body">
        <div class="screen-illus">
          <Monitor :size="64" color="#fdc704" />
        </div>

        <div class="form-group">
          <label>Screen Name*</label>
          <input v-model="newScreen.name" type="text" class="form-input" placeholder="Enter screen name" />
        </div>

        <div class="form-group">
          <label>Screen Type*</label>
          <select v-model="newScreen.type" class="form-select">
            <option v-for="t in screenTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Enter 6 character pairing code*</label>
          <div class="pairing-boxes">
            <input
              v-for="(_, i) in 6"
              :key="i"
              :ref="el => pairingRefs[i] = el"
              :value="newScreen.pairingCode[i]"
              maxlength="1"
              class="pairing-box"
              @input="onPairingInput(i, $event)"
              @keydown="onPairingKeydown(i, $event)"
            />
          </div>
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" v-model="newScreen.freeTrial" id="free-trial" />
          <label for="free-trial">Use free trial - 1 Screen available.</label>
        </div>
        <p class="info-text">Please add your payment details to keep your paired screens active.</p>

        <div class="form-group">
          <label>Apply paid subscription:*</label>
          <select v-model="newScreen.subscription" class="form-select">
            <option value="">Select Subscription</option>
            <option v-for="s in subscriptions" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
      </div>

      <div class="dialog-foot">
        <button class="btn-dlg-primary" @click="handleAddScreen">Add New Screen</button>
      </div>
    </div>
  </div>

  <!-- ── Create New Screen Group Dialog ────────────── -->
  <div v-if="showNewGroup" class="dialog-overlay" @click.self="showNewGroup = false">
    <div class="dialog-box dialog-box--sm">
      <div class="dialog-head">
        <h3>Create Screen Group</h3>
        <button class="dlg-close" @click="showNewGroup = false"><X :size="20" /></button>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label>Screen Group Name*</label>
          <input v-model="newGroup.name" type="text" class="form-input" placeholder="Enter group name" />
        </div>

        <div class="form-group">
          <label>Select Screens*</label>
          <div class="screens-select-list">
            <div v-if="localScreens.length === 0" class="no-screens">No screens available</div>
            <label
              v-for="screen in localScreens"
              :key="screen.id"
              class="screen-check-item"
            >
              <input
                type="checkbox"
                :value="screen.id"
                v-model="newGroup.selectedScreenIds"
              />
              <Monitor :size="16" color="#fdc704" />
              <span>{{ screen.name }}</span>
              <span v-if="screen.type" class="type-tag">{{ screen.type }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="dialog-foot">
        <button class="btn-dlg-primary" @click="handleCreateGroup">Create Group</button>
      </div>
    </div>
  </div>

  <!-- ── Assign Channel to Group Dialog ────────────── -->
  <div v-if="showAssignChannel" class="dialog-overlay" @click.self="showAssignChannel = false">
    <div class="dialog-box dialog-box--sm">
      <div class="dialog-head">
        <h3>Assign Channel to "{{ assignChannelGroup?.name }}"</h3>
        <button class="dlg-close" @click="showAssignChannel = false"><X :size="20" /></button>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label>Available Channel*</label>
          <select v-model="selectedChannel" class="form-select">
            <option value="">-- Select Channel --</option>
            <option v-for="ch in localChannels" :key="ch.id" :value="ch.name">{{ ch.name }}</option>
          </select>
        </div>
        <p class="info-text" :class="{ 'text-error': localScreens.filter(s => s.groupId === assignChannelGroup?.id).length === 0 }">
          This will apply "{{ selectedChannel || 'no channel' }}" to all {{ localScreens.filter(s => s.groupId === assignChannelGroup?.id).length }} screen(s) in this group.
        </p>
        <div v-if="localScreens.filter(s => s.groupId === assignChannelGroup?.id).length === 0" class="warning-box">
          <strong>⚠️ Warning:</strong> This group has no screens. Please add screens to the group first.
        </div>
      </div>

      <div class="dialog-foot">
        <button 
          class="btn-dlg-primary" 
          @click="handleAssignChannelToGroup"
          :disabled="localScreens.filter(s => s.groupId === assignChannelGroup?.id).length === 0"
        >
          Apply to Group
        </button>
      </div>
    </div>
  </div>

  <!-- ── Set Content Dialog (Individual Screen) ────── -->
  <div v-if="showSetContent" class="dialog-overlay" @click.self="showSetContent = false">
    <div class="dialog-box dialog-box--sm">
      <div class="dialog-head">
        <h3>Set Content for "{{ contentScreen?.name }}"</h3>
        <button class="dlg-close" @click="showSetContent = false"><X :size="20" /></button>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label>Select Channel*</label>
          <select v-model="selectedContentChannel" class="form-select">
            <option value="">-- Select Channel --</option>
            <option v-for="ch in localChannels" :key="ch.id" :value="ch.name">{{ ch.name }}</option>
          </select>
        </div>
        <p class="info-text">
          This will assign "{{ selectedContentChannel || 'no channel' }}" to this screen only.
        </p>
      </div>

      <div class="dialog-foot">
        <button class="btn-dlg-primary" @click="handleSetContent">
          Apply to Screen
        </button>
      </div>
    </div>
  </div>

  <!-- ── Screen Preview Dialog (Fullscreen - follows Media.vue) ────────────── -->
  <v-dialog v-model="showPreviewDialog" fullscreen transition="dialog-bottom-transition">
    <v-card class="bg-black" v-if="previewScreen">
      <!-- Toolbar -->
      <v-toolbar color="rgba(0,0,0,0.8)" class="text-white">
        <v-btn icon variant="text" @click="showPreviewDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="font-weight-bold">
          Screen Preview - {{ previewScreen.name }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- Status Badge -->
        <v-chip 
          :color="previewScreen.status === 'online' ? 'success' : 'error'" 
          class="mr-3 text-uppercase font-weight-bold"
          size="small"
        >
          {{ previewScreen.status }}
        </v-chip>
        <!-- Screen Type -->
        <v-chip color="warning" class="mr-3 text-uppercase font-weight-bold" size="small">
          {{ previewScreen.type }}
        </v-chip>
      </v-toolbar>
      
      <v-card-text class="pa-0 bg-black">
        <v-sheet 
          height="calc(100vh - 64px)" 
          width="100%" 
          color="transparent" 
          class="d-flex flex-column align-center justify-center"
        >
          <!-- Screen has channel assigned -->
          <template v-if="previewScreen?.channel">
            <!-- Online Screen - Show actual preview -->
            <template v-if="previewScreen.status === 'online'">
              <div class="preview-container">
                <!-- Channel Preview Frame -->
                <iframe
                  v-if="getChannelPreviewUrl(previewScreen.channel)"
                  :src="getChannelPreviewUrl(previewScreen.channel)"
                  class="channel-preview-frame"
                  frameborder="0"
                  allowfullscreen
                  allow="autoplay; fullscreen; picture-in-picture"
                ></iframe>
                
                <!-- Fallback: Channel placeholder -->
                <div v-else class="preview-placeholder">
                  <v-icon size="120" color="warning">mdi-television</v-icon>
                  <h2 class="text-white mt-6">{{ previewScreen.channel }}</h2>
                  <p class="text-medium-emphasis mt-2">Channel content preview</p>
                </div>
              </div>
              
              <!-- Channel Info Bar -->
              <div class="d-flex align-center mt-4">
                <v-chip color="warning" class="mr-3 text-uppercase font-weight-bold">
                  {{ previewScreen.channel }}
                </v-chip>
                <span class="text-medium-emphasis">
                  <v-icon size="16" class="mr-1">mdi-clock</v-icon>
                  Playing since: {{ previewScreen.lastConnected || 'N/A' }}
                </span>
              </div>
            </template>
            
            <!-- Offline Screen - Show placeholder with status -->
            <template v-else>
              <div class="preview-container offline">
                <v-icon size="120" color="grey">mdi-television-off</v-icon>
                <h2 class="text-white mt-6">{{ previewScreen.channel }}</h2>
                <p class="text-medium-emphasis mt-2">Screen is offline</p>
                <div class="offline-overlay">
                  <v-chip color="error" class="text-uppercase font-weight-bold">
                    <v-icon start size="small">mdi-wifi-off</v-icon>
                    Offline
                  </v-chip>
                </div>
              </div>
              
              <!-- Offline Info -->
              <div class="d-flex align-center mt-4">
                <v-chip color="warning" class="mr-3 text-uppercase font-weight-bold">
                  {{ previewScreen.channel }}
                </v-chip>
                <span class="text-error">
                  <v-icon size="16" class="mr-1">mdi-alert-circle</v-icon>
                  Last offline: {{ previewScreen.offlineAt }}
                </span>
              </div>
              <p class="text-grey mt-2 text-center">
                Content will play automatically when screen comes back online.
              </p>
            </template>
          </template>
          
          <!-- No channel assigned -->
          <template v-else>
            <v-icon size="120" color="grey">mdi-television-off</v-icon>
            <h2 class="text-white mt-6">No Channel Assigned</h2>
            <p class="text-medium-emphasis mt-2">This screen is not playing any content.</p>
            <v-btn 
              color="warning" 
              class="mt-4"
              prepend-icon="mdi-link"
              @click="openSetContentDialog(previewScreen); showPreviewDialog = false;"
            >
              Assign Channel
            </v-btn>
          </template>
          
          <!-- Screen Details Footer -->
          <div class="screen-details-footer mt-auto mb-4">
            <v-card class="bg-grey-darken-3" variant="outlined" max-width="600">
              <v-card-text class="py-3">
                <div class="d-flex justify-space-between align-center flex-wrap">
                  <div>
                    <p class="text-caption text-grey mb-1">Screen Name</p>
                    <p class="text-subtitle-2 font-weight-bold">{{ previewScreen.name }}</p>
                  </div>
                  <div>
                    <p class="text-caption text-grey mb-1">Pairing Code</p>
                    <p class="text-subtitle-2 font-weight-mono">{{ previewScreen.pairingCode }}</p>
                  </div>
                  <div>
                    <p class="text-caption text-grey mb-1">Group</p>
                    <p class="text-subtitle-2">
                      {{ getGroupName(previewScreen.groupId) || 'Ungrouped' }}
                    </p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-sheet>
      </v-card-text>
      
      <!-- Action Buttons -->
      <v-card-actions class="bg-black pa-4" style="position: absolute; bottom: 0; width: 100%;">
        <v-spacer></v-spacer>
        <v-btn 
          variant="outlined" 
          color="grey"
          @click="showPreviewDialog = false"
        >
          Close
        </v-btn>
        <v-btn 
          v-if="previewScreen?.channel"
          color="warning"
          class="ml-3"
          prepend-icon="mdi-refresh"
          @click="refreshScreenPreview"
          :loading="refreshing"
        >
          Refresh
        </v-btn>
        <v-btn 
          v-if="!previewScreen?.channel"
          color="warning"
          class="ml-3"
          prepend-icon="mdi-link"
          @click="openSetContentDialog(previewScreen); showPreviewDialog = false;"
        >
          Set Content
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.screens-page {
  padding: 1.5rem 2rem;
  min-height: 100%;
  background: #f9fafb;
}

/* Top Bar */
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.top-bar-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #fdc704;
  color: white;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-new:hover {
  background: #e6b400;
}

.btn-new-group {
  background: white;
  color: #fdc704;
  border: 1.5px solid #fdc704;
}

.btn-new-group:hover {
  background: #fffdf0;
}

/* Search */
.search-row {
  margin-bottom: 1.5rem;
}

.search-box {
  display: flex;
  align-items: center;
  width: 340px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.search-input {
  flex: 1;
  padding: 0.6rem 0.875rem;
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
  padding: 0.5rem 0.875rem;
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

/* Ungrouped Section */
.ungrouped-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.screens-list {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

/* Groups Container */
.groups-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-block {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

/* Group Header */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  background: white;
}

.group-name {
  font-weight: 700;
  font-size: 1rem;
  color: #fdc704;
}

/* Screen Row */
.screen-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}

.screen-row:last-child {
  border-bottom: none;
}

.screen-row:hover {
  background: #fafafa;
}

.screen-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: #fff8e1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Screen Info */
.screen-info {
  flex: 1;
  min-width: 0;
}

.screen-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 4px;
}

.screen-name {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.type-badge {
  background: #fdc704;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.screen-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-offline {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ef4444;
}

.offline-time {
  font-size: 0.78rem;
  color: #ef4444;
  opacity: 0.85;
}

/* Channel */
.screen-channel {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 140px;
}

.running-icon {
  font-size: 1rem;
}

.channel-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.ext-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.no-channel {
  font-size: 0.85rem;
  color: #9ca3af;
  font-style: italic;
}

/* Preview Button */
.btn-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: #fdc704;
  border: 1.5px solid #fdc704;
  padding: 0.5rem 1.1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-preview:hover {
  background: #fdc704;
  color: white;
}

/* More Button */
.more-btn {
  background: none;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  transition: all 0.2s;
}

.more-btn:hover {
  background: #f3f4f6;
  border-color: #fdc704;
  color: #111827;
}

/* Empty Group */
.empty-group {
  padding: 1.5rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* ── Dialogs ───────────────────────────────────── */
.dialog-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.dialog-box {
  background: white; border-radius: 14px;
  width: 90%; max-width: 480px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  animation: slideUp 0.25s ease;
}

.dialog-box--sm {
  max-width: 420px;
}

.dialog-box--md {
  max-width: 500px;
}

.dialog-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.dialog-head h3 {
  margin: 0; font-size: 1rem; font-weight: 700; color: #111827;
}

.dlg-close {
  background: none; border: none; cursor: pointer;
  color: #9ca3af; display: flex; align-items: center;
  padding: 4px; border-radius: 6px; transition: background 0.2s;
}
.dlg-close:hover { background: #f3f4f6; color: #374151; }

.dialog-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

.screen-illus {
  display: flex; justify-content: center;
  padding: 0.5rem 0 1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-group label {
  font-size: 0.875rem; font-weight: 500; color: #374151;
}

.form-input, .form-select {
  width: 100%; padding: 0.7rem 0.875rem;
  border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 0.9rem; color: #111827; background: white;
  transition: border-color 0.2s; outline: none;
  box-sizing: border-box;
}
.form-input:focus, .form-select:focus { border-color: #fdc704; }
.form-select { appearance: none; cursor: pointer; }

/* Pairing Code */
.pairing-boxes {
  display: flex; gap: 8px; margin-top: 4px;
}
.pairing-box {
  width: 48px; height: 52px;
  border: 2px solid #d1d5db; border-radius: 8px;
  text-align: center; font-size: 1.1rem; font-weight: 700;
  color: #111827; background: #f9fafb;
  outline: none; text-transform: uppercase;
  transition: border-color 0.2s;
}
.pairing-box:focus { border-color: #fdc704; background: white; }

/* Checkbox */
.checkbox-group { flex-direction: row; align-items: center; gap: 0.5rem; }
.checkbox-group input[type="checkbox"] { width: 16px; height: 16px; accent-color: #fdc704; }
.checkbox-group label { margin: 0; font-size: 0.85rem; font-weight: 400; }

.info-text { font-size: 0.8rem; color: #6b7280; margin: -0.5rem 0 0; }
.text-error { color: #ef4444; }

.warning-box {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #92400e;
  margin-top: 0.5rem;
}

/* Screen Select List */
.screens-select-list {
  border: 1px solid #e5e7eb; border-radius: 8px;
  max-height: 200px; overflow-y: auto;
}
.screen-check-item {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer; transition: background 0.15s;
  font-size: 0.875rem; color: #374151;
}
.screen-check-item:last-child { border-bottom: none; }
.screen-check-item:hover { background: #fffdf0; }
.screen-check-item input[type="checkbox"] { accent-color: #fdc704; flex-shrink: 0; }
.type-tag { margin-left: auto; background: #fdc704; color: white; font-size: 0.7rem; font-weight: 700; padding: 1px 7px; border-radius: 8px; }
.no-screens { padding: 1.5rem; text-align: center; color: #9ca3af; font-size: 0.875rem; }

.dialog-foot {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex; justify-content: flex-end;
}

.btn-dlg-primary {
  background: #fdc704; color: white; border: none;
  padding: 0.75rem 2rem; border-radius: 10px;
  font-size: 0.95rem; font-weight: 700; cursor: pointer;
  transition: background 0.2s;
}
.btn-dlg-primary:hover { background: #e6b400; }
.btn-dlg-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.text-center { text-align: center; }
.mb-4 { margin-bottom: 1rem; }
.mb-2 { margin-bottom: 0.5rem; }
.justify-center { justify-content: center; }
.text-h5 { font-size: 1.125rem; }
.font-weight-bold { font-weight: 700; }
.text-medium-emphasis { color: #6b7280; }
.text-grey-darken-1 { color: #4b5563; }

/* ── Preview Styles (Fullscreen Dialog) ───────────── */
.preview-container {
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 16/9;
  background: #1f2937;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.preview-container.offline {
  opacity: 0.8;
}

.channel-preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
}

.offline-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-details-footer {
  padding: 0 2rem;
}

.font-weight-mono {
  font-family: monospace;
  letter-spacing: 2px;
}

.text-grey {
  color: #9ca3af !important;
}

/* Responsive */
@media (max-width: 960px) {
  .preview-container {
    max-width: 100%;
    margin: 0 1rem;
  }
  .screen-details-footer {
    padding: 0 1rem;
  }
}
</style>