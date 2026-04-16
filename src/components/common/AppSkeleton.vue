<template>
  <!-- Table row skeleton -->
  <div v-if="type === 'table'" class="pa-2">
    <v-skeleton-loader
      v-for="n in count"
      :key="n"
      type="table-row"
      class="mb-2"
    />
  </div>

  <!-- Card grid skeleton -->
  <v-row v-else-if="type === 'card-grid'">
    <v-col
      v-for="n in count"
      :key="n"
      v-bind="colProps"
    >
      <v-card variant="flat" class="pa-4 border">
        <v-skeleton-loader type="list-item-avatar" class="mb-3" />
        <v-skeleton-loader type="text" width="80%" class="mb-2" />
        <v-skeleton-loader type="text" width="60%" />
      </v-card>
    </v-col>
  </v-row>

  <!-- Tree skeleton -->
  <v-card v-else-if="type === 'tree'" variant="flat" class="border pa-2">
    <v-skeleton-loader
      v-for="n in count"
      :key="n"
      type="list-item-avatar"
      class="mb-1"
      :style="{ paddingLeft: `${(n % 3) * 24}px` }"
    />
  </v-card>

  <!-- List skeleton (avatar + two lines) -->
  <div v-else-if="type === 'list'" class="d-flex flex-column ga-3">
    <v-skeleton-loader
      v-for="n in count"
      :key="n"
      type="list-item-avatar-two-line"
      class="rounded-lg"
    />
  </div>

  <!-- Product/image grid skeleton -->
  <v-row v-else-if="type === 'image-grid'">
    <v-col
      v-for="n in count"
      :key="n"
      v-bind="colProps"
    >
      <v-card variant="flat" class="pa-4 border">
        <v-skeleton-loader type="image, article" />
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  /**
   * The skeleton layout type to render.
   * - "table"      → Stacked table-row skeletons (for data tables / list views)
   * - "card-grid"  → Responsive card grid with avatar + text lines
   * - "list"       → Full-width list items with avatar and two text lines
   * - "image-grid" → Responsive card grid with image + article content
   */
  type: {
    type: String,
    default: "table",
    validator: (v) => ["table", "card-grid", "list", "image-grid", "tree"].includes(v),
  },
  count: {
    type: Number,
    default: 6,
  },
  cols: {
    type: Object,
    default: () => ({ cols: 12, sm: 6, md: 4, lg: 3 }),
  },
});

const colProps = computed(() => props.cols);
</script>