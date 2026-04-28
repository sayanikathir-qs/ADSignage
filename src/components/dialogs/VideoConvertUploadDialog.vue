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
        <div class="tab tab--active">
          <v-icon size="28">mdi-monitor</v-icon>
          <span class="tab-label">Media Device</span>
        </div>
      </div>

      <!-- Drop zone card -->
      <div class="dropzone-wrapper">
        <div class="dropzone-card">
          <h3 class="dropzone-title">Upload your files</h3>
          <p class="dropzone-subtitle">Please upload mp4 file only. Maximum video size is 30MB</p>

          <!-- Hidden file input — must be OUTSIDE the label to avoid double-trigger -->
          <input
            id="vc-file-input"
            type="file"
            accept=".mp4,.MP4,video/mp4"
            class="file-input-hidden"
            @change="handleFileChange"
          />

          <!-- label triggers the input natively (no programmatic .click() needed) -->
          <label
            for="vc-file-input"
            class="dropzone"
            :class="{ 'dropzone--over': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <div class="dropzone-icon" aria-hidden="true">
              <svg width="60" height="52" viewBox="0 0 60 52" fill="none">
                <path d="M2 14 L2 10 Q2 6 6 6 L22 6 L28 14 Z" fill="#5BA3F5"/>
                <rect x="2" y="14" width="56" height="36" rx="4" fill="#4A90D9"/>
                <rect x="2" y="18" width="56" height="32" rx="4" fill="#5BA3F5"/>
              </svg>
            </div>
            <p class="dropzone-hint">Choose your files or drag them here</p>
          </label>

          <!-- Error message -->
          <div v-if="errorMsg" class="error-banner">
            <v-icon size="16" color="#ef4444">mdi-alert-circle</v-icon>
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Selected file preview -->
          <div v-if="selectedFile" class="file-preview">
            <v-icon size="20" color="#8b5cf6">mdi-video</v-icon>
            <div class="file-preview-info">
              <span class="file-preview-name">{{ selectedFile.name }}</span>
              <span class="file-preview-size">{{ formatSize(selectedFile.size) }}</span>
            </div>
            <button class="file-remove-btn" @click="clearFile" title="Remove">
              <v-icon size="16">mdi-close</v-icon>
            </button>
          </div>

          <!-- Upload button — only shown when a valid file is selected -->
          <div v-if="selectedFile" class="upload-action">
            <button class="upload-btn" @click="handleSubmit">
              <v-icon size="16">mdi-upload</v-icon>
              Upload
            </button>
          </div>
        </div>
      </div>

    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({ modelValue: Boolean });
const emit  = defineEmits(['update:modelValue', 'submit']);

const dialogOpen  = ref(props.modelValue);
const isDragging  = ref(false);
const selectedFile = ref(null);
const errorMsg     = ref('');

watch(() => props.modelValue, (val) => {
  dialogOpen.value = val;
  if (!val) clearFile();
});
watch(dialogOpen, (val) => emit('update:modelValue', val));

const clearFile = () => {
  selectedFile.value = null;
  errorMsg.value     = '';
  // Reset the native input so the same file can be re-selected
  const input = document.getElementById('vc-file-input');
  if (input) input.value = '';
};

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) validate(file);
};

const handleDrop = (e) => {
  isDragging.value = false;
  const file = e.dataTransfer.files?.[0];
  if (file) validate(file);
};

const validate = (file) => {
  errorMsg.value     = '';
  selectedFile.value = null;

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'mp4') {
    errorMsg.value = `"${file.name}" is not an mp4 file. Please upload an mp4 file.`;
    return;
  }

  const maxBytes = 30 * 1024 * 1024;
  if (file.size > maxBytes) {
    errorMsg.value = `File is ${formatSize(file.size)} — exceeds the 30 MB limit.`;
    return;
  }

  selectedFile.value = file;
};

const handleSubmit = () => {
  if (!selectedFile.value) return;
  emit('submit', {
    file: selectedFile.value,
    name: selectedFile.value.name,
    size: formatSize(selectedFile.value.size),
  });
  emit('update:modelValue', false);
};

const handleCancel = () => emit('update:modelValue', false);

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B','KB','MB','GB'][i];
};
</script>

<style scoped>
.upload-dialog-card {
  border-radius: 12px !important;
  overflow: hidden;
}

/* Header */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.dialog-title { font-size: 16px; font-weight: 600; color: #1a1a2e; }

.close-btn {
  background: none; border: none; font-size: 16px; color: #6b7280;
  cursor: pointer; width: 28px; height: 28px; display: flex;
  align-items: center; justify-content: center; border-radius: 50%;
  transition: background 0.15s;
}
.close-btn:hover { background: #f3f4f6; }

/* Tab */
.tab-bar { display: flex; padding: 16px 24px 0; border-bottom: 1px solid #e5e7eb; }
.tab {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 20px; border-radius: 8px 8px 0 0; min-width: 90px;
  background: #f3f4f6;
}
.tab--active {
  background: white; border: 1px solid #e5e7eb;
  border-bottom: 2px solid white; margin-bottom: -1px;
}
.tab-label { font-size: 12px; font-weight: 500; color: #374151; }

/* Dropzone wrapper */
.dropzone-wrapper { padding: 24px; }
.dropzone-card {
  background: white; border-radius: 12px; padding: 32px 24px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.08);
}

.dropzone-title {
  font-size: 18px; font-weight: 600; color: #1a1a2e;
  text-align: center; margin: 0 0 8px;
}
.dropzone-subtitle { font-size: 13px; color: #9ca3af; text-align: center; margin: 0 0 24px; }

/* Hidden file input */
.file-input-hidden {
  position: absolute;
  width: 1px; height: 1px;
  opacity: 0; overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
}

/* Dropzone label — entire area is clickable */
.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px 36px;
  border: 2px dashed #93c5fd;
  border-radius: 12px;
  background: #f8fbff;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  user-select: none;
}
.dropzone:hover,
.dropzone--over {
  background: #eff6ff;
  border-color: #3b82f6;
}

.dropzone-icon { pointer-events: none; }
.dropzone-hint { font-size: 14px; color: #6b7280; margin: 0; pointer-events: none; }

/* Error banner */
.error-banner {
  display: flex; align-items: center; gap: 8px;
  margin-top: 14px; padding: 10px 14px;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 8px; font-size: 13px; color: #ef4444;
}

/* File preview */
.file-preview {
  display: flex; align-items: center; gap: 10px;
  margin-top: 16px; padding: 12px 14px;
  background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 8px;
}
.file-preview-info { flex: 1; min-width: 0; }
.file-preview-name {
  display: block; font-size: 13px; font-weight: 500; color: #1a1a2e;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.file-preview-size { font-size: 12px; color: #9ca3af; }

.file-remove-btn {
  background: none; border: none; color: #9ca3af; cursor: pointer;
  display: flex; align-items: center; padding: 0; flex-shrink: 0;
}
.file-remove-btn:hover { color: #ef4444; }

/* Upload button */
.upload-action { margin-top: 16px; display: flex; justify-content: flex-end; }
.upload-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: #fdc704; color: #1a1a2e;
  border: none; border-radius: 8px; padding: 10px 28px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
}
.upload-btn:hover { background: #e6b200; }
</style>
