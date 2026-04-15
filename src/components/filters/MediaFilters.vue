<script setup>
import { LayoutGrid, List, ChevronDown } from 'lucide-vue-next'
import { useMediaStore } from '../../stores/media'

const store = useMediaStore()

const typeFilters = [
  { label: 'All',   value: 'all'   },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'HTML',  value: 'html'  },
  { label: 'PDF',   value: 'pdf'   },
]

const sortOptions = [
  { label: 'Latest', value: 'latest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Name',   value: 'name'   },
  { label: 'Size',   value: 'size'   },
]
</script>

<template>
  <div class="toolbar">
    <!-- Search -->
    <div class="search-bar">
      <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        class="search-input"
        placeholder="Search media..."
        :value="store.search"
        @input="store.setSearch($event.target.value)"
      />
    </div>

    <!-- Type Filters -->
    <div class="filter-pills">
      <button
        v-for="f in typeFilters"
        :key="f.value"
        :class="['filter-pill', { active: store.activeType === f.value }]"
        @click="store.setType(f.value)"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- View Toggle -->
    <div class="view-toggle">
      <button
        :class="['view-btn', { active: store.viewMode === 'grid' }]"
        @click="store.setView('grid')"
        title="Grid View"
      >
        <LayoutGrid :size="18" />
      </button>
      <button
        :class="['view-btn', { active: store.viewMode === 'list' }]"
        @click="store.setView('list')"
        title="List View"
      >
        <List :size="18" />
      </button>
    </div>

    <!-- Sort -->
    <select
      class="sort-dropdown"
      :value="store.sortBy"
      @change="store.setSort($event.target.value)"
    >
      <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  flex-wrap: wrap;
}




/* View Toggle */
.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: var(--color-bg-surface);
  padding: 0.25rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
}

.view-btn {
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-hover);
}

.view-btn.active {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}



/* Responsive */
@media (max-width: 1024px) {
  .toolbar {
    gap: 0.75rem;
  }
  
  .search-bar {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar,
  .filter-pills,
  .view-toggle,
  .sort-dropdown {
    width: 100%;
  }
  
  .filter-pills {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .view-toggle {
    justify-content: center;
  }
}
</style>