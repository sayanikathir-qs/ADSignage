<script setup>
import { ref } from 'vue'
import { X, Check } from 'lucide-vue-next'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'create'])

const channelName = ref('New Channel')
const orientation = ref('Portrait')
const selectedLayout = ref('Main')

const layouts = [
  { id: 'Main', name: 'Main', type: 'main' },
  { id: '2 Main Screens', name: '2 Main Screens', type: 'split-v' },
  { id: '4 Main Screens', name: '4 Main Screens', type: 'grid-2x2' },
  { id: 'Main + Right Bar', name: 'Main + Right Bar', type: 'right-bar' },
  { id: 'Main + Left Bar', name: 'Main + Left Bar', type: 'left-bar' },
  { id: 'Main + Header', name: 'Main + Header', type: 'header' },
  { id: 'Main + Footer', name: 'Main + Footer', type: 'footer' },
  { id: 'Main + Bottom', name: 'Main + Bottom', type: 'bottom-bar' }
]

const handleCreate = () => {
  emit('create', {
    name: channelName.value,
    orientation: orientation.value,
    layout: selectedLayout.value
  })
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>Create New Channel</h3>
        <button class="close-btn" @click="$emit('close')">
          <X :size="20" />
        </button>
      </div>

      <div class="dialog-body">
        <div class="form-group">
          <label>Channel Name*</label>
          <input type="text" v-model="channelName" class="form-input" />
        </div>

        <div class="form-group">
          <label>Select Layout*</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="Portrait" v-model="orientation" />
              Portrait
            </label>
            <label class="radio-label">
              <input type="radio" value="Landscape" v-model="orientation" />
              Landscape
            </label>
          </div>
        </div>

        <div class="layouts-grid">
          <div 
            v-for="layout in layouts" 
            :key="layout.id"
            class="layout-option"
            @click="selectedLayout = layout.id"
          >
            <div class="layout-icon-wrapper" :class="{ selected: selectedLayout === layout.id }">
              <div class="layout-icon" :class="[layout.type, orientation.toLowerCase()]">
                <div v-if="selectedLayout === layout.id" class="check-circle">
                  <Check :size="16" color="white" />
                </div>
              </div>
            </div>
            <span class="layout-name">{{ layout.name }}</span>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn-primary" @click="handleCreate">Create Channel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

.dialog-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
}

.form-input:focus {
  outline: none;
  border-color: #14b8a6;
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  accent-color: #3b82f6;
}

.layouts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem 1rem;
  margin-top: 1rem;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.layout-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.layout-icon-wrapper.selected {
  background-color: #eef2ff;
  box-shadow: 0 0 0 2px #c7d2fe;
}

.layout-icon {
  border: 2px solid #1e40af;
  background-color: #3b82f6;
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

/* Base dimensions for Portrait */
.layout-icon.portrait {
  width: 32px;
  height: 48px;
}

/* Base dimensions for Landscape */
.layout-icon.landscape {
  width: 48px;
  height: 32px;
}

/* Layout Variations */
.layout-icon.main {
  background-color: #fde047; /* Yellow */
}

.layout-icon.split-v {
  background: linear-gradient(to right, #3b82f6 50%, #fde047 50%);
}

.layout-icon.grid-2x2 {
  background: conic-gradient(
    #3b82f6 25%, 
    #fde047 25% 50%, 
    #fde047 50% 75%, 
    #3b82f6 75%
  );
}

.layout-icon.right-bar {
  background: linear-gradient(to right, #3b82f6 70%, #fde047 30%);
}

.layout-icon.left-bar {
  background: linear-gradient(to right, #fde047 30%, #3b82f6 70%);
}

.layout-icon.header {
  background: linear-gradient(to bottom, #3b82f6 30%, #fde047 70%);
}

.layout-icon.footer {
  background: linear-gradient(to bottom, #fde047 70%, #3b82f6 30%);
}

.layout-icon.bottom-bar {
  background: linear-gradient(to bottom, #fde047 70%, #3b82f6 30%);
}

.check-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background-color: #10b981; /* Green check */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.layout-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
  text-align: center;
  background-color: #fef08a;
  padding: 2px 8px;
  border-radius: 12px;
}

.dialog-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background-color: #14b8a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #14b8a6;
}
</style>
