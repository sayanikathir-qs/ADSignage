<template>
  <div class="vc-page">
    <!-- Upload button -->
    <div class="vc-toolbar">
      <v-btn class="upload-btn" prepend-icon="mdi-upload" @click="uploadDialogOpen = true">
        Upload
      </v-btn>
    </div>

    <!-- Table card -->
    <div class="table-card">
      <!-- Table controls -->
      <div class="table-controls">
        <div class="entries-control">
          <select v-model="perPage" class="entries-select">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="entries-label">entries per page</span>
        </div>
        <div class="search-control">
          <span class="search-label">Search:</span>
          <input v-model="searchQuery" type="text" class="search-input" />
        </div>
      </div>

      <!-- Data table -->
      <table class="vc-table">
        <thead>
          <tr>
            <th @click="setSort('name')" class="th-sortable">
              File Name
              <span class="sort-arrows">
                <span :class="sortKey === 'name' && sortDir === 'asc' ? 'arrow--active' : ''">▲</span>
                <span :class="sortKey === 'name' && sortDir === 'desc' ? 'arrow--active' : ''">▼</span>
              </span>
            </th>
            <th @click="setSort('status')" class="th-sortable">
              Status
              <span class="sort-arrows">
                <span :class="sortKey === 'status' && sortDir === 'asc' ? 'arrow--active' : ''">▲</span>
                <span :class="sortKey === 'status' && sortDir === 'desc' ? 'arrow--active' : ''">▼</span>
              </span>
            </th>
            <th @click="setSort('convertedAt')" class="th-sortable">
              Converted At
              <span class="sort-arrows">
                <span :class="sortKey === 'convertedAt' && sortDir === 'asc' ? 'arrow--active' : ''">▲</span>
                <span :class="sortKey === 'convertedAt' && sortDir === 'desc' ? 'arrow--active' : ''">▼</span>
              </span>
            </th>
            <th @click="setSort('action')" class="th-sortable">
              Action
              <span class="sort-arrows">
                <span :class="sortKey === 'action' && sortDir === 'asc' ? 'arrow--active' : ''">▲</span>
                <span :class="sortKey === 'action' && sortDir === 'desc' ? 'arrow--active' : ''">▼</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pagedItems.length === 0">
            <td colspan="4" class="td-empty">No entries found</td>
          </tr>
          <tr v-for="item in pagedItems" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.status }}</td>
            <td>{{ item.convertedAt }}</td>
            <td>
              <button class="download-btn" @click="handleDownload(item)">
                <v-icon size="14">mdi-download</v-icon>
                Download
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Table footer -->
      <div class="table-footer">
        <span class="entry-info">
          {{ filteredItems.length === 0
              ? 'Showing 0 entries'
              : `Showing ${(currentPage - 1) * perPage + 1} to ${Math.min(currentPage * perPage, filteredItems.length)} of ${filteredItems.length} entries` }}
        </span>
        <div class="pagination">
          <button class="page-btn" @click="currentPage = 1" :disabled="currentPage === 1">«</button>
          <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1">‹</button>
          <button
            v-for="p in visiblePages"
            :key="p"
            class="page-btn"
            :class="{ 'page-btn--active': p === currentPage }"
            @click="currentPage = p"
          >{{ p }}</button>
          <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages">›</button>
          <button class="page-btn" @click="currentPage = totalPages" :disabled="currentPage === totalPages">»</button>
        </div>
      </div>
    </div>

    <!-- Upload dialog -->
    <VideoConvertUploadDialog
      v-model="uploadDialogOpen"
      @submit="handleUploadSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import VideoConvertUploadDialog from '@/components/dialogs/VideoConvertUploadDialog.vue';

const uploadDialogOpen = ref(false);
const searchQuery = ref('');
const perPage = ref(10);
const currentPage = ref(1);
const sortKey = ref('convertedAt');
const sortDir = ref('desc');

const items = ref([
  { id: 1, name: '20offerADscreen_converted.mp4', status: 'Completed', convertedAt: 'Thu, Sep 26, 2024 5:38 AM', _ts: 1727327880000 },
  { id: 2, name: '20% offer AD screen_converted.mp4', status: 'Completed', convertedAt: 'Thu, Sep 26, 2024 5:28 AM', _ts: 1727327280000 },
  { id: 3, name: '20% offer AD screen_converted.mp4', status: 'Completed', convertedAt: 'Thu, Sep 26, 2024 5:18 AM', _ts: 1727326680000 },
]);

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  let list = q
    ? items.value.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.status.toLowerCase().includes(q) ||
        i.convertedAt.toLowerCase().includes(q)
      )
    : [...items.value];

  list.sort((a, b) => {
    let va = a[sortKey.value] ?? '';
    let vb = b[sortKey.value] ?? '';
    if (sortKey.value === 'convertedAt') { va = a._ts; vb = b._ts; }
    if (va < vb) return sortDir.value === 'asc' ? -1 : 1;
    if (va > vb) return sortDir.value === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage.value)));

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  return filteredItems.value.slice(start, start + perPage.value);
});

const visiblePages = computed(() => {
  const pages = [];
  for (let p = 1; p <= totalPages.value; p++) pages.push(p);
  return pages;
});

watch([searchQuery, perPage], () => { currentPage.value = 1; });

const setSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
};

let nextId = 4;
const handleUploadSubmit = ({ name }) => {
  const now = new Date();
  const label = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    + ' ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  items.value.unshift({ id: nextId++, name, status: 'Completed', convertedAt: label, _ts: now.getTime() });
};

const handleDownload = (item) => {
  const blob = new Blob([`Converted video: ${item.name}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
</script>

<style scoped>
.vc-page {
  padding: 24px 32px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Toolbar */
.vc-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.upload-btn {
  background: #fdc704 !important;
  color: white !important;
  border-radius: 6px !important;
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  height: 38px;
  padding: 0 20px;
  box-shadow: none !important;
}

/* Table card */
.table-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  padding: 20px 24px;
}

/* Controls row */
.table-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.entries-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entries-select {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 28px 4px 10px;
  font-size: 13px;
  color: #374151;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%234a5568' d='M5 7L1 3h8z'/%3E%3C/svg%3E") no-repeat right 8px center;
  appearance: none;
  cursor: pointer;
  outline: none;
}

.entries-label {
  font-size: 13px;
  color: #6b7280;
}

.search-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
}

.search-input {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 13px;
  color: #374151;
  outline: none;
  width: 180px;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #fdc704; }

/* Table */
.vc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.vc-table thead tr {
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.vc-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  white-space: nowrap;
  background: white;
}

.th-sortable {
  cursor: pointer;
  user-select: none;
}
.th-sortable:hover { color: #1a1a2e; }

.sort-arrows {
  display: inline-flex;
  flex-direction: column;
  margin-left: 4px;
  font-size: 8px;
  line-height: 1;
  gap: 1px;
  color: #d1d5db;
  vertical-align: middle;
}

.sort-arrows .arrow--active {
  color: #374151;
}

.vc-table td {
  padding: 13px 16px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.vc-table tbody tr:last-child td {
  border-bottom: none;
}

.vc-table tbody tr:hover td {
  background: #fafafa;
}

.td-empty {
  text-align: center;
  color: #9ca3af;
  padding: 32px;
}

/* Download button */
.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.15s;
}
.download-btn:hover { color: #fdc704; }

/* Table footer */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.entry-info {
  font-size: 13px;
  color: #6b7280;
}

.pagination {
  display: flex;
  gap: 2px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-btn--active {
  background: #fdc704 !important;
  color: white !important;
  border-color: #fdc704 !important;
}
</style>
