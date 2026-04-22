<template>
  <div class="media-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Media Library</h1>
        <p class="page-subtitle">Manage all uploaded assets across customers</p>
      </div>
      <div class="header-actions">
        <v-btn class="action-btn upload-btn" prepend-icon="mdi-upload" @click="openUploadDialog" :disabled="!currentFolderId">
          Upload
        </v-btn>
        <v-btn class="action-btn folder-btn" prepend-icon="mdi-folder-plus" @click="openCreateFolderDialog">
          New Folder
        </v-btn>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <div class="breadcrumb-nav">
      <template v-for="(folder, index) in folderPath" :key="folder.id">
        <span class="breadcrumb-separator">/</span>
        <button 
          class="breadcrumb-item" 
          @click="navigateToFolder(folder.id, index)"
        >
          {{ folder.name }}
        </button>
      </template>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <v-card class="stat-card">
        <v-card-text>
          <div class="stat-dot stat-dot--teal"></div>
          <p class="stat-label">TOTAL STORAGE</p>
          <h2 class="stat-value">2.4 TB</h2>
          <p class="stat-sub">67% of 3.6 TB used</p>
        </v-card-text>
      </v-card>

      <v-card class="stat-card">
        <v-card-text>
          <div class="stat-dot stat-dot--indigo"></div>
          <p class="stat-label">TOTAL FILES</p>
          <h2 class="stat-value">{{ totalFiles }}</h2>
          <p class="stat-sub">Across all customers</p>
        </v-card-text>
      </v-card>

      <v-card class="stat-card">
        <v-card-text>
          <div class="stat-dot stat-dot--purple"></div>
          <p class="stat-label">VIDEOS</p>
          <h2 class="stat-value">4,218</h2>
          <p class="stat-sub">1.8 TB total</p>
        </v-card-text>
      </v-card>

      <v-card class="stat-card">
        <v-card-text>
          <div class="stat-dot stat-dot--teal"></div>
          <p class="stat-label">IMAGES</p>
          <h2 class="stat-value">12,847</h2>
          <p class="stat-sub">580 GB total</p>
        </v-card-text>
      </v-card>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <!-- Search -->
      <div class="search-wrapper">
        <v-icon size="20" color="grey-darken-1" class="search-icon">mdi-magnify</v-icon>
        <input
          type="text"
          class="search-input"
          placeholder="Search media..."
          v-model="searchValue"
          @input="handleSearch"
        />
      </div>

      <!-- Type Pills -->
      <div class="type-pills">
        <button
          v-for="type in typeFilters"
          :key="type.value"
          :class="['type-pill', { 'type-pill--active': activeType === type.value }]"
          @click="handleTypeChange(type.value)"
        >
          {{ type.label }}
        </button>
      </div>

      <!-- View Toggle & Sort -->
      <div class="toolbar-right">
        <div class="view-toggle">
          <button
            :class="['view-btn', { 'view-btn--active': viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            <v-icon size="18">mdi-grid</v-icon>
          </button>
          <button
            :class="['view-btn', { 'view-btn--active': viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            <v-icon size="18">mdi-view-list</v-icon>
          </button>
        </div>

        <div class="sort-wrapper">
          <select v-model="sortBy" class="sort-select" @change="handleSort">
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
          <v-icon size="16" color="grey-darken-1" class="sort-icon">mdi-chevron-down</v-icon>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="mediaStore.loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="40" />
    </div>

    <!-- Empty State - No Folders -->
    <div v-else-if="!currentFolderId && currentFolders.length === 0 && displayedMedia.length === 0" class="empty-state">
      <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-folder-plus</v-icon>
      <h3 class="text-h5 mb-2">Start by creating a folder</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">Organize your media by creating folders</p>
      <v-btn class="action-btn folder-btn" prepend-icon="mdi-folder-plus" @click="openCreateFolderDialog">
        Create Your First Folder
      </v-btn>
    </div>

    <!-- Empty State - Folder Empty -->
    <div v-else-if="currentFolderId && currentFolders.length === 0 && displayedMedia.length === 0" class="empty-state">
      <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-folder-open</v-icon>
      <h3 class="text-h5 mb-2">This folder is empty</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">Upload files to this folder to get started</p>
      <v-btn class="action-btn upload-btn" prepend-icon="mdi-upload" @click="openUploadDialog">
        Upload Files
      </v-btn>
    </div>

    <!-- Media Grid -->
    <div v-else-if="viewMode === 'grid'" class="media-grid">
      <!-- Folder Cards -->
      <div
        v-for="folder in currentFolders"
        :key="'folder_' + folder.id"
        class="media-card folder-card"
        @click="navigateToFolder(folder.id)"
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
            <span class="media-name" :title="folder.name">{{ folder.name }}</span>
            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" size="small" density="comfortable" 
                       v-bind="props" @click.stop></v-btn>
              </template>
              <v-list density="compact" min-width="160">
                <v-list-item @click.stop="openRenameFolderDialog(folder)">
                  <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-pencil</v-icon></template>
                  <v-list-item-title>Rename</v-list-item-title>
                </v-list-item>
                <v-list-item @click.stop="openDeleteFolderDialog(folder)" base-color="error">
                  <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
                  <v-list-item-title>Delete Folder</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
          <p class="media-customer">Folder • {{ formatDate(folder.createdAt) }}</p>
        </div>
      </div>

      <!-- Media Cards -->
      <div
        v-for="item in displayedMedia"
        :key="item.id"
        class="media-card"
        @click="handleCardClick(item)"
      >
        <!-- Preview -->
        <div class="media-preview" :style="{ background: item.gradient }">
          <!-- Play button for videos -->
          <div v-if="item.type === 'video'" class="play-overlay">
            <v-icon size="40" color="white" class="play-icon">mdi-play-circle</v-icon>
          </div>
          
          <!-- Resolution badge -->
          <div v-if="item.resolution" class="preview-badge preview-badge--resolution">
            {{ item.resolution }}
          </div>
          
          <!-- Duration badge -->
          <div v-if="item.duration" class="preview-badge preview-badge--duration">
            {{ item.duration }}
          </div>
          
          <!-- Pages badge -->
          <div v-if="item.pages" class="preview-badge preview-badge--pages">
            {{ item.pages }}
          </div>

          <!-- Type icon -->
          <div class="preview-icon">
            <v-icon :size="item.type === 'video' ? 48 : 40" color="white">
              {{ getPreviewIcon(item.type) }}
            </v-icon>
          </div>

          <!-- Type label -->
          <div class="preview-type-label">
            {{ item.type.toUpperCase() }}
          </div>
        </div>

        <!-- Info -->
        <div class="media-info">
          <div class="info-row">
            <span class="media-name" :title="item.name">{{ item.name }}</span>
            <div class="info-actions">
              <span :class="['media-type-badge', `media-type-badge--${item.type}`]">
                {{ item.type }}
              </span>
              <v-menu location="bottom end">
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" size="small" density="comfortable" v-bind="props" @click.stop></v-btn>
                </template>
                <v-list density="compact" min-width="160">
                  <v-list-item @click.stop="handlePreview(item)">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-eye</v-icon></template>
                    <v-list-item-title>Preview</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click.stop="handleDownload(item)">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-download</v-icon></template>
                    <v-list-item-title>Download</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click.stop="openDeleteDialog(item)" base-color="error">
                    <template v-slot:prepend><v-icon size="small" class="mr-2">mdi-delete</v-icon></template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>
          <p class="media-customer">{{ item.customer }}</p>
        </div>
      </div>
    </div>

    <!-- Media List View -->
    <MediaDataTable
  v-else
  :items="displayedMedia"
  :folders="currentFolders"
  view-mode="list"
  @preview="handlePreview"
  @download="handleDownload"
  @delete="openDeleteDialog"
  @delete-folder="openDeleteFolderDialog" 
  @navigate-folder="navigateToFolder"     
  @rename-folder="openRenameFolderDialog"  
