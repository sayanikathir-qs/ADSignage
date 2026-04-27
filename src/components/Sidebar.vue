<script setup>
import { menus } from '@/router/menus'
</script>

<template>
  <aside class="sidebar">
    <div class="logo-container">
      <div class="logo">
        <span class="logo-icon">AD</span>
        <span class="logo-text">ADSignage</span>
      </div>
    </div>
    <nav class="nav-menu">
      <router-link
        v-for="menu in menus"
        :key="menu.path"
        :to="menu.path"
        class="nav-item"
        exact-active-class="active"
      >
        <component :is="menu.icon" :size="20" />
        <span>{{ menu.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #2b3036;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.logo-container {
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1.25rem;
  letter-spacing: 0.5px;
}

.logo-icon {
  background: linear-gradient(135deg, #fdc704, #fdc704);
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: bold;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #9ca3af;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: #fdc704;
  background-color: rgba(255, 255, 255, 0.05);
  border-left-color: #fdc704;
}
</style>
