<template>
  <v-dialog v-model="isOpen" max-width="700" persistent>
    <v-card class="upload-dialog">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3">
        <div class="d-flex align-center ga-3">
          <v-avatar class="upload-avatar" size="44">
            <v-icon color="white" size="24">mdi-cloud-upload</v-icon>
          </v-avatar>
          <div>
            <h2 class="text-h6 font-weight-bold mb-1">Upload Media</h2>
            <p class="text-caption text-medium-emphasis mb-0">
              Add new files to your media library
            </p>
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="handleCancel" />
      </v-card-title>

      <v-divider />

      <!-- Content -->
      <v-card-text class="pa-5">
        <!-- Upload Zone -->
        <div
          class="upload-zone"
          :class="{ 
            'upload-zone--dragover': isDragOver,
            'upload-zone--has-files': selectedFiles.length > 0 
          }"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.html,.htm"
            class="file-input"
            @change="handleFileSelect"
          />

          <div class="upload-zone-content">
            <v-icon
              size="64"
              :class="isDragOver ? 'text-green' : 'text-grey-lighten-1'"
              class="mb-3"
            >
              {{ isDragOver ? 'mdi-cloud-download' : 'mdi-cloud-upload' }}
            </v-icon>
            <h3 class="text-h6 font-weight-medium mb-2">
              {{ isDragOver ? 'Drop files here' : 'Drag & drop files here' }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-3">
              or <span class="text-green font-weight-medium">click to browse</span>
            </p>
            <p class="text-caption text-medium-emphasis">
              Supports: Images, Videos, PDF, HTML (Max 500MB per file)
            </p>
          </div>
        </div>

        <!-- Selected Files List -->
        <div v-if="selectedFiles.length > 0" class="mt-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <h4 class="text-subtitle-2 font-weight-bold">
              Selected Files ({{ selectedFiles.length }})
            </h4>
            <v-btn
              size="small"
              variant="text"
              color="error"
              @click="clearAllFiles"
            >
              Clear All
            </v-btn>
          </div>

          <div class="file-list">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="file-item"
            >
              <!-- File Icon/Preview -->
              <div class="file-icon" :style="{ background: getFileColor(file.type) }">
                <v-icon size="24" color="white">
                  {{ getFileIcon(file.type) }}
                </v-icon>
              </div>

              <!-- File Info -->
              <div class="file-info">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="file-name font-weight-medium">{{ file.name }}</span>
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    color="grey"
                    @click="removeFile(index)"
                  />
                </div>
                <div class="d-flex align-center ga-3">
                  <span class="text-caption text-medium-emphasis">
                    {{ formatFileSize(file.size) }}
                  </span>
                  <span class="text-caption text-medium-emphasis">•</span>
                  <span class="file-type-chip" :class="`chip-${file.type}`">
                    {{ file.type }}
                  </span>
                </div>

                <!-- Progress Bar (if uploading) -->
                <v-progress-linear
                  v-if="file.uploading"
                  :model-value="file.progress"
                  color="green"
                  height="4"
                  class="mt-2"
                  rounded
                />
              </div>
            </div>
          </div>
        </div>

        <!-- File Details Form -->
        <div v-if="selectedFiles.length > 0" class="file-details-form mt-5">
          <h4 class="text-subtitle-2 font-weight-bold mb-4">File Details</h4>

          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="File Name *"
                placeholder="Enter file name"
                :rules="nameRules"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="mb-3"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.customer"
                :items="customers"
                label="Customer *"
                placeholder="Select customer"
                :rules="customerRules"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.type"
                :items="typeOptions"
                label="Type *"
                placeholder="Select type"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @update:model-value="handleTypeChange"
              />
            </v-col>

            <v-col cols="12" md="6" v-if="form.type === 'video'">
              <v-text-field
                v-model="form.duration"
                label="Duration"
                placeholder="e.g., 0:50"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" md="6" v-if="form.type === 'image'">
              <v-text-field
                v-model="form.resolution"
                label="Resolution"
                placeholder="e.g., 1920×1080"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <!-- Actions -->
      <v-card-actions class="pa-5">
        <v-spacer />
        <v-btn
          variant="outlined"
          rounded="lg"
          :disabled="loading"
          width="140"
          height="40"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          class="btn-green ml-3"
          variant="flat"
          rounded="lg"
          :loading="loading"
          :disabled="!isFormValid || selectedFiles.length === 0"
          width="180"
          height="40"
          @click="handleUpload"
        >
          {{ loading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}` }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useMediaStore } from "@/stores/media";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "submit", "saved"]);

const mediaStore = useMediaStore();

const isOpen = ref(props.modelValue);
const isDragOver = ref(false);
const fileInput = ref(null);
const errorMessage = ref("");

const selectedFiles = ref([]);

const form = ref({
  name: "",
  customer: "",
  type: "image",
  duration: "",
  resolution: "",
});

const typeOptions = [
  { title: "Image", value: "image" },
  { title: "Video", value: "video" },
  { title: "HTML", value: "html" },
  { title: "PDF", value: "pdf" },
];

const customers = computed(() => mediaStore.uniqueCustomers);

const nameRules = [(v) => !!v || "File name is required"];
const customerRules = [(v) => !!v || "Customer is required"];

const isFormValid = computed(() => {
  return form.value.name && form.value.customer && form.value.type;
});

const getFileIcon = (type) => {
  const icons = {
    image: "mdi-image",
    video: "mdi-video",
    html: "mdi-language-html5",
    pdf: "mdi-file-pdf-box",
  };
  return icons[type] || "mdi-file";
};

const getFileColor = (type) => {
  const colors = {
    image: "linear-gradient(135deg, #fdc704, #0d9488)",
    video: "linear-gradient(135deg, #6366f1, #4f46e5)",
    html: "linear-gradient(135deg, #f59e0b, #d97706)",
    pdf: "linear-gradient(135deg, #ef4444, #dc2626)",
  };
  return colors[type] || "linear-gradient(135deg, #6b7280, #4b5563)";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileType = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return "image";
  if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (ext === "html" || ext === "htm") return "html";
  return "document";
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addFiles(files);
  event.target.value = ""; // Reset input
};

const handleDrop = (event) => {
  isDragOver.value = false;
  const files = Array.from(event.dataTransfer.files);
  addFiles(files);
};

const addFiles = (files) => {
  const validFiles = files.filter((file) => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      errorMessage.value = `File "${file.name}" exceeds 500MB limit`;
      return false;
    }
    return true;
  });

  validFiles.forEach((file) => {
    selectedFiles.value.push({
      file: file,
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      uploading: false,
      progress: 0,
    });
  });

  // Auto-fill form with first file
  if (selectedFiles.value.length > 0 && !form.value.name) {
    const firstFile = selectedFiles.value[0];
    form.value.name = firstFile.name;
    form.value.type = firstFile.type;
  }
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
  if (selectedFiles.value.length === 0) {
    resetForm();
  }
};

const clearAllFiles = () => {
  selectedFiles.value = [];
  resetForm();
};

const handleTypeChange = () => {
  // Clear type-specific fields when type changes
  form.value.duration = "";
  form.value.resolution = "";
};

const handleUpload = async () => {
  errorMessage.value = "";

  try {
    for (const fileItem of selectedFiles.value) {
      fileItem.uploading = true;
      fileItem.progress = 0;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        fileItem.progress = Math.min(fileItem.progress + 20, 90);
      }, 200);

      const payload = {
        name: form.value.name,
        customer: form.value.customer,
        type: form.value.type,
        size: formatFileSize(fileItem.size),
        duration: form.value.duration || null,
        resolution: form.value.resolution || null,
      };

      await mediaStore.uploadMedia(payload);

      clearInterval(progressInterval);
      fileItem.progress = 100;
      fileItem.uploading = false;
    }

    emit("saved");
    handleClose();
  } catch (error) {
    console.error("Upload error:", error);
    errorMessage.value = error.message || "Failed to upload files";
  }
};

const handleCancel = () => {
  handleClose();
};

const handleClose = () => {
  isOpen.value = false;
  clearAllFiles();
  errorMessage.value = "";
};

watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
    if (newValue) {
      resetForm();
    }
  }
);

watch(isOpen, (newValue) => {
  emit("update:modelValue", newValue);
});

const resetForm = () => {
  form.value = {
    name: "",
    customer: "",
    type: "image",
    duration: "",
    resolution: "",
  };
};
</script>

<style scoped>
/* Green Theme Colors */
.text-green {
  color: #fdc704 !important;
}

.upload-dialog {
  border-radius: 16px !important;
}

.upload-avatar {
  background: #fdc704 !important;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.upload-zone:hover {
  border-color: #fdc704;
  background: #f0fdfa;
}

.upload-zone--dragover {
  border-color: #fdc704;
  background: #f0fdfa;
  transform: scale(1.02);
}

.upload-zone--has-files {
  padding: 20px;
  min-height: 120px;
}

.file-input {
  display: none;
}

.upload-zone-content {
  pointer-events: none;
}

/* File List */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.file-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #1a1a2e;
  word-break: break-word;
}

.file-type-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.chip-image {
  background: #dcfce7;
  color: #16a34a;
}

.chip-video {
  background: #ede9fe;
  color: #8b5cf6;
}

.chip-html {
  background: #fef3c7;
  color: #f59e0b;
}

.chip-pdf {
  background: #fee2e2;
  color: #ef4444;
}

/* File Details Form */
.file-details-form {
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* Green Button */
.btn-green {
  background: #fdc704 !important;
  color: white !important;
}

.btn-green:hover {
  background: #0d9488 !important;
}

.btn-green:disabled {
  background: #e5e7eb !important;
  color: #9ca3af !important;
}
</style>