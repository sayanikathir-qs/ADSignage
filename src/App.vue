<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import ConfirmationDialog from './components/dialogs/ConfirmationDialog.vue'
import { useAppStore } from './stores/app'
import { useConfirmState } from './composables/useConfirm'

const appStore = useAppStore()
const route = useRoute()
const confirmState = useConfirmState()

watch(() => appStore.isDarkMode, (isDark) => {
  document.documentElement.classList.toggle('dark', isDark)
}, { immediate: true })

const onConfirm = () => {
  confirmState.open = false
  confirmState._resolve?.(true)
}

const onCancel = () => {
  confirmState.open = false
  confirmState._resolve?.(false)
}
</script>

<template>
  <!-- Auth layout: login / signup — no sidebar or header -->
  <div v-if="route.meta.layout === 'auth'">
    <ToastContainer />
    <router-view />
  </div>

  <!-- Main app layout -->
  <div v-else class="app-layout">
    <Sidebar />
    <div class="main-content">
      <Header />
      <main class="content-area">
        <ToastContainer />
        <router-view />
      </main>
    </div>
  </div>

  <!-- Global delete confirmation dialog -->
  <ConfirmationDialog
    v-model="confirmState.open"
    :title="confirmState.title"
    :message="confirmState.message"
    :detail="confirmState.detail"
    :icon="confirmState.icon"
    :icon-color="confirmState.iconColor"
    :confirm-text="confirmState.confirmText"
    :confirm-color="confirmState.confirmColor"
    :cancel-text="confirmState.cancelText"
    :loading="confirmState.loading"
    @confirm="onConfirm"
    @cancel="onCancel"
  />
</template>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.content-area {
  flex: 1;
}
</style>
