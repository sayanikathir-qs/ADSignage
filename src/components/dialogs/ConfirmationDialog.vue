<!-- src/components/dialogs/ConfirmationDialog.vue -->
<template>
  <v-dialog v-model="dialogOpen" max-width="400" persistent>
    <v-card>
      <v-card-title class="dialog-header">
        <v-icon :color="iconColor" class="mr-3" :size="24">{{ icon }}</v-icon>
        <span class="dialog-title">{{ title }}</span>
      </v-card-title>
      
      <v-card-text>
        <p class="message-text">{{ message }}</p>
        <p v-if="detail" class="detail-text">{{ detail }}</p>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText || 'Cancel' }}
        </v-btn>
        <v-btn
          :color="confirmColor || 'primary'"
          variant="flat"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText || 'Confirm' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  detail: String,
  icon: { type: String, default: 'mdi-alert' },
  iconColor: { type: String, default: 'warning' },
  confirmText: String,
  confirmColor: String,
  cancelText: String,
  loading: Boolean,
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const dialogOpen = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  dialogOpen.value = val;
});

watch(dialogOpen, (val) => {
  emit('update:modelValue', val);
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
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

.message-text {
  font-size: 14px;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.detail-text {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}
</style>