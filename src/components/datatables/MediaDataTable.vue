<script setup>
import { Play, MoreVertical, FileText, Code2, Image as ImageIcon, Video, FileText as FileIcon } from 'lucide-vue-next'
import { useMediaStore } from '../../stores/media'

const store = useMediaStore()

const typeColors = {
  video: { bg: 'rgba(99, 102, 241, 0.15)', text: '#4f46e5', label: 'video', icon: Video },
  image: { bg: 'rgba(20, 184, 166, 0.15)', text: '#0d9488', label: 'image', icon: ImageIcon },
  html:  { bg: 'rgba(234, 179, 8, 0.15)',  text: '#ca8a04', label: 'html',  icon: Code2 },
  pdf:   { bg: 'rgba(239, 68, 68, 0.15)',  text: '#dc2626', label: 'pdf',   icon: FileIcon },
}

const getTypeMeta = (type) => typeColors[type] ?? typeColors['html']

const getIconClass = (type) => {
  switch(type) {
    case 'video': return 'icon-video'
    case 'image': return 'icon-image'
    case 'html':  return 'icon-html'
    case 'pdf':   return 'icon-pdf'
    default:      return 'icon-default'
  }
}
</script>

<template>
  <!-- ======== GRID VIEW ======== -->
  <div v-if="store.viewMode === 'grid'" class="media-grid">
    <div
      v-for="item in store.filteredItems"
      :key="item.id"
      class="media-card"
    >
      <!-- Thumbnail -->
      <div class="card-thumb" :style="{ background: item.gradient }">
        <!-- Play overlay for video -->
        <button v-if="item.type === 'video'" class="play-btn">
          <Play :size="24" fill="white" color="white" />
        </button>
        <!-- Badge: duration / resolution / pages -->
        <span v-if="item.duration" class="badge bottom-left">{{ item.duration }}</span>
        <span v-else-if="item.resolution" class="badge bottom-right">{{ item.resolution }}</span>
        <span v-else-if="item.pages" class="badge bottom-right">{{ item.pages }}</span>
        <span v-else-if="item.type === 'html'" class="badge bottom-right html-badge">HTML5</span>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <div class="card-meta">
          <span class="card-name">{{ item.name }}</span>
          <span class="card-customer">{{ item.customer }}</span>
        </div>
        <span
          class="type-badge"
          :style="{ background: getTypeMeta(item.type).bg, color: getTypeMeta(item.type).text }"
        >
          {{ getTypeMeta(item.type).label }}
        </span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.filteredItems.length === 0" class="empty-state">
      <FileText :size="40" color="var(--color-text-muted)" />
      <p>No media files found</p>
    </div>
  </div>

  <!-- ======== LIST / TABLE VIEW ======== -->
  <div v-else class="media-table-container">
    <table class="media-table">
      <thead>
        <tr>
          <th class="col-name">Name</th>
          <th class="col-type">Type</th>
          <th class="col-customer">Customer</th>
          <th class="col-size">Size</th>
          <th class="col-date">Date Added</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in store.filteredItems"
          :key="item.id"
          class="table-row"
          :class="{ selected: item.selected }"
        >
          <td>
            <div class="table-name-cell">
              <div class="table-thumb" :class="getIconClass(item.type)">
                <component :is="getTypeMeta(item.type).icon" :size="18" color="white" />
              </div>
              <span class="file-name">{{ item.name }}</span>
            </div>
          </td>
          <td>
            <span
              class="file-type-badge"
              :class="`badge-${item.type}`"
            >
              {{ item.type }}
            </span>
          </td>
          <td class="table-cell-secondary">{{ item.customer }}</td>
          <td class="table-cell-secondary">{{ item.size }}</td>
          <td class="table-cell-secondary">{{ item.date }}</td>
          <td>
            <div class="table-actions">
              <button class="btn-icon" :aria-label="`Actions for ${item.name}`">
                <MoreVertical :size="16" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="store.filteredItems.length === 0">
          <td colspan="6" class="empty-cell">
            <FileText :size="24" />
            <span>No media files found</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* ============================================
   TABLE / LIST VIEW — Light Theme
   ============================================ */

/* Container */
.media-table-container {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Table base */
.media-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

/* Header */
.media-table thead {
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.media-table th {
  text-align: left;
  padding: 0.875rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Column widths */
.col-name    { min-width: 280px; }
.col-type    { width: 100px; }
.col-customer{ min-width: 140px; }
.col-size    { width: 100px; }
.col-date    { width: 130px; }
.col-actions { width: 48px; text-align: right; }

/* Body rows */
.media-table tbody tr {
  border-bottom: 1px solid var(--color-border-light);
  transition: all 0.15s ease;
}

.media-table tbody tr:hover {
  background: var(--color-bg-hover);
}

/* Selected row — dark surface */
.media-table tbody tr.selected {
  background: var(--color-dark-surface);
}

.media-table tbody tr.selected td {
  color: var(--color-text-inverse);
}

.media-table tbody tr.selected .table-cell-secondary,
.media-table tbody tr.selected .file-type-badge {
  opacity: 0.8;
}

/* Cells */
.media-table td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
}

.table-cell-secondary {
  color: var(--color-text-secondary);
}

/* Name cell */
.table-name-cell {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.file-name {
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

/* Selected row name text */
.media-table tbody tr.selected .file-name {
  color: var(--color-text-inverse);
}

/* File icon thumbnails */
.table-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-video { background: linear-gradient(135deg, #166534, #14532d); }
.icon-image { background: linear-gradient(135deg, #334155, #1e293b); }
.icon-html  { background: linear-gradient(135deg, #9a3412, #7c2d12); }
.icon-pdf   { background: linear-gradient(135deg, #991b1b, #7f1d1d); }
.icon-default { background: linear-gradient(135deg, #475569, #334155); }

/* Type badges in table */
.file-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: lowercase;
}

.badge-html  { background: rgba(234, 179, 8, 0.15); color: #ca8a04; }
.badge-video { background: rgba(99, 102, 241, 0.15); color: #4f46e5; }
.badge-image { background: rgba(20, 184, 166, 0.15); color: #0d9488; }
.badge-pdf   { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

/* Action button */
.table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

/* Empty state */
.empty-cell {
  text-align: center;
  color: var(--color-text-muted);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

/* ============================================
   GRID VIEW — Light Theme
   ============================================ */

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.card-thumb {
  position: relative;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn {
  width: 44px;
  height: 44px;
  background: rgba(0, 0, 0, 0.45);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.play-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.badge {
  position: absolute;
  background: rgba(0, 0, 0, 0.6);
  color: #e2e8f0;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
}

.badge.bottom-left  { bottom: 8px; left: 8px; }
.badge.bottom-right { bottom: 8px; right: 8px; }
.html-badge         { color: #fcd34d; }

.card-footer {
  padding: 0.75rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-meta {
  flex: 1;
  min-width: 0;
}

.card-name {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-inverse);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-customer {
  display: block;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* Shared type badge */
.type-badge {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: lowercase;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Empty state (grid) */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .media-table {
    font-size: 0.8125rem;
  }
  
  .media-table th,
  .media-table td {
    padding: 0.75rem 1rem;
  }
  
  .col-name { min-width: 200px; }
  .file-name { max-width: 160px; }
  .col-customer, .col-size, .col-date { min-width: auto; }
}

@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  .col-customer { display: none; }
}
</style>