<template>
  <div class="page-container">

    <!-- Main Content -->
    <main class="content-area">
      
      <!-- Section 1: Subscriptions -->
      <section class="data-section">
        <div class="section-header">
          <h2>Subscriptions / Current plan</h2>
          <button class="btn-buy-now" @click="router.push('/Payments')">
            <span class="cart-icon">🛒</span> Buy Now
          </button>
        </div>

        <div class="table-controls">
          <div class="entries-select">
            <span>Show</span>
            <select class="form-select" v-model="subscriptionsPerPage">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
          <div class="search-box">
            <label>Search:</label>
            <input type="text" class="form-input" v-model="searchQuery">
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="header in subscriptionHeaders" :key="header">{{ header }} ↕</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in filteredSubscriptions" :key="sub.id">
                <td>{{ sub.id }}</td>
                <td>{{ sub.startedAt }}</td>
                <td>{{ sub.amount }}</td>
                <td>{{ sub.term }}</td>
                <td>{{ sub.nextPayment }}</td>
                <td>{{ sub.lastPayment }}</td>
                <td>{{ sub.pairedTotal }}</td>
                <td><span class="status-badge active">{{ sub.status }}</span></td>
                <td>
                  <button class="action-btn delete" @click="openDeleteDialog(sub)" title="Delete">
                    <span>🗑️</span>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredSubscriptions.length === 0">
                <td colspan="9" class="no-data">
                  {{ searchQuery ? 'No matching subscriptions' : 'No subscriptions yet. Click "Buy Now" to get started!' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <div class="pagination-info">
            Showing {{ filteredSubscriptions.length }} of {{ subscriptionStore.subscriptions.length }} entries
          </div>
          <div class="pagination-buttons">
            <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">Previous</button>
            <button class="page-btn active">{{ currentPage }}</button>
            <button class="page-btn" @click="nextPage" :disabled="currentPage >= totalPages">Next</button>
          </div>
        </div>
      </section>

      <!-- Section 2: Invoices -->
      <section class="data-section">
        <div class="section-header">
          <h2>Invoices</h2>
        </div>

        <div class="table-controls">
          <div class="entries-select">
            <span>Show</span>
            <select class="form-select">
              <option value="10">10</option>
            </select>
            <span>entries</span>
          </div>
          <div class="search-box">
            <label>Search:</label>
            <input type="text" class="form-input">
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice ID ↕</th>
                <th>Term ↕</th>
                <th>Amount ↕</th>
                <th>Paid At ↕</th>
                <th>Period ↕</th>
                <th>Action ↕</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inv in filteredInvoices" :key="inv.id">
                <td>{{ inv.id }}</td>
                <td>{{ inv.term }}</td>
                <td>{{ inv.amount }}</td>
                <td>{{ inv.paidAt }}</td>
                <td>{{ inv.period }}</td>
                <td>
                  <button class="action-btn download" @click.stop="handleDownload(inv)" title="Download">
                    <span class="download-icon">⬇</span>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredInvoices.length === 0">
                <td colspan="6" class="no-data">No invoices available</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <div class="pagination-info">
            Showing 1 to {{ filteredInvoices.length }} of {{ filteredInvoices.length }} entries
          </div>
          <div class="pagination-buttons">
            <button class="page-btn">Previous</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">Next</button>
          </div>
        </div>
      </section>

    </main>

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      v-model="deleteDialog.open"
      title="Delete Subscription"
      :message="`Are you sure you want to delete subscription '${deleteDialog.item?.id?.slice(0, 12)}...'?`"
      detail="This action cannot be undone."
      icon="mdi-delete-alert"
      icon-color="error"
      confirm-text="Delete"
      confirm-color="error"
      cancel-text="Cancel"
      :loading="deleteDialog.loading"
      @confirm="handleConfirmDelete"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useSubscriptionStore } from '@/stores/subscription'
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.vue'

const router = useRouter()
const route = useRoute()
const subscriptionStore = useSubscriptionStore()

// ─── State ─────────────
const deleteDialog = ref({ open: false, item: null, loading: false })
const searchQuery = ref('')
const subscriptionsPerPage = ref('10')
const currentPage = ref(1)

const subscriptionHeaders = [
  'ID', 'Started at', 'Amount', 'Term', 'Next payment date',
  'Last payment date', 'Paired/Total', 'Status', 'Action'
]

// Mock invoices data (keep your existing structure)
const invoices = ref([
  // Add your mock invoice objects here, or import from mockData
])

// ─── Computed: Filtered & Paginated Subscriptions ─────────────
const filteredSubscriptions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const filtered = subscriptionStore.subscriptions.filter(sub =>
    Object.values(sub).some(val => String(val).toLowerCase().includes(q))
  )
  
  // Simple pagination
  const start = (currentPage.value - 1) * parseInt(subscriptionsPerPage.value)
  const end = start + parseInt(subscriptionsPerPage.value)
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const total = subscriptionStore.subscriptions.filter(sub =>
    Object.values(sub).some(val => String(val).toLowerCase().includes(q))
  ).length
  return Math.ceil(total / parseInt(subscriptionsPerPage.value)) || 1
})

const filteredInvoices = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return invoices.value.filter(inv =>
    Object.values(inv).some(val => String(val).toLowerCase().includes(q))
  )
})

