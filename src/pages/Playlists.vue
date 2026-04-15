<script setup>
import { Search, MoreVertical, Chrome } from 'lucide-vue-next'
</script>

<template>
  <div class="page-container">
    <div class="playlist-header">
      <div class="search-bar">
        <input type="text" placeholder="Search.." />
        <button class="search-btn">
          <Search :size="20" />
        </button>
      </div>
    </div>

    <div class="playlist-list">
      <div class="playlist-item">
        <div class="playlist-icon">
          <Chrome :size="24" color="#f59e0b" />
        </div>
        <div class="playlist-info">
          <h4>Sayani</h4>
          <span class="duration">00:00:06</span>
        </div>
        <div class="playlist-meta">
          <span class="status-icon running">🏃</span>
          <span class="last-edited">Last Edited on: Wed, Apr 15, 2026 7:58 AM</span>
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

.playlist-header {
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  align-items: center;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-bar input {
  flex: 1;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  outline: none;
}

.search-btn {
  background: white;
  border: none;
  padding: 0.75rem 1rem;
  color: #f59e0b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.playlist-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  gap: 1.5rem;
}

.playlist-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f3f4f6;
}

.playlist-info {
  flex: 1;
}

.playlist-info h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-weight: 500;
}

.duration {
  font-size: 0.85rem;
  color: #6b7280;
}

.playlist-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 2rem;
}

.last-edited {
  font-size: 0.85rem;
  color: #6b7280;
}

.more-options {
  background: transparent;
  border: none;
  color: #4b5563;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.more-options:hover {
  background: #f3f4f6;
}
</style>
