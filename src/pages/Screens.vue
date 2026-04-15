<script setup>
import { screens } from '../data/mockData'
import { MoreVertical, Monitor } from 'lucide-vue-next'
</script>

<template>
  <div class="page-container">
    <div class="screens-list">
      <div v-for="screen in screens" :key="screen.id" class="card screen-card">
        <div class="screen-preview">
          <Monitor :size="48" :color="screen.status === 'Online' ? '#14b8a6' : '#9ca3af'" />
        </div>
        <div class="screen-info">
          <div class="screen-header">
            <h4>{{ screen.name }}</h4>
            <span :class="['status-badge', screen.status.toLowerCase()]">{{ screen.status }}</span>
          </div>
          <p class="location">{{ screen.location }}</p>
          <p class="last-seen">Last seen: {{ screen.lastSeen }}</p>
        </div>
        <button class="more-options">
          <MoreVertical :size="20" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
}

.screens-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.screen-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem;
}

.screen-preview {
  width: 80px;
  height: 60px;
  background-color: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-info {
  flex: 1;
}

.screen-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.screen-header h4 {
  margin: 0;
  color: #111827;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  font-weight: 500;
}

.status-badge.online {
  background-color: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}

.status-badge.offline {
  background-color: #f3f4f6;
  color: #6b7280;
}

.location, .last-seen {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.more-options {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
}
</style>
