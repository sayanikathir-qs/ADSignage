<template>
  <div class="detail-page">

    <!-- Yellow instance list header -->
    <div class="instance-header">
      <span class="instance-header-title">{{ appLabel }} Instance List</span>
      <button class="add-btn" @click="openAdd" title="Add instance">
        <v-icon size="22">mdi-plus-circle-outline</v-icon>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="list.length === 0" class="empty-state">
      <v-icon size="64" color="#d1d5db">mdi-playlist-plus</v-icon>
      <p class="empty-text">No instances yet. Click <strong>+</strong> to add one.</p>
    </div>

    <!-- Instance rows -->
    <div v-else class="instance-list">
      <div v-for="item in list" :key="item.id" class="instance-row">
        <!-- Left: icon + name + duration -->
        <div class="row-left">
          <div class="instance-icon">
            <v-icon size="20" color="#fdc704">mdi-shield-account</v-icon>
          </div>
          <div>
            <div class="instance-name">{{ item.name }}</div>
            <div class="instance-duration">{{ item.duration }}</div>
          </div>
        </div>

        <!-- Center: last run -->
        <div class="row-center">
          <v-icon size="16" color="#22c55e" class="mr-1">mdi-run-fast</v-icon>
          <span class="instance-date">{{ item.lastRun }}</span>
        </div>

        <!-- Right: Preview + menu -->
        <div class="row-right">
          <button class="preview-btn" @click="handlePreview(item)">
            <v-icon size="14" color="#fdc704">mdi-play</v-icon>
            Preview
          </button>

          <div class="menu-wrapper">
            <button class="menu-trigger" @click.stop="toggleMenu(item.id)">
              <v-icon size="20" color="#9ca3af">mdi-dots-vertical</v-icon>
            </button>

            <div v-if="openMenuId === item.id" class="dropdown-menu" v-click-outside="closeMenu">
              <button class="dropdown-item" @click="handleSetToScreen(item)">
                <v-icon size="14">mdi-monitor-share</v-icon>
                Set to Screen
              </button>
              <button class="dropdown-item" @click="handleEdit(item)">
                <v-icon size="14">mdi-pencil</v-icon>
                Edit
              </button>
              <button class="dropdown-item dropdown-item--danger" @click="handleDelete(item)">
                <v-icon size="14">mdi-delete</v-icon>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="500" persistent>
      <v-card class="dialog-card">
        <div class="dialog-header">
          <span class="dialog-title">{{ editItem ? 'Edit' : appLabel }} Instance</span>
          <button class="dialog-close" @click="closeDialog">✕</button>
        </div>

        <div class="dialog-body">
          <!-- Instance name (always first) -->
          <div class="form-field">
            <label class="field-label">{{ appLabel }} Instance Name*</label>
            <input
              v-model="form.name"
              type="text"
              class="field-input"
              :class="{ 'field-input--error': errors.name }"
              placeholder="Instance name"
              @focus="errors.name = ''"
            />
            <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
          </div>

          <!-- Dynamic fields per app type -->
          <template v-for="field in appForm" :key="field.key">
            <div class="form-field">
              <label class="field-label">{{ field.label }}</label>

              <input
                v-if="field.type === 'text' || field.type === 'url' || field.type === 'date'"
                v-model="form[field.key]"
                :type="field.type"
                class="field-input"
                :class="{ 'field-input--error': errors[field.key] }"
                :placeholder="field.placeholder || ''"
                @focus="errors[field.key] = ''"
              />

              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="form[field.key]"
                class="field-textarea"
                :class="{ 'field-input--error': errors[field.key] }"
                :placeholder="field.placeholder || ''"
                rows="3"
                @focus="errors[field.key] = ''"
              />

              <select
                v-else-if="field.type === 'select'"
                v-model="form[field.key]"
                class="field-select"
              >
                <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>

              <label v-else-if="field.type === 'checkbox'" class="checkbox-label">
                <input type="checkbox" v-model="form[field.key]" class="checkbox-input" />
                <span class="checkbox-custom"></span>
                <span>{{ field.label }}</span>
              </label>

              <span v-if="errors[field.key]" class="field-error">{{ errors[field.key] }}</span>
            </div>
          </template>
        </div>

        <div class="dialog-footer">
          <button class="submit-btn" @click="handleSubmit">Submit</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <span class="dialog-title">Delete Instance</span>
          <button class="dialog-close" @click="deleteDialog = false">✕</button>
        </div>
        <div class="dialog-body">
          <p>Are you sure you want to delete <strong>{{ deleteTarget?.name }}</strong>?</p>
        </div>
        <div class="dialog-footer" style="gap:8px;">
          <button class="cancel-btn" @click="deleteDialog = false">Cancel</button>
          <button class="submit-btn submit-btn--danger" @click="confirmDelete">Delete</button>
        </div>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { APP_TYPES, APP_FORMS, useApplicationsStore } from '@/stores/applications'

const route  = useRoute()
const store  = useApplicationsStore()

const appType  = computed(() => route.params.appType)
const appMeta  = computed(() => APP_TYPES.find(a => a.type === appType.value) || { name: appType.value })
const appLabel = computed(() => appMeta.value.name)
const appForm  = computed(() => APP_FORMS[appType.value] || [])
const list     = computed(() => store.getList(appType.value))

