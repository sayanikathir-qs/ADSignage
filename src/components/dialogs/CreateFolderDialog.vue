<template>
  <v-dialog v-model="dialogOpen" max-width="400" persistent>
    <v-card class="create-folder-dialog">
      <!-- Header -->
      <v-card-title class="dialog-header">
        <div class="header-content">
          <v-icon size="24" color="#fdc704" class="mr-3">mdi-folder-plus</v-icon>
          <div>
            <h3 class="dialog-title-text">Create New Folder</h3>
            <p class="dialog-subtitle">Organize your media files</p>
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          size="small"
          @click="handleCancel"
          :disabled="loading"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <!-- Body -->
      <v-card-text class="dialog-body">
        <!-- Folder Name Input -->
        <v-text-field
          v-model="internalFolderName"
          label="Folder Name *"
          placeholder="e.g., Client Assets, Campaign 2024"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-folder"
          autofocus
          :error="!!errorMessage"
          :error-messages="errorMessage"
          @keyup.enter="handleSubmit"
          @input="clearError"
        />

        <!-- Parent Folder Info (if nested) -->
        <div v-if="showParentInfo" class="parent-info">
          <v-icon size="14" color="grey" class="mr-1">mdi-folder</v-icon>
          <span class="parent-text">Creating in: <strong>{{ parentFolderName }}</strong></span>
        </div>
      </v-card-text>
      
      <!-- Footer -->
      <v-card-actions class="dialog-footer">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
          class="cancel-btn"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="loading"
          :disabled="!isValid"
          class="btn-primary"
        >
          Create Folder
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  folderName: {
    type: String,
    default: ''
  },
  parentId: {
    type: String,
    default: null
  },
  parentFolderName: {
    type: String,
    default: 'Root'
  },
  showParentInfo: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Object,
    default: () => ({
      minLength: 1,
      maxLength: 100,
      forbiddenChars: ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
    })
  }
});

const emit = defineEmits([
  'update:modelValue',
  'submit',
  'cancel'
]);

// ✅ INTERNAL STATE - Use this instead of prop directly
const dialogOpen = ref(props.modelValue);
const internalFolderName = ref(props.folderName);
const errorMessage = ref('');

// Computed
const isValid = computed(() => {
  return internalFolderName.value.trim().length >= props.rules.minLength &&
         internalFolderName.value.trim().length <= props.rules.maxLength &&
         !hasForbiddenChars(internalFolderName.value);
});

const hasForbiddenChars = (name) => {
  return props.rules.forbiddenChars.some(char => name.includes(char));
};

// Watchers - Sync with props
watch(() => props.modelValue, (val) => {
  dialogOpen.value = val;
  if (val) {
    internalFolderName.value = props.folderName || '';
    errorMessage.value = '';
  }
});

watch(dialogOpen, (val) => {
  emit('update:modelValue', val);
});

watch(() => props.folderName, (val) => {
  internalFolderName.value = val || '';
});

// Methods
const clearError = () => {
  errorMessage.value = '';
};

const validate = () => {
  const name = internalFolderName.value.trim();
  
  if (!name) {
    errorMessage.value = 'Folder name is required';
    return false;
  }
  
  if (name.length < props.rules.minLength) {
    errorMessage.value = `Name must be at least ${props.rules.minLength} character`;
    return false;
  }
  
  if (name.length > props.rules.maxLength) {
    errorMessage.value = `Name must be less than ${props.rules.maxLength} characters`;
    return false;
  }
  
  if (hasForbiddenChars(name)) {
    errorMessage.value = 'Name cannot contain: < > : " / \\ | ? *';
    return false;
  }
  
  return true;
};

const handleSubmit = () => {
  if (!validate()) {
    return;
  }
  
  const sanitizedName = internalFolderName.value.trim();
  emit('submit', {
    name: sanitizedName,
    parentId: props.parentId
  });
};

const handleCancel = () => {
  internalFolderName.value = '';
  errorMessage.value = '';
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<style scoped>
.create-folder-dialog {
  border-radius: 12px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.dialog-title-text {
  font-size: 16px;
  font-weight: 600;
  color: #fdc704;
  margin: 0;
  line-height: 1.4;
}

.dialog-subtitle {
  font-size: 12px;
  color: #fdc704;
  margin: 2px 0 0 0;
}

.close-btn {
  margin: -8px -8px 0 0;
}

.dialog-body {
  padding: 24px;
}

.parent-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  margin-top: 12px;
}

.parent-text {
  font-size: 12px;
  color: #6b7280;
}

.parent-text strong {
  color: #1a1a2e;
  font-weight: 500;
}

.dialog-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f8f9fa;
}

.cancel-btn {
  color: #6b7280;
}

.create-btn {
  min-width: 120px;
  font-weight: 500;
}
.btn-primary {
  background-color: #fdc704;
  border-color: #fdc704;
  color: white;
}


.v-dialog {
  animation: dialogFadeIn 0.2s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@media (max-width: 480px) {
  .dialog-header {
    padding: 16px 20px;
  }
  
  .dialog-body {
    padding: 20px;
  }
  
  .dialog-footer {
    padding: 12px 20px 20px;
  }
}
</style>