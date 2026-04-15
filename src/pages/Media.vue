<script setup>
import { mediaStats } from '../data/mockData'
import MediaFilters from '../components/filters/MediaFilters.vue'
import MediaDataTable from '../components/datatables/MediaDataTable.vue'
import { Upload, FolderPlus } from 'lucide-vue-next'

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})
</script>

<template>
  <div class="media-page">
    <!-- Top bar -->
    <div class="media-topbar">
      <div class="topbar-left">
        <h2 class="page-heading">Media Library</h2>
        <p class="page-sub">Manage all uploaded assets across customers</p>
      </div>
      <div class="topbar-actions">
        <button class="btn-primary">
          <Upload :size="16" /> Upload
        </button>
        <button class="btn-primary">
          <FolderPlus :size="16" /> New Folder
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div v-for="stat in mediaStats" :key="stat.label" class="stat-card">
        <div class="stat-dot" :style="{ background: stat.color }"></div>
        <div>
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-sub">{{ stat.sub }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <MediaFilters />

    <!-- Content -->
    <MediaDataTable />
  </div>
</template>

<style scoped>
.media-page {
  /* Let global CSS handle this */
}

.media-topbar {
  /* Let global CSS handle this */
}
</style>