// ── dialog state ────────────────────────────────────────
const dialogOpen = ref(false)
const editItem   = ref(null)
const form       = ref({})
const errors     = ref({})

const openAdd = () => {
  editItem.value = null
  form.value     = {}
  errors.value   = {}
  dialogOpen.value = true
}

const handleEdit = (item) => {
  closeMenu()
  editItem.value  = item
  form.value      = { ...item }
  errors.value    = {}
  dialogOpen.value = true
}

const closeDialog = () => { dialogOpen.value = false }

const validate = () => {
  const e = {}
  if (!form.value.name?.trim()) e.name = 'Name is required'
  for (const field of appForm.value) {
    if (field.required && !form.value[field.key]?.toString().trim()) {
      e[field.key] = `${field.label.replace(' *', '')} is required`
    }
  }
  errors.value = e
  return Object.keys(e).length === 0
}

const handleSubmit = () => {
  if (!validate()) return
  if (editItem.value) {
    store.update(appType.value, editItem.value.id, { ...form.value })
  } else {
    store.add(appType.value, { ...form.value })
  }
  dialogOpen.value = false
}

// ── delete ───────────────────────────────────────────────
const deleteDialog = ref(false)
const deleteTarget = ref(null)

const handleDelete = (item) => {
  closeMenu()
  deleteTarget.value = item
  deleteDialog.value = true
}

const confirmDelete = () => {
  if (deleteTarget.value) store.remove(appType.value, deleteTarget.value.id)
  deleteDialog.value = false
  deleteTarget.value = null
}

// ── three-dot menu ───────────────────────────────────────
const openMenuId = ref(null)

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const closeMenu = () => { openMenuId.value = null }

const handleClickOutside = (e) => {
  if (!e.target.closest('.menu-wrapper')) closeMenu()
}

onMounted  (() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

// ── preview ──────────────────────────────────────────────
const handlePreview = (item) => {
  const url = item.url || item.username || item.location || ''
  if (url.startsWith('http')) window.open(url, '_blank')
}

// ── set to screen (stub) ─────────────────────────────────
const handleSetToScreen = (item) => {
  closeMenu()
  alert(`"${item.name}" would be assigned to a screen here.`)
}
</script>

<style scoped>
.detail-page {
  padding: 24px 32px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* ── Yellow instance header ── */
.instance-header {
  background: #fdc704;
  border-radius: 10px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.instance-header-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
}

.add-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1a1a2e;
  transition: background 0.15s;
}
.add-btn:hover { background: rgba(255,255,255,0.3); }

/* ── Empty state ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  gap: 12px;
}
.empty-text { color: #9ca3af; font-size: 14px; }

/* ── Instance list ── */
.instance-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.instance-row {
  background: white;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background 0.15s;
}
.instance-row:first-child { border-radius: 10px 10px 0 0; }
.instance-row:last-child  { border-bottom: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
.instance-row:only-child  { border-radius: 10px; border-bottom: 1px solid #e5e7eb; }
.instance-row:hover { background: #fafafa; }

/* Row left */
.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.instance-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #fff8e1;
  border: 1px solid #fde68a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.instance-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instance-duration {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

/* Row center */
.row-center {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 200px;
}

.instance-date {
  font-size: 13px;
  color: #6b7280;
}

/* Row right */
.row-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.preview-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border: 1.5px solid #fdc704;
  border-radius: 20px;
  background: white;
  color: #fdc704;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.preview-btn:hover { background: #fff8e1; }

/* Three-dot menu */
.menu-wrapper {
  position: relative;
}

.menu-trigger {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.menu-trigger:hover { background: #f3f4f6; }

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 40px;
  z-index: 100;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  min-width: 150px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.dropdown-item:hover { background: #f3f4f6; }
.dropdown-item--danger { color: #ef4444; }
.dropdown-item--danger:hover { background: #fef2f2; }

/* ── Dialog ── */
.dialog-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 16px;
  color: #6b7280;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s;
}
.dialog-close:hover { background: #f3f4f6; }

.dialog-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-footer {
  padding: 16px 24px 20px;
  display: flex;
  align-items: center;
}

/* Form fields */
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.field-input,
.field-textarea,
.field-select {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  background: white;
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus {
  border-color: #fdc704;
  box-shadow: 0 0 0 3px rgba(253, 199, 4, 0.15);
}

.field-input--error {
  border-color: #ef4444 !important;
}

.field-textarea { resize: vertical; min-height: 80px; }

.field-error {
  font-size: 11px;
  color: #ef4444;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}
.checkbox-input { display: none; }
.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}
.checkbox-input:checked + .checkbox-custom {
  background: #fdc704;
  border-color: #fdc704;
}
.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  width: 10px;
  height: 6px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(-45deg) translateY(-1px);
  display: block;
}

/* Buttons */
.submit-btn {
  background: #fdc704;
  color: #1a1a2e;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.submit-btn:hover { background: #e6b200; }
.submit-btn--danger { background: #ef4444; color: white; }
.submit-btn--danger:hover { background: #dc2626; }

.cancel-btn {
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.cancel-btn:hover { background: #e5e7eb; }

@media (max-width: 768px) {
  .detail-page { padding: 16px; }
  .row-center { display: none; }
}
</style>
