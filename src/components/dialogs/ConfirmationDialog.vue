<template>
  <v-dialog v-model="isOpen" max-width="500" persistent>
    <v-card>
      <!-- Header with Icon -->
      <v-card-title class="d-flex align-center ga-3 pa-5 pb-2">
        <v-avatar :color="iconColor" size="42" variant="tonal">
          <v-icon :color="iconColor">{{ icon }}</v-icon>
        </v-avatar>
        <span class="text-h6">{{ title }}</span>
      </v-card-title>

      <v-divider class="mx-5" />

      <!-- Content -->
      <v-card-text class="pa-5">
        <p class="text-body-1 mb-2">{{ message }}</p>
        <p v-if="detail" class="text-caption text-medium-emphasis">{{ detail }}</p>
      </v-card-text>

      <v-divider class="mx-5" />

      <!-- Actions -->
      <v-card-actions class="pa-5">
        <v-spacer />
        <v-btn variant="outlined" :disabled="loading" @click="handleCancel">
          {{ cancelText }}
        </v-btn>
        <v-btn :color="confirmColor" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Confirm",
  },
  message: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "mdi-alert-circle",
  },
  iconColor: {
    type: String,
    default: "warning",
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
  confirmColor: {
    type: String,
    default: "error",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const isOpen = ref(props.modelValue);

// Sync v-model
watch(
  () => props.modelValue,
  (newValue) => {
    isOpen.value = newValue;
  }
);

watch(isOpen, (newValue) => {
  emit("update:modelValue", newValue);
});

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
  isOpen.value = false;
};
</script>