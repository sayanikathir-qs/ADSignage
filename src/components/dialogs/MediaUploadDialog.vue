<!-- src/components/dialogs/MediaUploadDialog.vue -->
<template>
  <v-dialog v-model="dialogOpen" max-width="600" persistent>
    <v-card>
      <v-card-title class="dialog-header">
        <v-icon color="primary" class="mr-3" size="24">mdi-upload</v-icon>
        <span class="dialog-title">Upload Media</span>
      </v-card-title>
      
      <v-card-text>
        <!-- File Upload -->
        <v-file-input
          v-model="files"
          label="Select files"
          multiple
          variant="outlined"
          density="comfortable"
          prepend-icon="mdi-paperclip"
          show-size
          counter
          class="mb-4"
        />
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="loading"
          :disabled="files.length === 0"
        >
          Upload
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useMediaStore } from '@/stores/media';

const props = defineProps({
  modelValue: Boolean,
  loading: Boolean,
  currentFolderId: String,
});

const emit = defineEmits(['update:modelValue', 'submit']);

const mediaStore = useMediaStore();

const dialogOpen = ref(props.modelValue);
const files = ref([]);


watch(() => props.modelValue, (val) => {
  dialogOpen.value = val;
  if (!val) {
    // Reset on close
    files.value = [];
  }
});

watch(dialogOpen, (val) => {
  emit('update:modelValue', val);
});

const handleSubmit = () => {
  if (files.value.length === 0) return;

  Array.from(files.value).forEach((file) => {
    const type = getFileType(file.name);
    const payload = {
      name: file.name,
      type,
      size: formatFileSize(file.size),
      folderId: props.currentFolderId || null,
    };
    emit('submit', payload);
  });
};

const handleCancel = () => {
  emit('update:modelValue', false);
};

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', svg: 'image', webp: 'image',
    mp4: 'video', webm: 'video', avi: 'video', mov: 'video',
    html: 'html', htm: 'html',
    pdf: 'pdf',
  };
  return types[ext] || 'document';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
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
</style>