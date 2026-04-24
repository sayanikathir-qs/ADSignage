<script setup>
import { watch } from 'vue' 
import { Play, MoreVertical, FileText, Code2, Image as ImageIcon, Video, FileText as FileIcon } from 'lucide-vue-next'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  folders: {
    type: Array,
    default: () => []
  },
  viewMode: {
    type: String,
    default: 'list'
  }
})

// ✅ Consistent kebab-case emits for Vue best practices
const emit = defineEmits([
  'preview',
  'download',
  'delete',           // for media items
  'delete-folder',    // ✅ for folders (passes full folder object)
  'navigate-folder',  // ✅ renamed from navigateFolder
  'rename-folder'     // ✅ added for consistency
])

// Watch folders for debugging/initialization if needed
watch(() => props.folders, (newVal) => {
  if (newVal && newVal.length > 0) {
    // Optional: log or trigger side effects
  }
}, { immediate: true });

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};
</script>

<template>
  <!-- ======== GRID VIEW ======== -->
  <div v-if="props.viewMode === 'grid'" class="media-grid">
    <!-- Folder Cards -->
    <div
      v-for="folder in props.folders"
      :key="'folder_' + folder.id"
      class="media-card folder-card"
      @click="emit('navigate-folder', folder.id)"
    >
      <div class="media-preview" style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);">
        <div class="preview-icon">
          <v-icon size="56" color="#6b7280">mdi-folder</v-icon>
        </div>
        <div class="folder-count-badge">
          {{ folder.itemCount }} items
        </div>
      </div>
      <div class="media-info">
        <div class="info-row">
          <span class="file-name">{{ typeof folder.name === 'object' ? folder.name?.name : folder.name }}</span>
          <!-- Grid view folder actions -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn 
                icon="mdi-dots-vertical" 
                variant="text" 
                size="small" 
                density="comfortable" 
                v-bind="props" 
                @click.stop
              />
            </template>
            <v-list density="compact" min-width="160">
              <v-list-item @click.stop="emit('navigate-folder', folder.id)">
                <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-folder-open</v-icon></template>
                <v-list-item-title>Open</v-list-item-title>
              </v-list-item>
              <v-list-item @click.stop="emit('rename-folder', folder)">
                <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-pencil</v-icon></template>
                <v-list-item-title>Rename</v-list-item-title>
              </v-list-item>
              <v-list-item 
                @click.stop="emit('delete-folder', folder)" 
                base-color="error"
              >
                <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
                <v-list-item-title>Delete Folder</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <p class="media-customer">Folder</p>
      </div>
    </div>

    <!-- Media Cards -->
    <div
      v-for="item in props.items"
      :key="item.id"
      class="media-card"
    >
      <!-- Thumbnail -->
      <div class="card-thumb" :style="{ background: item.gradient }">
        <button v-if="item.type === 'video'" class="play-btn">
          <Play :size="24" fill="white" color="white" />
        </button>
        <span v-if="item.duration" class="badge bottom-left">{{ item.duration }}</span>
        <span v-else-if="item.resolution" class="badge bottom-right">{{ item.resolution }}</span>
        <span v-else-if="item.pages" class="badge bottom-right">{{ item.pages }}</span>
        <span v-else-if="item.type === 'html'" class="badge bottom-right html-badge">HTML5</span>
      </div>

      <!-- Footer -->
      <div class="card-footer">
        <div class="card-meta">
          <span class="card-name">{{ item.name }}</span>
        </div>
        <span
          class="type-badge"
          :style="{ background: getTypeMeta(item.type).bg, color: getTypeMeta(item.type).text }"
        >
          {{ getTypeMeta(item.type).label }}
        </span>
        <!-- Media actions (dots) -->
        <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
            <v-btn 
              icon="mdi-dots-vertical" 
              variant="text" 
              size="x-small" 
              density="comfortable"
              class="ml-2"
              v-bind="props" 
              @click.stop
            />
          </template>
          <v-list density="compact" min-width="160">
            <v-list-item @click.stop="emit('preview', item)">
              <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-eye</v-icon></template>
              <v-list-item-title>Preview</v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="emit('download', item)">
              <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-download</v-icon></template>
              <v-list-item-title>Download</v-list-item-title>
            </v-list-item>
            <v-list-item @click.stop="emit('delete', item)" base-color="error">
              <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="props.items.length === 0 && props.folders.length === 0" class="empty-state">
      <FileText :size="40" color="var(--color-text-muted)" />
      <p>No media files found</p>
    </div>
  </div>

  <!-- ======== LIST / TABLE VIEW ======== -->
  <div v-else class="media-table-container">
    <table class="media-table">
      <thead>
        <tr>
          <th class="col-name">NAME</th>
          <th class="col-type">TYPE</th>
          <th class="col-size">SIZE</th>
          <th class="col-date">DATE</th>
          <th class="col-actions">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        <!-- Folders -->
        <tr
          v-for="folder in props.folders"
          :key="'folder_' + folder.id"
          class="table-row folder-row"
          @click="emit('navigate-folder', folder.id)"
        >
          <td>
            <div class="table-name-cell">
              <div class="table-thumb folder-icon">
                <v-icon size="18" color="white">mdi-folder</v-icon>
              </div>
              <span class="file-name">{{ folder.name }}</span>
            </div>
          </td>
          <td>
            <span class="file-type-badge badge-folder">folder</span>
          </td>
          <td class="table-cell-secondary">{{ folder.itemCount || 0 }} items</td>
          <td class="table-cell-secondary">{{ formatDate(folder.createdAt) }}</td>
          <td>
            <div class="table-actions">
              <v-menu >
                <template v-slot:activator="{ props }">
                  <button class="btn-icon" v-bind="props" @click.stop>
                    <MoreVertical :size="16" />
                  </button>
                </template>
                <v-list density="compact" min-width="160">
                  <v-list-item @click.stop="emit('navigate-folder', folder.id)">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-folder-open</v-icon></template>
                    <v-list-item-title>Open</v-list-item-title>
                  </v-list-item>
                  
                  <v-list-item @click.stop="emit('rename-folder', folder)">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-pencil</v-icon></template>
                    <v-list-item-title>Rename</v-list-item-title>
                  </v-list-item>
                  
                  <!-- ✅ DELETE FOLDER - emits full folder object -->
                  <v-list-item 
                    @click.stop="emit('delete-folder', folder)" 
                    base-color="error"
                  >
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </td>
        </tr>

        <!-- Media Items -->
        <tr
          v-for="item in props.items"
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
            <span class="file-type-badge" :class="`badge-${item.type}`">{{ item.type }}</span>
          </td>
          <td class="table-cell-secondary">{{ item.size }}</td>
          <td class="table-cell-secondary">{{ formatDate(item.date) }}</td>
          <td>
            <div class="table-actions">
              <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                  <button class="btn-icon" v-bind="props" :aria-label="`Actions for ${item.name}`">
                    <MoreVertical :size="16" />
                  </button>
                </template>
                <v-list density="compact" min-width="160">
                  <v-list-item @click.stop="emit('preview', item)">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-eye</v-icon></template>
                    <v-list-item-title>Preview</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click.stop="emit('download', item)">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-download</v-icon></template>
                    <v-list-item-title>Download</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click.stop="emit('delete', item)" base-color="error">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </td>
        </tr>
        
        <!-- Empty state for table -->
        <tr v-if="props.items.length === 0 && props.folders.length === 0">
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
/* ===== GRID VIEW STYLES ===== */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.media-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.media-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.folder-card {
  border: 2px dashed #e5e7eb;
}

