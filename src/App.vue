<script setup>
import { watch } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

watch(() => appStore.isDarkMode, (isDark) => {
  document.documentElement.classList.toggle('dark', isDark)
}, { immediate: true })

</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main-content">
      <Header />
      <main class="content-area">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<style>
/* Global reset and base styles are in style.css */
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: 250px; /* Sidebar width */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa; /* Off-white/light-grey background */
}

.content-area {
  flex: 1;
}
</style>
