<template>
  <v-dialog v-model="dialogOpen" max-width="760" persistent>
    <v-card class="upload-dialog-card">
      <!-- Header -->
      <div class="dialog-header">
        <span class="dialog-title">Upload Media</span>
        <button class="close-btn" @click="handleCancel">✕</button>
      </div>

      <!-- Tab bar -->
      <div class="tab-bar">
        <button class="tab tab--active">
          <v-icon size="28">mdi-monitor</v-icon>
          <span class="tab-label">Media Device</span>
        </button>
      </div>

      <!-- Drop zone card -->
      <div class="dropzone-wrapper">
        <div class="dropzone-card">
          <h3 class="dropzone-title">Upload your files</h3>
          <p class="dropzone-subtitle">Please upload mp4 file only. Maximum video size is 30MB</p>

          <div
            class="dropzone"
            :class="{ 'dropzone--over': isDragging }"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <div class="dropzone-icon">
              <svg width="60" height="52" viewBox="0 0 60 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Folder body -->
                <rect x="2" y="14" width="56" height="36" rx="4" fill="#4A90D9"/>
                <!-- Folder tab -->
                <path d="M2 14 L2 10 Q2 6 6 6 L22 6 L28 14 Z" fill="#5BA3F5"/>
                <!-- Folder front highlight -->
                <rect x="2" y="18" width="56" height="32" rx="4" fill="#5BA3F5"/>
              </svg>
            </div>
            <p class="dropzone-hint">Choose your files or drag them here</p>
            <input
              ref="fileInputRef"
              type="file"
              accept="video/mp4"
              class="file-input-hidden"
              @change="handleFileChange"
            />
          </div>

          <!-- Selected file preview -->
          <div v-if="selectedFile" class="file-preview">
            <v-icon size="18" color="#8b5cf6">mdi-video</v-icon>
            <span class="file-preview-name">{{ selectedFile.name }}</span>
            <span class="file-preview-size">{{ formatSize(selectedFile.size) }}</span>
            <button class="file-remove-btn" @click="selectedFile = null">✕</button>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue', 'submit']);

const dialogOpen = ref(props.modelValue);
const isDragging = ref(false);
const selectedFile = ref(null);
const fileInputRef = ref(null);

watch(() => props.modelValue, (val) => {
  dialogOpen.value = val;
  if (!val) selectedFile.value = null;
});
watch(dialogOpen, (val) => emit('update:modelValue', val));

const triggerFileInput = () => fileInputRef.value?.click();

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) processFile(file);
};

const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) processFile(file);
};

const processFile = (file) => {
  if (!file.name.toLowerCase().endsWith('.mp4')) return;
  if (file.size > 30 * 1024 * 1024) return;
  selectedFile.value = file;
  emit('submit', { file, name: file.name, size: formatSize(file.size) });
  emit('update:modelValue', false);
};

const handleCancel = () => emit('update:modelValue', false);

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
</script>

<style scoped>
.upload-dialog-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.close-btn {
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
.close-btn:hover { background: #f3f4f6; }

/* Tab bar */
.tab-bar {
  display: flex;
  padding: 16px 24px 0;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  min-width: 90px;
  transition: background 0.15s;
}

.tab--active {
  background: white;
  border: 1px solid #e5e7eb;
  border-bottom: 2px solid white;
  margin-bottom: -1px;
}

.tab-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

/* Dropzone wrapper */
.dropzone-wrapper {
  padding: 24px;
}

.dropzone-card {
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.08);
}

.dropzone-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  text-align: center;
  margin: 0 0 8px;
}

.dropzone-subtitle {
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  margin: 0 0 24px;
}

.dropzone {
  border: 2px dashed #93c5fd;
  border-radius: 12px;
  padding: 48px 24px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  background: #f8fbff;
  transition: background 0.2s, border-color 0.2s;
}

.dropzone:hover,
.dropzone--over {
  background: #eff6ff;
  border-color: #3b82f6;
}

.dropzone-icon {
  pointer-events: none;
}

.dropzone-hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  pointer-events: none;
}

.file-input-hidden {
  display: none;
}

/* File preview row */
.file-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  background: #f5f3ff;
  border-radius: 8px;
  border: 1px solid #ddd6fe;
}

.file-preview-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-preview-size {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

.file-remove-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}
.file-remove-btn:hover { color: #ef4444; }
</style>