.folder-card:hover {
  border-color: #fdc704;
  background: #fffbeb;
}

.media-preview {
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-icon {
  opacity: 0.9;
}

.folder-count-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
}

.card-thumb {
  height: 140px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 0 0;
}

.play-btn {
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.play-btn:hover {
  background: rgba(0, 0, 0, 0.5);
}

.badge {
  position: absolute;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.badge.bottom-left {
  bottom: 8px;
  left: 8px;
}

.badge.bottom-right {
  bottom: 8px;
  right: 8px;
}

.html-badge {
  background: rgba(234, 179, 8, 0.9);
}

.card-footer {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-meta {
  flex: 1;
  min-width: 0;
}

.card-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.card-customer {
  font-size: 11px;
  color: #9ca3af;
}

.type-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
  white-space: nowrap;
  flex-shrink: 0;
}

.media-info {
  padding: 12px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.media-customer {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #9ca3af;
  text-align: center;
}

/* ===== TABLE VIEW STYLES ===== */
.media-table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.media-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.media-table th {
  text-align: left;
  padding: 14px 16px;
  font-weight: 600;
  color: #6b7280;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.media-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #1a1a2e;
}

.media-table tr:last-child td {
  border-bottom: none;
}

.media-table tr:hover {
  background: #f9fafb;
}

.folder-row {
  background: #fffbeb;
  border-left: 3px solid #fdc704;
}

.folder-row:hover {
  background: #fef3c7;
}

.table-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.table-thumb {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.folder-icon {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.icon-video { background: rgba(99, 102, 241, 0.15); }
.icon-image { background: rgba(20, 184, 166, 0.15); }
.icon-html  { background: rgba(234, 179, 8, 0.15); }
.icon-pdf   { background: rgba(239, 68, 68, 0.15); }

.file-type-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  text-transform: capitalize;
  display: inline-block;
}

.badge-folder {
  background: #f3f4f6;
  color: #6b7280;
}

.badge-video { background: rgba(99, 102, 241, 0.15); color: #4f46e5; }
.badge-image { background: rgba(20, 184, 166, 0.15); color: #0d9488; }
.badge-html  { background: rgba(234, 179, 8, 0.15); color: #ca8a04; }
.badge-pdf   { background: rgba(239, 68, 68, 0.15); color: #dc2626; }

.table-cell-secondary {
  color: #6b7280;
  font-size: 13px;
}

.table-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-icon {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #1a1a2e;
}

.empty-cell {
  text-align: center;
  padding: 48px;
  color: #9ca3af;
}

.empty-cell span {
  display: block;
  margin-top: 8px;
  font-size: 14px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .media-table-container {
    overflow-x: auto;
  }
  
  .media-table {
    min-width: 700px;
  }
  
  .col-customer,
  .col-size {
    display: none;
  }
}
</style>