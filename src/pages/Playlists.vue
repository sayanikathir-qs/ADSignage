<script setup>
import { playlists } from '../data/mockData'
import { Search, MoreVertical, PlaySquare } from 'lucide-vue-next'
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
      <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item">
        <div class="playlist-icon">
          <PlaySquare :size="24" color="#14b8a6" />
        </div>
        <div class="playlist-info">
          <h4>{{ playlist.name }}</h4>
          <span class="duration">{{ playlist.duration }} • {{ playlist.items }} items</span>
        </div>
        <div class="playlist-meta">
          <span class="last-edited">Last Edited: {{ playlist.lastEdited }}</span>
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
  color: #14b8a6;
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
  padding: 1.25rem 1.5rem;
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
  background-color: rgba(20, 184, 166, 0.1);
}

.playlist-info {
  flex: 1;
}

.playlist-info h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
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
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.more-options:hover {
  background: #f3f4f6;
  color: #111827;
}
</style>
