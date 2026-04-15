<script setup>
import { Menu, Plus } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.name)
</script>

<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-btn">
        <Menu :size="24" color="#f59e0b" />
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    
    <div class="header-right">
      <button v-if="pageTitle === 'Playlists'" class="action-btn">
        <Plus :size="18" /> Create Playlist
      </button>
      
      <div class="user-profile">
        <img src="https://i.pravatar.cc/150?u=sayani" alt="User" class="avatar" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: 80px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-btn {
  background-color: #f59e0b;
  color: #fff;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #d97706;
}

.user-profile {
  cursor: pointer;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f3f4f6;
}
</style>
