import { useAppStore } from '../stores/app'

/**
 * Notification composable
 * Provides convenient access to notification methods
 */
export function useNotification() {
  const appStore = useAppStore()

  /**
   * Show a success notification
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds (default: 5000)
   * @returns {string} Notification ID
   */
  const success = (message, duration = 5000) => {
    return appStore.showSuccess(message, duration)
  }

  /**
   * Show an error notification
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds (default: 7000)
   * @returns {string} Notification ID
   */
  const error = (message, duration = 7000) => {
    return appStore.showError(message, duration)
  }

  /**
   * Show a warning notification
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds (default: 6000)
   * @returns {string} Notification ID
   */
  const warning = (message, duration = 6000) => {
    return appStore.showWarning(message, duration)
  }

  /**
   * Show an info notification
   * @param {string} message - The message to display
   * @param {number} duration - Duration in milliseconds (default: 5000)
   * @returns {string} Notification ID
   */
  const info = (message, duration = 5000) => {
    return appStore.showInfo(message, duration)
  }

  /**
   * Handle error with automatic message parsing
   * @param {Error|Object} error - The error to handle
   * @param {string} customMessage - Optional custom message to display
   * @returns {string} Notification ID
   */
  const handleError = (error, customMessage = null) => {
    return appStore.handleError(error, customMessage)
  }

  /**
   * Dismiss a specific notification
   * @param {string} notificationId - The ID of the notification to dismiss
   */
  const dismiss = (notificationId) => {
    appStore.dismissNotification(notificationId)
  }

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    appStore.clearNotifications()
  }

  return {
    success,
    error,
    warning,
    info,
    handleError,
    dismiss,
    clearAll,
  }
}
