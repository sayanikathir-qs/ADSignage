<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScreensStore } from '@/stores/screen'
import { useChannelsStore } from '@/stores/channel'
import { usePlaylistStore } from '@/stores/playlist'
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
const playlistStore = usePlaylistStore()

const searchQuery = ref('')

// Load data on mount
onMounted(async () => {
  await screensStore.fetchScreens()
  await channelsStore.fetchChannels()
  await playlistStore.fetchPlaylists()
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

// ── Edit Group Dialog ─────────────────────────────────
const showEditGroup = ref(false)
const editingGroup = ref(null)
const editGroupScreenIds = ref([])

const openEditGroupDialog = (group) => {
  editingGroup.value = group
  editGroupScreenIds.value = localScreens.value
    .filter(s => s.groupId === group.id)
    .map(s => s.id)
  showEditGroup.value = true
}

const handleEditGroup = async () => {
  if (!editingGroup.value) return
  const groupId = editingGroup.value.id
  for (const screen of localScreens.value) {
    const selected = editGroupScreenIds.value.includes(screen.id)
    const inGroup = screen.groupId === groupId
    if (selected && !inGroup) await screensStore.assignScreenToGroup(screen.id, groupId)
    if (!selected && inGroup) await screensStore.removeScreenFromGroup(screen.id)
  }
  showEditGroup.value = false
}

// ─ Delete Group Dialog ────────────────────────────────
const showDeleteGroup = ref(false)
const deletingGroup = ref(null)

const confirmDeleteGroup = (group) => {
  deletingGroup.value = group
  showDeleteGroup.value = true
}

const handleDeleteGroup = async () => {
  if (!deletingGroup.value) return
  await screensStore.deleteGroup(deletingGroup.value.id)
  showDeleteGroup.value = false
  deletingGroup.value = null
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

// ── Screen Preview ─────────────────────────────────────────────
const showPreviewDialog = ref(false)
const previewScreen = ref(null)
const previewIndex = ref(0)
const refreshing = ref(false)

const openPreview = (screen) => {
  previewScreen.value = screen
  previewIndex.value = 0
  showPreviewDialog.value = true
}

// Return the actual media items across all playlists in the channel
const getChannelItems = (channelName) => {
  if (!channelName) return []
  const channel = channelsStore.channels.find(c => c.name === channelName)
  if (!channel?.items?.length) return []
  const mediaItems = []
  channel.items.forEach(playlistRef => {
    const playlist = playlistStore.playlistItems.find(p => p.id === playlistRef.id)
    if (playlist?.items?.length) {
      playlist.items.forEach(item => mediaItems.push({ ...item, _playlistName: playlist.name }))
    }
  })
  return mediaItems
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
              <template v-if="screen.status === 'online'">
                <span class="status-online">ONLINE</span>
              </template>
              <template v-else-if="screen.status === 'pending'">
                <span class="status-pending">PENDING</span>
                <span class="offline-time">Waiting to pair...</span>
              </template>
              <template v-else>
                <span class="status-offline">OFFLINE</span>
                <span class="offline-time" v-if="screen.offlineAt">Offline at: {{ screen.offlineAt }}</span>
              </template>
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
              <v-list-item @click="openEditGroupDialog(group)">
                <template #prepend><Pencil :size="14" class="mr-2" /></template>
                <v-list-item-title>Edit Group</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openAssignChannelDialog(group)">
                <template #prepend><Tv2 :size="14" class="mr-2" /></template>
                <v-list-item-title>Assign Channel to Group</v-list-item-title>
              </v-list-item>
              <v-list-item @click="confirmDeleteGroup(group)" base-color="error">
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
              <template v-if="screen.status === 'online'">
              </template>
              <template v-else-if="screen.status === 'pending'">
                <span class="status-pending">PENDING</span>
                <span class="offline-time">Waiting to pair...</span>
              </template>
              <template v-else>
                <span class="status-offline">OFFLINE</span>
                <span class="offline-time" v-if="screen.offlineAt">Offline at: {{ screen.offlineAt }}</span>
              </template>
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
  <v-dialog v-model="showNewScreen" max-width="500" rounded="lg">
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
  </v-dialog>

  <!-- ── Create New Screen Group Dialog ────────────── -->
  <v-dialog v-model="showNewGroup" max-width="440" rounded="lg">
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
  </v-dialog>

  <!-- ── Edit Group Dialog ────────────────────────── -->
  <v-dialog v-model="showEditGroup" max-width="440" rounded="lg">
    <div class="dialog-box dialog-box--sm">
      <div class="dialog-head">
        <h3>Edit Group — {{ editingGroup?.name }}</h3>
        <button class="dlg-close" @click="showEditGroup = false"><X :size="20" /></button>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label>Select screens for this group</label>
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
                v-model="editGroupScreenIds"
              />
              <Monitor :size="16" color="#fdc704" />
              <span>{{ screen.name }}</span>
              <span v-if="screen.type" class="type-tag">{{ screen.type }}</span>
              <span v-if="screen.groupId && screen.groupId !== editingGroup?.id" class="type-tag" style="color:#9ca3af">
                (in another group)
              </span>
            </label>
          </div>
        </div>
      </div>

      <div class="dialog-foot">
        <button class="btn-dlg-primary" @click="handleEditGroup">Save Changes</button>
      </div>
    </div>
  </v-dialog>

  <!-- ── Assign Channel to Group Dialog ────────────── -->
  <v-dialog v-model="showAssignChannel" max-width="440" rounded="lg">
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
  </v-dialog>

  <!-- ── Set Content Dialog (Individual Screen) ────── -->
  <v-dialog v-model="showSetContent" max-width="440" rounded="lg">
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
  </v-dialog>

  <!-- ── Screen Preview Dialog (popup) ──────────────────── -->
  <v-dialog v-model="showPreviewDialog" max-width="860" rounded="lg">
    <v-card v-if="previewScreen" rounded="lg" elevation="8">
      <div class="preview-dialog-header">
        <div>
          <div class="preview-dialog-title">Screen Preview</div>
          <div class="preview-dialog-sub">{{ previewScreen.name }}
            <v-chip v-if="previewScreen.channel" size="x-small" color="warning" class="ml-2 font-weight-bold text-uppercase">
              {{ previewScreen.channel }}
            </v-chip>
          </div>
        </div>
        <button class="preview-close-btn" @click="showPreviewDialog = false"><X :size="20" /></button>
      </div>
      <v-divider />
      <div class="preview-dialog-body" style="position:relative">
        <!-- No channel -->
        <div v-if="!previewScreen.channel" class="preview-empty" style="height:440px">
          <v-icon size="72" color="grey">mdi-television-off</v-icon>
          <p class="preview-empty-text">No channel assigned to this screen.</p>
        </div>
        <!-- Channel has no media -->
        <div v-else-if="getChannelItems(previewScreen.channel).length === 0" class="preview-empty" style="height:440px">
          <v-icon size="72" color="warning">mdi-television</v-icon>
          <p class="preview-empty-text">No media in this channel's playlists yet.</p>
        </div>
        <!-- Custom slider -->
        <template v-else>
          <template v-if="getChannelItems(previewScreen.channel)[previewIndex]">
            <template v-if="getChannelItems(previewScreen.channel)[previewIndex].url">
              <video v-if="getChannelItems(previewScreen.channel)[previewIndex].type === 'video'" controls autoplay
                :src="getChannelItems(previewScreen.channel)[previewIndex].url" class="preview-media-el" />
              <img v-else-if="getChannelItems(previewScreen.channel)[previewIndex].type === 'image'"
                :src="getChannelItems(previewScreen.channel)[previewIndex].url"
                :alt="getChannelItems(previewScreen.channel)[previewIndex].name" class="preview-media-el" />
              <iframe v-else-if="getChannelItems(previewScreen.channel)[previewIndex].type === 'html'"
                :src="getChannelItems(previewScreen.channel)[previewIndex].url" class="preview-media-el" style="border:none" />
              <div v-else class="preview-empty" style="height:440px">
                <v-icon size="64" color="#fdc704">mdi-file-outline</v-icon>
                <p class="preview-empty-text">{{ getChannelItems(previewScreen.channel)[previewIndex].name }}</p>
              </div>
            </template>
            <div v-else class="preview-empty" style="height:440px">
              <v-icon size="64" color="#fdc704">mdi-play-circle-outline</v-icon>
              <p class="preview-empty-text">{{ getChannelItems(previewScreen.channel)[previewIndex].name }}</p>
            </div>
          </template>

          <template v-if="getChannelItems(previewScreen.channel).length > 1">
            <button class="slider-nav slider-nav--prev" :disabled="previewIndex === 0"
              @click="previewIndex--">&#8249;</button>
            <button class="slider-nav slider-nav--next"
              :disabled="previewIndex === getChannelItems(previewScreen.channel).length - 1"
              @click="previewIndex++">&#8250;</button>
          </template>

          <div class="preview-item-chips" v-if="getChannelItems(previewScreen.channel)[previewIndex]">
            <v-chip size="small" color="#fdc704" class="text-uppercase font-weight-bold">{{ getChannelItems(previewScreen.channel)[previewIndex].type }}</v-chip>
            <v-chip size="small" color="grey-darken-2">{{ getChannelItems(previewScreen.channel)[previewIndex]._playlistName }}</v-chip>
            <v-chip size="small" color="grey-darken-3" v-if="getChannelItems(previewScreen.channel)[previewIndex].duration">{{ getChannelItems(previewScreen.channel)[previewIndex].duration }}</v-chip>
            <span class="preview-counter">{{ previewIndex + 1 }} / {{ getChannelItems(previewScreen.channel).length }}</span>
          </div>
        </template>
      </div>
    </v-card>
  </v-dialog>

  <!-- ── Delete Group Confirm ──────────────────────────── -->
  <v-dialog v-model="showDeleteGroup" max-width="420" rounded="lg">
    <v-card rounded="lg" elevation="8">
      <div class="preview-dialog-header">
        <div class="preview-dialog-title">Delete Group</div>
        <button class="preview-close-btn" @click="showDeleteGroup = false"><X :size="20" /></button>
      </div>
      <v-divider />
      <v-card-text class="pt-5 pb-2">
        <p>Are you sure you want to delete <strong>{{ deletingGroup?.name }}</strong>?</p>
        <p class="text-medium-emphasis text-sm mt-1">Screens in this group will become ungrouped.</p>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0 d-flex justify-end ga-2">
        <v-btn variant="outlined" @click="showDeleteGroup = false">Cancel</v-btn>
        <v-btn color="error" variant="flat" @click="handleDeleteGroup">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* ── Preview popup shared styles ─────── */
.preview-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.875rem;
}
.preview-dialog-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111;
}
.preview-dialog-sub {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.preview-close-btn {
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #374151;
  flex-shrink: 0;
}
.preview-close-btn:hover { background: #e5e7eb; }
.preview-dialog-body {
  background: #111;
  min-height: 200px;
}
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 1rem;
}
.preview-empty-text {
  color: #9ca3af;
  font-size: 0.9rem;
  text-align: center;
}
.preview-media-frame {
  width: 100%;
  height: 440px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.preview-media-el {
  width: 100%;
  height: 440px;
  object-fit: contain;
  background: #000;
}
.preview-item-chips {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  background: #1a1a1a;
  align-items: center;
}
.preview-counter { color: #9ca3af; font-size: 0.78rem; margin-left: auto; }
.slider-nav {
  position: absolute; top: 220px; transform: translateY(-50%);
  background: rgba(0,0,0,0.55); color: #fff; border: none; border-radius: 50%;
  width: 40px; height: 40px; font-size: 1.6rem; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; z-index: 10;
}
.slider-nav:hover:not(:disabled) { background: rgba(0,0,0,0.85); }
.slider-nav:disabled { opacity: 0.3; cursor: default; }
.slider-nav--prev { left: 10px; }
.slider-nav--next { right: 10px; }

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

.status-online {
  font-size: 0.8rem;
  font-weight: 700;
  color: #22c55e;
}

.status-pending {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f59e0b;
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
.dialog-box {
  background: white;
  border-radius: 14px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.dialog-box--sm { width: 100%; }
.dialog-box--md { width: 100%; }

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
</style>