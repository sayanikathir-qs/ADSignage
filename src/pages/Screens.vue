<script setup>
import { ref, computed } from 'vue'
import { screenGroups, screensData } from '../data/mockData'
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

const searchQuery = ref('')

const localScreens = ref(screensData.map(s => ({ ...s })))
const localGroups = ref(screenGroups.map(g => ({ ...g })))

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

// ── New Screen Dialog ──────────────────────────────
const showNewScreen = ref(false)
const newScreen = ref({ name: '', type: 'Web', pairingCode: ['', '', '', '', '', ''], freeTrial: false, subscription: '' })
const pairingRefs = ref([])

const openNewScreenDialog = () => {
  newScreen.value = { name: '', type: 'Web', pairingCode: ['', '', '', '', '', ''], freeTrial: false, subscription: '' }
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

const handleAddScreen = () => {
  if (!newScreen.value.name.trim()) return
  const code = newScreen.value.pairingCode.join('')
  const id = Date.now()
  localScreens.value.push({
    id,
    name: newScreen.value.name.trim(),
    type: newScreen.value.type,
    groupId: localGroups.value[0]?.id || null,
    status: 'offline',
    offlineAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
    channel: null,
    pairingCode: code,
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

const ungroupedScreens = computed(() =>
  localScreens.value.filter(s => !s.groupId)
)

const handleCreateGroup = () => {
  if (!newGroup.value.name.trim()) return
  const id = Date.now()
  localGroups.value.push({ id, name: newGroup.value.name.trim() })
  newGroup.value.selectedScreenIds.forEach(sid => {
    const s = localScreens.value.find(s => s.id === sid)
    if (s) s.groupId = id
  })
  showNewGroup.value = false
}

// ── Screen context menu actions ────────────────────
const handleMenuAction = (action, screenId) => {
  if (action === 'delete') {
    localScreens.value = localScreens.value.filter(s => s.id !== screenId)
  }
  if (action === 'removeChannel') {
    const s = localScreens.value.find(s => s.id === screenId)
    if (s) s.channel = null
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
  <div class="screens-page" @click="closeContextMenu">
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
          <!-- Monitor Icon -->
          <div class="screen-icon">
            <Monitor :size="32" color="#fdc704" />
          </div>

          <!-- Screen Info -->
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

          <!-- Channel -->
          <div class="screen-channel" v-if="screen.channel">
            <span class="running-icon">🏃</span>
            <span class="channel-name">{{ screen.channel }}</span>
            <ExternalLink :size="14" class="ext-icon" />
          </div>
          <div class="screen-channel empty" v-else>
            <span class="no-channel">No channel</span>
          </div>

          <!-- Preview Button -->
          <button class="btn-preview">
            <Play :size="14" />
            Preview
          </button>

          <!-- Context Menu -->
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

        <!-- Empty group state -->
        <div v-if="group.screens.length === 0" class="empty-group">
          No screens in this group
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
        <!-- Illustration placeholder -->
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
  max-width: 380px;
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
</style>
