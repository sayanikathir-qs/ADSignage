<template>
  <v-card variant="outlined" class="mb-4">
    <v-card-text class="pa-3">
      <div class="filters-wrapper">
        <!-- Search -->
        <div class="filter-item search">
          <v-text-field
            v-model="searchValue"
            placeholder="Search media..."
            variant="outlined"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:model-value="debouncedSearch"
          />
        </div>

        <!-- Type Filter -->
        <div class="filter-item">
          <v-select
            v-model="typeValue"
            :items="typeOptions"
            label="Type"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="handleTypeChange"
          />
        </div>

        <!-- Customer Filter -->
        <div class="filter-item">
          <v-select
            v-model="customerValue"
            :items="customers"
            label="Customer"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="handleCustomerChange"
          />
        </div>

        <!-- Clear Filters -->
        <div class="filter-item">
          <v-btn
            variant="text"
            size="small"
            prepend-icon="mdi-filter-variant-remove"
            :disabled="!hasActiveFilters"
            @click="handleClearAll"
          >
            Clear Filters
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { debounce } from "@/utils/function";
import { useMediaStore } from "@/stores/media";

const emit = defineEmits(["search", "type-change", "customer-change", "clear"]);

const mediaStore = useMediaStore();

const searchValue = ref("");
const typeValue = ref(null);
const customerValue = ref(null);

const typeOptions = [
  { title: "Image", value: "image" },
  { title: "Video", value: "video" },
  { title: "HTML", value: "html" },
  { title: "PDF", value: "pdf" },
];


const hasActiveFilters = computed(() => {
  return searchValue.value || typeValue.value || customerValue.value;
});

const debouncedSearch = debounce((value) => {
  emit("search", value);
}, 300);

const handleTypeChange = (value) => {
  emit("type-change", value);
};

const handleCustomerChange = (value) => {
  emit("customer-change", value);
};

const handleClearAll = () => {
  searchValue.value = "";
  typeValue.value = null;
  customerValue.value = null;
  emit("clear");
};

watch(searchValue, (value) => {
  if (!value) {
    emit("search", "");
  }
});
</script>

<style scoped>
.filters-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 150px;
}

.filter-item.search {
  flex: 1;
  min-width: 250px;
}

@media (max-width: 768px) {
  .filters-wrapper {
    flex-direction: column;
  }
  
  .filter-item,
  .filter-item.search {
    width: 100%;
    min-width: 100%;
  }
}
</style>