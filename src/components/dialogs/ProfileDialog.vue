<template>
  <teleport to="body">
    <div v-if="modelValue" class="dialog-overlay" @click.self="close">
      <div class="dialog-card">
        <!-- Header -->
        <div class="dialog-header">
          <span class="dialog-title">View / Update Profile</span>
          <button class="close-btn" @click="close">✕</button>
        </div>

        <!-- Avatar & identity -->
        <div class="profile-identity">
          <div class="avatar-ring">
            <img src="/home/sayani/Pictures/user.png" alt="Avatar" class="avatar-img" onerror="this.src=''" />
            <span v-if="!hasAvatar" class="avatar-initials">{{ initials }}</span>
          </div>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <p class="profile-role">{{ authStore.user?.role }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleUpdate" class="profile-form">
          <div class="form-row">
            <label class="form-label">Full Name</label>
            <input v-model="form.fullName" type="text" class="form-input" placeholder="Full Name" />
          </div>
          <div class="form-row">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="Email" />
          </div>
          <div class="form-row">
            <label class="form-label">Mobile</label>
            <input v-model="form.mobile" type="tel" class="form-input" placeholder="Mobile" />
          </div>
          <div class="form-row">
            <label class="form-label">Current Password</label>
            <input v-model="form.currentPassword" type="password" class="form-input" placeholder="" />
          </div>
          <div class="form-row">
            <label class="form-label">New Password</label>
            <input v-model="form.newPassword" type="password" class="form-input" placeholder="" />
          </div>

          <button type="submit" class="btn-update" :disabled="saving">
            {{ saving ? 'Saving...' : 'Update Profile' }}
          </button>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const authStore = useAuthStore()
const saving = ref(false)
const hasAvatar = ref(false)

const form = ref({
  fullName: '',
  email: '',
  mobile: '',
  currentPassword: '',
  newPassword: '',
})

watch(() => props.modelValue, (open) => {
  if (open && authStore.user) {
    form.value = {
      fullName: authStore.user.fullName || '',
      email: authStore.user.email || '',
      mobile: authStore.user.mobile || '',
      currentPassword: '',
      newPassword: '',
    }
  }
})

const initials = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.email || ''
  return name.slice(0, 2).toUpperCase()
})

const close = () => emit('update:modelValue', false)

const handleUpdate = async () => {
  saving.value = true
  const result = await authStore.updateProfile({
    fullName: form.value.fullName,
    email: form.value.email,
    mobile: form.value.mobile,
  })
  saving.value = false

  if (result.success) {
    toast.success('Profile updated successfully')
    close()
  } else {
    toast.error(result.error || 'Failed to update profile')
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.dialog-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #718096;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #2d3748;
}

.profile-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px 20px;
  gap: 8px;
}

.avatar-ring {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #fbbf24;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f3f4f6;
  margin-bottom: 4px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  font-size: 28px;
  font-weight: 700;
  color: #4a5568;
}

.profile-email {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.profile-role {
  font-size: 13px;
  color: #7c3aed;
  margin: 0;
  font-weight: 500;
}

.profile-form {
  padding: 8px 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 12px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  text-align: right;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #fbbf24;
}

.btn-update {
  margin-top: 8px;
  padding: 14px;
  background: #fbbf24;
  color: #1a202c;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-update:hover:not(:disabled) {
  background: #f59e0b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.btn-update:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
