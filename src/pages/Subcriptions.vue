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
                <th v-for="header in subscriptionHeaders" :key="header">#{{ header === 'ID' ? '' : '' }}{{ header }} ↕</th>
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
            </tbody>
          </table>
        </div>

        <div class="pagination-bar">
          <div class="pagination-info">
            Showing {{ filteredSubscriptions.length }} to {{ filteredSubscriptions.length }} of {{ filteredSubscriptions.length }} entries
          </div>
          <div class="pagination-buttons">
            <button class="page-btn">Previous</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">Next</button>
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
                  <button class="action-btn download" @click.stop ="handleDownload(inv)" title="Download">
                    <span class="download-icon">⬇</span>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredInvoices.length === 0">
                <td colspan="6" class="no-data">No data available</td>
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
      title="Delete Media"
      :message="`Are you sure you want to delete '${deleteDialog.item?.name}'?`"
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
import { invoices, subscriptions } from '../data/mockData'
import ConfirmationDialog from '../components/dialogs/ConfirmationDialog.vue'

const router = useRouter()
const route = useRoute()

const deleteDialog = ref({
  open: false,
  item: null,
  loading: false
})
const openDeleteDialog = (sub) => {
  deleteDialog.value.item = sub
  deleteDialog.value.open = true
}

onMounted(() => {
  if (route.query.payment === 'success') {
    toast.success('Payment successful! Your subscription is now active.')
    // Clean the query param from the URL without reloading
    router.replace({ path: '/subcriptions' })
  }
})

const searchQuery = ref('')
const subscriptionsPerPage = ref('10')

const subscriptionHeaders = [
  'ID', 'Started at', 'Amount', 'Term', 'Next payment date',
  'Last payment date', 'Paired/Total', 'Status', 'Action'
]

const filteredSubscriptions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return subscriptions.filter(sub =>
    Object.values(sub).some(val => String(val).toLowerCase().includes(q))
  )
})

const filteredInvoices = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return invoices.filter(inv =>
    Object.values(inv).some(val => String(val).toLowerCase().includes(q))
  )
})

const handleDownload = (inv) => {
  if (!inv) return;
  const blob = new Blob([`Invoice :` + inv.name + "Term :" + inv.term + "Amount:" + inv.amount + "Paid At:" + inv.paidAt + "Period:" + inv.period], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = inv.name + "_" + inv.term + ".txt"
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};


const handleConfirmDelete = async () => {
  if (!deleteDialog.value.item) return

  deleteDialog.value.loading = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // Remove item from array
    const index = filteredSubscriptions.value.findIndex(s => s.id === deleteDialog.value.item.id)
    if (index !== -1) {
      filteredSubscriptions.value.splice(index, 1)
    }

    toast.success(`'${deleteDialog.value.item.name}' has been deleted.`)
    deleteDialog.value.open = false
    deleteDialog.value.item = null
  } catch (error) {
    console.error('Delete error:', error)
    toast.error('Failed to delete media')
  } finally {
    deleteDialog.value.loading = false
  }
}
</script>

<style scoped>
/* General Layout */
.page-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f6f9;
  min-height: 100vh;
  color: #333;
}

/* Top Nav */
.top-nav {
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #e1e1e1;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-icon {
  font-size: 24px;
  color: #ffc107; /* Yellow hamburger */
  cursor: pointer;
}

.nav-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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
  background-color: #ffc107; /* Approximate yellow from image */
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
}

/* Table Controls */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  font-size: 14px;
}

.entries-select {
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-select, .form-input {
  padding: 5px;
  border: 1px solid #ced4da;
  border-radius: 4px;
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
  min-width: 1000px; /* Force scroll on small screens */
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

/* Status Badge */
.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  color: white;
}

.status-badge.active {
  background-color: #28a745; /* Green */
}

/* Action Buttons */
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
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
}

.page-btn:hover {
  background-color: #e9ecef;
}

.page-btn.active {
  background-color: #ffc107;
  border-color: #ffc107;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 20px !important;
  color: #999;
}
</style>