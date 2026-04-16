import { defineStore } from 'pinia'
import { GENERIC_ERROR_MESSAGE } from '../utils/constant'

export const useAppStore = defineStore('app', {
  // State
  state: () => ({
    loadingOperations: new Set(),
    loadingMessage: '',
    notifications: [],
    notificationIdCounter: 0,
    isDarkMode: localStorage.getItem('theme') === 'dark' || false,
  }),

  // Getters
  getters: {
    isLoading: (state) => state.loadingOperations.size > 0,
    hasNotifications: (state) => state.notifications.length > 0,
    currentTheme: (state) => (state.isDarkMode ? 'dark' : 'light'),
  },

  // Actions
  actions: {
    // Theme Actions
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
    },

    setTheme(isDark) {
      this.isDarkMode = isDark
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    },

    // Loading Actions
    startLoading(operationName = 'default', message = '') {
      this.loadingOperations.add(operationName)
      if (message) {
        this.loadingMessage = message
      }
    },

    stopLoading(operationName = 'default') {
      this.loadingOperations.delete(operationName)
      if (this.loadingOperations.size === 0) {
        this.loadingMessage = ''
      }
    },

    clearAllLoading() {
      this.loadingOperations.clear()
      this.loadingMessage = ''
    },

    // Notification Actions
    showNotification(message, type = 'info', duration = 5000) {
      const id = ++this.notificationIdCounter
      const notification = {
        id,
        message,
        type,
        duration,
        show: true,
      }

      this.notifications.push(notification)

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          this.removeNotification(id)
        }, duration)
      }

      return id
    },

    removeNotification(id) {
      const index = this.notifications.findIndex((n) => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    },

    clearNotifications() {
      this.notifications = []
    },

    // Convenience Methods for Different Notification Types
    showSuccess(message, duration = 5000) {
      return this.showNotification(message, 'success', duration)
    },

    showError(message, duration = 7000) {
      return this.showNotification(message, 'error', duration)
    },

    showWarning(message, duration = 6000) {
      return this.showNotification(message, 'warning', duration)
    },

    showInfo(message, duration = 5000) {
      return this.showNotification(message, 'info', duration)
    },
    
    handleError(error, { context = "", showToast = false, customMessage = null } = {}) {
      console.error(context || 'Global error handler:', error)

      let errorMessage = ""
      const responseData = error.response?.data

      // 1. First priority: customMessage if provided
      if (customMessage) {
        errorMessage = customMessage
      } 
      // 2. Second priority: extract from backend response
      else if (responseData) {
        
        errorMessage = responseData.message || responseData.error
        
        // Handle detail field - could be string or array (FastAPI validation)
        if (!errorMessage && responseData.detail) {
          if (Array.isArray(responseData.detail) && responseData.detail.length > 0) {
            errorMessage = responseData.detail[0]?.msg || responseData.detail[0]?.message
          } else if (typeof responseData.detail === 'string') {
            errorMessage = responseData.detail
          }
        }
      }

      // 3. Final fallback: generic message
      if (!errorMessage) {
        errorMessage = GENERIC_ERROR_MESSAGE
      }

      if (showToast) this.showError(errorMessage)

      // Extract field errors for form validation
      let fieldErrors = null
      if (Array.isArray(responseData?.detail)) {
        fieldErrors = responseData.detail
      } else if (responseData?.errors) {
        fieldErrors = responseData.errors
      }

      return {
        success: false,
        error: errorMessage,
        fieldErrors
      }
    },

    // Async Operation Wrapper with Loading and Error Handling
    async withLoading(operation, operationName = 'default', loadingMsg = '', errorMsg = null) {
      this.startLoading(operationName, loadingMsg)
      try {
        const result = await operation()
        return { success: true, data: result }
      } catch (error) {
        this.handleError(error, { customMessage: errorMsg })
        return { success: false, error }
      } finally {
        this.stopLoading(operationName)
      }
    },
  },
})
