// src/stores/subscription.js
import { defineStore } from 'pinia'

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscriptions: [],
    pendingSubscription: null,
    loading: false,
    error: null,
    userId: 'user_mock_001',
    storageKey: 'mock_subscriptions_user_mock_001',
    pendingKey: 'mock_pending_subscription'
  }),

  getters: {
    activeSubscriptions: (state) => 
      state.subscriptions.filter(sub => String(sub.status).toLowerCase() === 'active')
  },

  actions: {
    init() {
      try {
        // Load completed subscriptions from localStorage
        const storedSubs = localStorage.getItem(this.storageKey)
        if (storedSubs) {
          this.subscriptions = JSON.parse(storedSubs)
        }
        
        // Load pending from localStorage (survives full page reload)
        const storedPending = localStorage.getItem(this.pendingKey)
        if (storedPending) {
          this.pendingSubscription = JSON.parse(storedPending)
          console.log(' Loaded pending subscription from localStorage:', this.pendingSubscription)
        } else {
          console.log('📦 No pending subscription found in localStorage')
        }
        
        console.log('📦 Store initialized:', {
          subscriptions: this.subscriptions.length,
          pending: this.pendingSubscription ? '✅ Found' : '❌ None'
        })
      } catch (err) {
        console.error('❌ Failed to init store:', err)
      }
    },

    _persist() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.subscriptions))
    },

    setPendingSubscription({ billingFrequency, screenLicenses, totalPrice }) {
      console.log('📝 Setting pending subscription:', { billingFrequency, screenLicenses, totalPrice })
      
      const now = new Date()
      const nextBilling = new Date(now)
      
      if (billingFrequency === 'monthly') {
        nextBilling.setMonth(nextBilling.getMonth() + 1)
      } else {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1)
      }

      this.pendingSubscription = {
        billingFrequency,
        screenLicenses,
        totalPrice,
        startedAt: now.toISOString(),
        nextPayment: nextBilling.toISOString(),
        lastPayment: now.toISOString(),
        createdAt: now.getTime(),
        userId: this.userId
      }
      
      // CRITICAL: Save to localStorage immediately
      localStorage.setItem(this.pendingKey, JSON.stringify(this.pendingSubscription))
      console.log('✅ Pending subscription saved to localStorage')
      
      // Verify it was saved
      const verify = localStorage.getItem(this.pendingKey)
      console.log('🔍 Verification - localStorage has data:', !!verify)
      
      return this.pendingSubscription
    },

    // In stores/subscription.js
completeSubscriptionFromPending() {
  console.log('🎯 Completing subscription...')
  
  // Try state first, then fall back to direct localStorage read
  let pending = this.pendingSubscription
  
  if (!pending) {
    const stored = localStorage.getItem('mock_pending_subscription')
    console.log('🔍 Checking localStorage directly:', stored ? '✅ Found' : '❌ Empty')
    
    if (stored) {
      try {
        pending = JSON.parse(stored)
        console.log('🔁 Loaded pending from localStorage:', pending)
      } catch (err) {
        console.error('❌ Failed to parse pending data:', err)
        return null
      }
    }
  }
  
  if (!pending) {
    console.warn('⚠️ No pending subscription found anywhere')
    return null
  }

  const { 
    billingFrequency, 
    screenLicenses, 
    totalPrice,
    startedAt,
  } = pending

  // Calculate dates
  const startDate = new Date(startedAt || Date.now())
  const nextBilling = new Date(startDate)
  
  if (billingFrequency === 'monthly') {
    nextBilling.setMonth(nextBilling.getMonth() + 1)
  } else {
    nextBilling.setFullYear(nextBilling.getFullYear() + 1)
  }

  const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const newSubscription = {
    id,
    startedAt: this._formatDate(startDate.toISOString()),
    amount: `£${totalPrice.toFixed(2)}`,
    term: billingFrequency === 'monthly' ? 'Monthly' : 'Yearly',
    nextPayment: this._formatDate(nextBilling.toISOString()),
    lastPayment: this._formatDate(startDate.toISOString()),
    pairedTotal: `${screenLicenses}/${screenLicenses}`,
    status: 'Active',
    _meta: { screenLicenses, totalPrice, billingFrequency, createdAt: Date.now() }
  }

  this.subscriptions.unshift(newSubscription)
  this._persist()
  
  // Clear pending
  localStorage.removeItem('mock_pending_subscription')
  this.pendingSubscription = null
  
  console.log('✅ Subscription completed:', newSubscription)
  return newSubscription
},

    _formatDate(isoString) {
      if (!isoString) return '-'
      return new Date(isoString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    },

    addMockSubscription({ amount = 5, term = 'Monthly', screens = 1 } = {}) {
      const now = new Date()
      const nextBilling = new Date(now)
      if (term.toLowerCase().includes('month')) nextBilling.setMonth(nextBilling.getMonth() + 1)
      else nextBilling.setFullYear(nextBilling.getFullYear() + 1)

      const sub = {
        id: `sub_mock_${Date.now()}`,
        startedAt: this._formatDate(now.toISOString()),
        amount: `£${(amount * screens).toFixed(2)}`,
        term,
        nextPayment: this._formatDate(nextBilling.toISOString()),
        lastPayment: this._formatDate(now.toISOString()),
        pairedTotal: `${screens}/${screens}`,
        status: 'Active',
        _meta: { screenLicenses: screens, totalPrice: amount * screens }
      }
      this.subscriptions.unshift(sub)
      this._persist()
      return sub
    },

    deleteSubscription(id) {
      const idx = this.subscriptions.findIndex(s => s.id === id)
      if (idx !== -1) {
        this.subscriptions.splice(idx, 1)
        this._persist()
        return true
      }
      return false
    },

    clearAll() {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.pendingKey)
      this.subscriptions = []
      this.pendingSubscription = null
      console.log('🧹 Cleared all data')
    }
  }
})