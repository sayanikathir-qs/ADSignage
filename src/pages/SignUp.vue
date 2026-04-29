<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
         <span class="logo-icon">AD</span>
        <h1 class="brand-name">AdSignage</h1>
      </div>

      <h2 class="auth-title">Create your account</h2>
      <p class="auth-subtitle">Start managing your digital signage today</p>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input
            v-model="fullName"
            type="text"
            class="form-input"
            placeholder="John Smith"
            required
            autocomplete="name"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Mobile</label>
          <input
            v-model="mobile"
            type="tel"
            class="form-input"
            placeholder="07700 000000"
            autocomplete="tel"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Min. 8 characters"
              required
              minlength="8"
              autocomplete="new-password"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="form-input"
            placeholder="Repeat password"
            required
            autocomplete="new-password"
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account?
        <router-link to="/login" class="auth-link">Sign in</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const mobile = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const handleSignup = async () => {
  errorMsg.value = ''

  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 8) {
    errorMsg.value = 'Password must be at least 8 characters'
    return
  }

  loading.value = true
  const result = await authStore.signup(fullName.value, email.value, password.value, mobile.value)
  loading.value = false

  if (result.success) {
    toast.success('Account created successfully!')
    router.push('/login')
  } else {
    errorMsg.value = result.error
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ecebeb 0%, #ecebeb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 32px;
}

.logo-img {
  height: 40px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.auth-title {
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 6px;
  text-align: center;
}

.auth-subtitle {
  font-size: 14px;
  color: #718096;
  text-align: center;
  margin: 0 0 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
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

.input-wrapper .form-input {
  padding-right: 44px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
}

.error-msg {
  color: #e53e3e;
  font-size: 13px;
  margin: 0;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: #fbbf24;
  color: #1a202c;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}

.btn-primary:hover:not(:disabled) {
  background: #f59e0b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  margin: 24px 0 0;
  font-size: 14px;
  color: #718096;
}

.auth-link {
  color: #d97706;
  font-weight: 600;
  text-decoration: none;
}

.auth-link:hover {
  text-decoration: underline;
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
</style>
