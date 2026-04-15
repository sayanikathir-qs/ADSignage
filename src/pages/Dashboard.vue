<script setup>
import { dashboardStats } from '../data/mockData'
import { Monitor, Layers, PlaySquare, Image as ImageIcon } from 'lucide-vue-next'

const getIcon = (name) => {
  switch (name) {
    case 'Monitor': return Monitor;
    case 'Layers': return Layers;
    case 'PlaySquare': return PlaySquare;
    case 'Image': return ImageIcon;
    default: return Monitor;
  }
}
</script>

<template>
  <div class="page-container">
    <div class="stats-grid">
      <div v-for="stat in dashboardStats" :key="stat.label" class="card stat-card">
        <div class="stat-icon-wrapper">
          <component :is="getIcon(stat.icon)" :size="24" color="#14b8a6" />
        </div>
        <div class="stat-info">
          <span class="stat-label">{{ stat.label }}</span>
          <p class="stat">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon-wrapper {
  background-color: rgba(20, 184, 166, 0.1);
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.stat {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
</style>
