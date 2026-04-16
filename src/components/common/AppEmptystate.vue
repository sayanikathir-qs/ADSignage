<template>
  <v-card variant="flat" class="text-center py-12 border">
    <v-icon :size="iconSize" :color="iconColor" class="mb-4">{{ icon }}</v-icon>
    <h3 class="text-h6 text-medium-emphasis mb-2 font-weight-bold">{{ title }}</h3>
    <p v-if="subtitle" class="text-body-2 text-medium-emphasis mb-4">{{ subtitle }}</p>
    <v-btn
      v-if="ctaName"
      :color="accentColor"
      :prepend-icon="ctaIcon"
      rounded="lg"
      @click="$emit('cta-click')"
    >
      {{ ctaName }}
    </v-btn>
  </v-card>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "mdi-inbox-outline",
  },
  iconSize: {
    type: [String, Number],
    default: 64,
  },
  iconColor: {
    type: String,
    default: "grey-lighten-1",
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: null,
  },
  ctaName: {
    type: String,
    default: null,
  },
  ctaIcon: {
    type: String,
    default: "mdi-plus",
  },
  accentColor: {
    type: String,
    default: "primary",
  },
});

defineEmits(["cta-click"]);
</script>
