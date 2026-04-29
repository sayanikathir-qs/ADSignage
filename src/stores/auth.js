import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
    token: localStorage.getItem('auth_token') || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
  },

  actions: {
    async login(email, password) {
      if (!email || !password) return { success: false, error: 'Email and password are required' }

      // Mock: accept any non-empty credentials
      const user = {
        id: 'user_001',
        fullName: 'ADS',
        email,
        mobile: '07540188809',
        role: 'subscriber',
      }
      this._setSession(user)
      return { success: true }
    },

    async signup(fullName, email, password, mobile) {
      if (!fullName || !email || !password) return { success: false, error: 'All fields are required' }

      return { success: true }
    },

    async updateProfile({ fullName, email, mobile }) {
      if (!this.user) return { success: false, error: 'Not logged in' }
      this.user = { ...this.user, fullName, email, mobile }
      localStorage.setItem('auth_user', JSON.stringify(this.user))
      return { success: true }
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    },

    _setSession(user) {
      this.user = user
      this.token = 'mock_token_' + Date.now()
      localStorage.setItem('auth_user', JSON.stringify(user))
      localStorage.setItem('auth_token', this.token)
    },
  },
})