// Debug info for dev panel
const debugInfo = computed(() => ({
  routeQuery: route.query,
  storeSubscriptions: subscriptionStore.subscriptions.length,
  storePending: subscriptionStore.pendingSubscription,
  localStorageKeys: Object.keys(localStorage).filter(k => k.includes('mock')),
  localStoragePending: localStorage.getItem('mock_pending_subscription')
}))

// ─── Lifecycle ─────────────
// Replace your entire onMounted() in Subscriptions.vue with this:
onMounted(() => {
  console.log('📦 Subscriptions.vue mounted')
  console.log('🔍 Route query:', route.query)
  
  // 1️ Initialize store
  subscriptionStore.init()
  
  // 2️ ✅ CRITICAL: Check for pending data OR success query
  // This guarantees completion even if Stripe/Router drops the URL parameter
  const pendingInStorage = localStorage.getItem('mock_pending_subscription')
  const hasSuccessQuery = route.query.payment === 'success'
  
  if (pendingInStorage || hasSuccessQuery) {
    console.log('✅ Completing subscription flow...')
    
    // Store method already reads from localStorage if state is empty
    const completed = subscriptionStore.completeSubscriptionFromPending()
    
    if (completed) {
      toast.success('🎉 Payment successful! Your subscription is now active.')
      
      // 🔒 Force cleanup to prevent double-processing on refresh
      localStorage.removeItem('mock_pending_subscription')
      
      // Clean URL only if the query param was actually present
      if (hasSuccessQuery) {
        router.replace({ path: '/subscriptions', query: {} })
      }
    } else {
      console.warn('⚠️ Subscription completion returned null.')
      toast.warning('Payment completed but subscription data could not be processed.')
    }
  }
})


// ─── Actions ─────────────
const openDeleteDialog = (sub) => {
  deleteDialog.value.item = sub
  deleteDialog.value.open = true
}

const handleDownload = (inv) => {
  if (!inv) return
  const content = `Invoice Details:\nID: ${inv.id}\nTerm: ${inv.term}\nAmount: ${inv.amount}\nPaid At: ${inv.paidAt}\nPeriod: ${inv.period}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice_${inv.id}_${inv.term}.txt`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
  toast.success('Invoice downloaded')
}

const handleConfirmDelete = async () => {
  if (!deleteDialog.value.item) return
  
  deleteDialog.value.loading = true
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const result = subscriptionStore.deleteSubscription(deleteDialog.value.item.id)
    
    if (result) {
      toast.success('Subscription deleted successfully')
    } else {
      toast.error('Subscription not found')
    }
    
    deleteDialog.value.open = false
    deleteDialog.value.item = null
  } catch (err) {
    console.error('Delete error:', err)
    toast.error('Failed to delete subscription')
  } finally {
    deleteDialog.value.loading = false
  }
}

// Pagination
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// ─── Dev Tools (only in dev mode) ─────────────
const testAddSubscription = () => {
  const sub = subscriptionStore.addMockSubscription({
    amount: 5,
    term: Math.random() > 0.5 ? 'Monthly' : 'Yearly',
    screens: Math.floor(Math.random() * 5) + 1
  })
  toast.success(`Test subscription added: ${sub.id.slice(0, 12)}...`)
}

const clearAllData = () => {
  if (confirm('Clear ALL subscription data? This cannot be undone.')) {
    subscriptionStore.clearAll()
    toast.info('All data cleared. Refresh to see changes.')
  }
}

</script>

<style scoped>
/* General Layout */
.page-container {
  background-color: #f4f6f9;
  min-height: 100vh;
  color: #333;
}

/* Content Area */
.content-area {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Sections */
.data-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

/* Yellow Headers */
.section-header {
  background-color: #ffc107;
  color: #333;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* Buy Now Button */
.btn-buy-now {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
}
.btn-buy-now:hover {
  opacity: 0.9;
}

/* Table Controls */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.entries-select, .search-box {
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-select, .form-input {
  padding: 5px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-input {
  width: 200px;
}

/* Data Table */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
}

.data-table th {
  text-align: left;
  padding: 12px 15px;
  background-color: #f9f9f9;
  border-bottom: 2px solid #e9ecef;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
  color: #555;
}

.data-table tr:nth-child(even) {
  background-color: #fafafa;
}

.data-table tr:hover {
  background-color: #f8f9fa;
}

/* Status Badge */
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  color: white;
}
.status-badge.active {
  background-color: #28a745;
}

/* Action Buttons */
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
  transition: transform 0.1s;
}
.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.delete span {
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.download-icon {
  background: #28a745;
  color: white;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* Pagination */
.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f9f9f9;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-info {
  font-size: 13px;
  color: #666;
}

.pagination-buttons {
  display: flex;
  gap: 5px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  transition: background 0.2s;
}
.page-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-btn.active {
  background-color: #ffc107;
  border-color: #ffc107;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 40px !important;
  color: #999;
  font-style: italic;
}

/* Debug Panel */
.debug-panel {
  margin: 20px;
  padding: 15px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
}
.debug-panel summary {
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 10px;
}
.debug-panel pre {
  background: #2d2d2d;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 300px;
}
.btn-debug {
  margin: 5px 5px 5px 0;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  background: #007acc;
  color: white;
}
.btn-debug.danger {
  background: #dc3545;
}
.btn-debug:hover {
  opacity: 0.9;
}

/* Responsive */
@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  .pagination-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>