<!-- src/components/dialogs/MediaUploadDialog.vue -->
<template>
  <v-dialog v-model="dialogOpen" max-width="560" persistent>
    <v-card>
      <v-card-title class="dialog-header">
        <v-icon style="color:#fdc704" size="24">mdi-upload</v-icon>
        <span class="dialog-title">Upload Media</span>
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="handleCancel">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <!-- File picker -->
        <v-file-input
          v-model="files"
          label="Select files"
          multiple
          variant="outlined"
          density="comfortable"
          prepend-icon="mdi-paperclip"
          show-size
          counter
          class="mb-3"
          color="#fdc704"
          accept="image/*,video/*,.html,.htm,.pdf"
        />

        <!-- Customer -->
        <div class="form-row mb-3">
          <label class="form-label">Customer</label>
          <input v-model="customer" type="text" class="form-text-input" placeholder="Enter customer name" />
        </div>

        <!-- File list preview -->
        <div v-if="files.length > 0" class="file-list">
          <div v-for="(f, i) in files" :key="i" class="file-row">
            <v-icon size="18" :color="typeColor(getFileType(f.name))">{{ typeIcon(getFileType(f.name)) }}</v-icon>
            <span class="file-name">{{ f.name }}</span>
            <span class="file-size">{{ formatFileSize(f.size) }}</span>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn variant="text" @click="handleCancel" :disabled="loading">Cancel</v-btn>
        <v-btn
          variant="flat"
          style="background:#fdc704;color:white;border-radius:8px;font-weight:600"
          @click="handleSubmit"
          :loading="loading"
          :disabled="files.length === 0"
        >
          Upload {{ files.length > 1 ? `(${files.length} files)` : '' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  currentFolderId: { type: [String, Number], default: null },
});

const emit = defineEmits(['update:modelValue', 'submit']);

const dialogOpen = ref(props.modelValue);
const files = ref([]);
const customer = ref('');

watch(() => props.modelValue, (val) => {
  dialogOpen.value = val;
  if (!val) { files.value = []; customer.value = ''; }
});
watch(dialogOpen, (val) => emit('update:modelValue', val));

const handleSubmit = async () => {
  if (files.value.length === 0) return;

  const fileArray = Array.from(files.value);
  for (const file of fileArray) {
    const sizeBytes = file.size || 0;
    const url = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });

    const type = getFileType(file.name);

    emit('submit', {
      name: file.name,
      type,
      size: formatFileSize(sizeBytes),
      folderId: props.currentFolderId || null,
      customer: customer.value.trim() || 'Unknown',
      gradient: gradientForType(type),
      url,
    });
  }

  emit('update:modelValue', false);
};

const handleCancel = () => emit('update:modelValue', false);

const getFileType = (filename) => {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const map = {
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', svg: 'image', webp: 'image',
    mp4: 'video', webm: 'video', avi: 'video', mov: 'video', mkv: 'video',
    html: 'html', htm: 'html',
    pdf: 'pdf',
  };
  return map[ext] || 'document';
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const gradientForType = (type) => {
  const g = {
    video: 'linear-gradient(135deg,#3730a3,#1e3a5f)',
    image: 'linear-gradient(135deg,#064e3b,#1e3a5f)',
    html:  'linear-gradient(135deg,#78350f,#b45309)',
    pdf:   'linear-gradient(135deg,#7f1d1d,#450a0a)',
  };
  return g[type] || 'linear-gradient(135deg,#1f2937,#374151)';
};

const typeIcon = (type) => ({
  video: 'mdi-video', image: 'mdi-image', html: 'mdi-language-html5', pdf: 'mdi-file-pdf-box',
}[type] || 'mdi-file');

const typeColor = (type) => ({
  video: '#8b5cf6', image: '#fdc704', html: '#f59e0b', pdf: '#ef4444',
}[type] || '#9ca3af');
</script>

<style scoped>
.dialog-header {
  display: flex;
  align-items: center;
  padding: 20px 24px 16px;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
}
.btn-primary {
  background-color: #fdc704;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}
</style>