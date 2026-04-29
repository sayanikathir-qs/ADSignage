<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import { toast } from 'vue3-toastify'
import { APP_TYPES } from '@/stores/applications'
import { useAuthStore } from '@/stores/auth'
import ProfileDialog from './dialogs/ProfileDialog.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const dropdownOpen = ref(false)
const profileDialogOpen = ref(false)

const pageTitle = computed(() => {
  if (route.name === 'ApplicationDetail') {
    const meta = APP_TYPES.find(a => a.type === route.params.appType)
    const label = meta?.name ?? route.params.appType
    return `Applications - ${label}`
  }
  return route.meta?.title || route.name
})

const toggleDropdown = () => { dropdownOpen.value = !dropdownOpen.value }

const openProfile = () => {
  dropdownOpen.value = false
  profileDialogOpen.value = true
}

const goToSubscriptions = () => {
  dropdownOpen.value = false
  router.push('/subscriptions')
}

const handleLogout = () => {
  dropdownOpen.value = false
  authStore.logout()
  toast.success('Logged out successfully')
  router.push('/login')
}

// Close dropdown when clicking outside
const onClickOutside = (e) => {
  const el = document.getElementById('user-dropdown-wrapper')
  if (el && !el.contains(e.target)) dropdownOpen.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<template>
  <header class="header">
    <div class="header-left">
      <button class="menu-btn">
        <Menu :size="24" color="#fdc704" />
      </button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="header-right">
      <div id="user-dropdown-wrapper" class="user-dropdown-wrapper">
        <button class="user-profile" @click.stop="toggleDropdown">
          <img src="/home/sayani/Pictures/user.png" alt="User" class="avatar"
            onerror="this.style.display='none'" />
        </button>

        <!-- Dropdown menu -->
        <transition name="dropdown">
          <div v-if="dropdownOpen" class="dropdown-menu">
            <button class="dropdown-item" @click="openProfile">
              <span class="item-icon">👤</span>
              Profile
            </button>
            <button class="dropdown-item" @click="goToSubscriptions">
              <span class="item-icon">✉️</span>
              Subscriptions
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout" @click="handleLogout">
              <span class="item-icon">↪</span>
              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>

  <ProfileDialog v-model="profileDialogOpen" />
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
  z-index: 100;
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
}

/* Dropdown wrapper */
.user-dropdown-wrapper {
  position: relative;
}

.user-profile {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fbbf24;
  transition: transform 0.2s;
}

.user-profile:hover .avatar {
  transform: scale(1.05);
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item.logout {
  color: #e53e3e;
}

.dropdown-item.logout:hover {
  background: #fff5f5;
}

.item-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

/* Transition */
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