/>

    <!-- Create Folder Dialog -->
    <CreateFolderDialog
      v-model="createFolderDialog.open"
      :loading="createFolderDialog.loading"
      :folder-name="createFolderDialog.folderName"
      @submit="handleCreateFolderSubmit"
    />

    <!-- Upload Dialog -->
    <MediaUploadDialog
      v-model="uploadDialog.open"
      :loading="uploadDialog.loading"
      :current-folder-id="currentFolderId"
      @submit="handleUploadSubmit"
    />

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

    <!-- Delete Folder Dialog -->
    <ConfirmationDialog
      v-model="deleteFolderDialog.open"
      title="Delete Folder"
      :message="`Are you sure you want to delete folder '${deleteFolderDialog.folder?.name}'?`"
      detail="All contents will be permanently deleted."
      icon="mdi-folder-alert"
      icon-color="error"
      confirm-text="Delete"
      confirm-color="error"
      cancel-text="Cancel"
      :loading="deleteFolderDialog.loading"
      @confirm="handleConfirmDeleteFolder"
    />

    <!-- Preview Dialog -->
    <v-dialog v-model="previewDialog.open" fullscreen transition="dialog-bottom-transition">
      <v-card class="bg-black" v-if="previewDialog.item">
        <v-toolbar color="rgba(0,0,0,0.8)" class="text-white">
          <v-btn icon variant="text" @click="previewDialog.open = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title class="font-weight-bold">Media Preview - {{ previewDialog.item.name }}</v-toolbar-title>
        </v-toolbar>
        
        <v-card-text class="pa-0 bg-black">
          <v-sheet height="calc(100vh - 64px)" width="100%" color="transparent" class="d-flex flex-column align-center justify-center">
            <v-icon size="120" :color="getIconColor(previewDialog.item.type)">{{ getPreviewIcon(previewDialog.item.type) }}</v-icon>
            <h2 class="text-white mt-6">{{ previewDialog.item.name }}</h2>
            <div class="d-flex align-center mt-4">
              <v-chip :color="getIconColor(previewDialog.item.type)" class="mr-3 text-uppercase font-weight-bold">{{ previewDialog.item.type }}</v-chip>
              <span class="text-medium-emphasis text-h6">Duration: {{ previewDialog.item.duration || '00:10' }}</span>
            </div>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useMediaStore } from "@/stores/media";
