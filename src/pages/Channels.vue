<script setup>
import { channels } from '../data/mockData'
import { Layers, MoreVertical } from 'lucide-vue-next'
</script>

<template>
  <div class="page-container">
    <div class="channels-grid">
      <div v-for="channel in channels" :key="channel.id" class="card channel-card">
        <div class="channel-header">
          <div class="channel-icon">
            <Layers :size="24" color="#14b8a6" />
          </div>
          <button class="more-options">
            <MoreVertical :size="20" />
          </button>
        </div>
        <div class="channel-body">
          <h4>{{ channel.name }}</h4>
          <p class="playlist-name">Playlist: {{ channel.playlist }}</p>
        </div>
        <div class="channel-footer">
          <span :class="['status-dot', channel.status.toLowerCase()]"></span>
          <span class="status-text">{{ channel.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.channel-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-icon {
  width: 40px;
  height: 40px;
  background-color: rgba(20, 184, 166, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.channel-body h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.playlist-name {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

.channel-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.active { background-color: #14b8a6; }
.status-dot.paused { background-color: #f59e0b; }

.status-text {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.more-options {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
}
</style>