import MediaUploadDialog from "@/components/dialogs/MediaUploadDialog.vue";
import CreateFolderDialog from "@/components/dialogs/CreateFolderDialog.vue";
import MediaDataTable from "@/components/datatables/MediaDataTable.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";

const mediaStore = useMediaStore();

const searchValue = ref("");
const activeType = ref("all");
const viewMode = ref("grid");
const sortBy = ref("latest");
const currentFolderId = ref(null);
const folderPath = ref([]);

const uploadDialog = ref({
  open: false,
  loading: false,
});

const createFolderDialog = ref({
  open: false,
  loading: false,
  folderName: "",
});

const deleteDialog = ref({
  open: false,
  loading: false,
  item: null,
});

const deleteFolderDialog = ref({
  open: false,
  loading: false,
  folder: null,
});

const previewDialog = ref({
  open: false,
  item: null
});

const typeFilters = [
  { label: "All", value: "all" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "HTML", value: "html" },
  { label: "PDF", value: "pdf" },
];

const totalFiles = computed(() => {
  return mediaStore.mediaItems.length.toLocaleString();
});

const currentFolders = computed(() => {
  return mediaStore.folders.filter(f => f.parentId === currentFolderId.value);
});

const displayedMedia = computed(() => {
  let filtered = [...mediaStore.mediaItems];

  // Filter by current folder
  if (currentFolderId.value) {
    filtered = filtered.filter(item => item.folderId === currentFolderId.value);
  } else {
    filtered = filtered.filter(item => !item.folderId || item.folderId === null);
  }

  // Filter by type
  if (activeType.value !== "all") {
    filtered = filtered.filter((item) => item.type === activeType.value);
  }

  // Filter by search
  if (searchValue.value) {
    const search = searchValue.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name?.toLowerCase().includes(search) ||
        item.customer?.toLowerCase().includes(search)
    );
  }

  // Sort
  switch (sortBy.value) {
    case "oldest":
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "size":
      filtered.sort((a, b) => a.size.localeCompare(b.size));
      break;
    case "latest":
    default:
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  return filtered;
});

const getPreviewIcon = (type) => {
  const icons = {
    image: "mdi-image",
    video: "mdi-video",
    html: "mdi-language-html5",
    pdf: "mdi-file-pdf-box",
  };
  return icons[type] || "mdi-file";
};

const getIconColor = (type) => {
  switch (type) {
    case 'video': return 'indigo'
    case 'image': return 'teal'
    case 'html': return 'warning'
    case 'pdf': return 'error'
    default: return 'grey'
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const handleSearch = () => {};

const handleTypeChange = (type) => {
  activeType.value = type;
};

const handleSort = () => {};

const handleCardClick = (item) => {
  handlePreview(item);
};

const handlePreview = (item) => {
  previewDialog.value.item = item;
  previewDialog.value.open = true;
};

const navigateToRoot = () => {
  currentFolderId.value = null;
  folderPath.value = [];
};

const navigateToFolder = (folderId, upToIndex = -1) => {
  if (upToIndex >= 0) {
    folderPath.value = folderPath.value.slice(0, upToIndex + 1);
  } else {
    const folder = mediaStore.folders.find(f => f.id === folderId);
    if (folder) {
      folderPath.value.push(folder);
    }
  }
  currentFolderId.value = folderId;
};

const openCreateFolderDialog = () => {
  createFolderDialog.value.folderName = "";
  createFolderDialog.value.open = true;
};

// ✅ CORRECT
const handleCreateFolderSubmit = async (payload) => {
  // payload is already { name: "sfsg", parentId: null }
  createFolderDialog.value.loading = true;
  try {
    await mediaStore.createFolder(payload);
    createFolderDialog.value.open = false;
  } catch (error) {
    console.error("Create folder error:", error);
  } finally {
    createFolderDialog.value.loading = false;
  }
};

// In media.vue script setup
const openRenameFolderDialog = (folder) => {
  // folder is now the full object, not just ID
  const newName = prompt("Rename folder:", folder.name);
  if (newName && newName.trim()) {
    mediaStore.updateFolder(folder.id, { name: newName.trim() });
  }
};

const openDeleteFolderDialog = (folder) => {
  deleteFolderDialog.value.folder = folder;
  deleteFolderDialog.value.open = true;
};

const handleConfirmDeleteFolder = async () => {
  if (!deleteFolderDialog.value.folder) return;
  deleteFolderDialog.value.loading = true;
  try {
    await mediaStore.deleteFolder(deleteFolderDialog.value.folder.id);
    deleteFolderDialog.value.open = false;
  } catch (error) {
    console.error("Delete folder error:", error);
  } finally {
    deleteFolderDialog.value.loading = false;
    deleteFolderDialog.value.folder = null;
  }
};

const openUploadDialog = () => {
  uploadDialog.value.open = true;
};

const handleUploadSubmit = async (payload) => {
  uploadDialog.value.loading = true;
  try {
    await mediaStore.uploadMedia({
      ...payload,
      folderId: currentFolderId.value
    });
    uploadDialog.value.open = false;
  } catch (error) {
    console.error("Upload error:", error);
  } finally {
    uploadDialog.value.loading = false;
  }
};

const handleDownload = (item) => {
  if (!item) return;
  const blob = new Blob([`Mock content for ${item.name}`], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = item.name;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

const openDeleteDialog = (item) => {
  deleteDialog.value.item = item;
  deleteDialog.value.open = true;
};

const handleConfirmDelete = async () => {
  if (!deleteDialog.value.item) return;
  deleteDialog.value.loading = true;
  try {
    await mediaStore.deleteMedia(deleteDialog.value.item.id);
  } catch (error) {
    console.error("Delete error:", error);
  } finally {
    deleteDialog.value.loading = false;
    deleteDialog.value.open = false;
    deleteDialog.value.item = null;
  }
};

onMounted(async () => {
  await mediaStore.fetchMedia();
  await mediaStore.fetchFolders();
  await mediaStore.fetchStats();
});
</script>

<style scoped>
.media-page {
  padding: 32px 40px;
  max-width: 1440px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  border-radius: 24px !important;
  font-weight: 600;
  font-size: 14px;
  padding: 0 20px;
  height: 40px;
  text-transform: none;
}

.upload-btn {
  background: #fdc704;
  color: white;
}

.upload-btn:hover {
  background: #fdc704;
}

.folder-btn {
  background: #fdc704;
  color: white;
}

.folder-btn:hover {
  background: #fdc704;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  border-radius: 12px !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: none !important;
}

.stat-card :deep(.v-card-text) {
  padding: 20px;
  position: relative;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  top: 20px;
  left: 20px;
}

.stat-dot--teal {
  background: #fdc704;
}

.stat-dot--indigo {
  background: #6366f1;
}

.stat-dot--purple {
  background: #8b5cf6;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px 0;
}

.stat-sub {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 0 0 280px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 16px 0 42px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #fdc704;
}

.search-input::placeholder {
  color: #9ca3af;
}

/* Type Pills */
.type-pills {
  display: flex;
  gap: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 4px;
}

.type-pill {
  padding: 6px 16px;
  border: none;
  background: transparent;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.type-pill:hover {
  color: #1a1a2e;
  background: #f3f4f6;
}

.type-pill--active {
  background: #fdc704;
  color: white;
}

/* Toolbar Right */
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

.view-btn:hover {
  color: #1a1a2e;
}

.view-btn--active {
  background: #fdc704;
  color: white;
}

.sort-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.sort-select {
  height: 36px;
  padding: 0 32px 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  appearance: none;
  outline: none;
  color: #1a1a2e;
}

.sort-icon {
  position: absolute;
  right: 10px;
  pointer-events: none;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: #9ca3af;
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.media-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.media-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.media-preview {
  height: 160px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.2s;
}

.media-card:hover .play-overlay {
  opacity: 1;
}

.preview-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.6);
  color: white;
}

.preview-icon {
  opacity: 0.9;
}

.preview-type-label {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Media Info */
.media-info {
  padding: 14px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.media-name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.info-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.media-type-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
  white-space: nowrap;
}

.media-type-badge--image {
  background: #e6f7f4;
  color: #fdc704;
}

.media-type-badge--video {
  background: #ede9fe;
  color: #8b5cf6;
}

.media-type-badge--html {
  background: #fef3c7;
  color: #f59e0b;
}

.media-type-badge--pdf {
  background: #fee2e2;
  color: #ef4444;
}

.media-customer {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* Responsive */
@media (max-width: 1400px) {
  .media-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .media-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .media-page {
    padding: 20px;
  }
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-wrapper {
    flex: 1;
  }
  .type-pills {
    overflow-x: auto;
  }
}
</style>