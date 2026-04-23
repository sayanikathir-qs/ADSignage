import { defineStore } from "pinia";
import { media as mockMedia, mediaStats } from "../data/mockData.js"
import { useAppStore } from "@/stores/app";

export const useMediaStore = defineStore("media", {
  state: () => ({
    mediaItems: [],
    folders: [],
    loading: false,
    stats: {
      totalStorage: "2.4 TB",
      totalFiles: "18,429",
      videos: "4,218",
      images: "12,847",
    },
    filters: {
      search: null,
      type: null,
      customer: null,
      dateFrom: null,
      dateTo: null,
    },
  }),

  getters: {
    formattedMedia: (state) => {
      return state.mediaItems.map((item) => ({
        ...item,
        typeLabel: item.type?.charAt(0).toUpperCase() + item.type?.slice(1),
        sizeFormatted: item.size,
        dateFormatted: item.date,
      }));
    },

    filteredMedia: (state) => {
      let filtered = [...state.mediaItems];

      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name?.toLowerCase().includes(searchLower) ||
            item.customer?.toLowerCase().includes(searchLower)
        );
      }

      if (state.filters.type) {
        filtered = filtered.filter((item) => item.type === state.filters.type);
      }

      if (state.filters.customer) {
        filtered = filtered.filter(
          (item) => item.customer === state.filters.customer
        );
      }

      return filtered;
    },

    getById: (state) => (id) =>
      state.mediaItems.find((item) => item.id === id),

    getStats: (state) => state.stats,

    appStore: () => useAppStore(),


    countByType: (state) => {
      const counts = {
        image: 0,
        video: 0,
        html: 0,
        pdf: 0,
        document: 0,
      };

      state.mediaItems.forEach((item) => {
        if (counts.hasOwnProperty(item.type)) {
          counts[item.type]++;
        }
      });

      return counts;
    },

    getFolderItemCount: (state) => (folderId) => {
      return state.mediaItems.filter(item => item.folderId === folderId).length;
    },
  },

  actions: {
    async fetchMedia() {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const saved = localStorage.getItem('adsignage_media');
        this.mediaItems = saved ? JSON.parse(saved) : mockMedia;
        
        return { success: true, data: this.mediaItems };
      } catch (error) {
        this.mediaItems = mockMedia;
        return this.appStore.handleError(error, { context: "Error fetching media" });
      } finally {
        this.loading = false;
      }
    },

    async fetchFolders() {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const saved = localStorage.getItem('adsignage_folders');
        if (saved) {
          this.folders = JSON.parse(saved);
        } else {
          // Initialize with empty folders array
          this.folders = [];
        }
        
        return { success: true, data: this.folders };
      } catch (error) {
        return this.appStore.handleError(error, { context: "Error fetching folders" });
      } finally {
        this.loading = false;
      }
    },

    // Inside useMediaStore actions:
async createFolder(payload) {
  this.loading = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // ✅ Safely handle both string and object payloads
    const rawName = typeof payload === 'object' ? payload.name : payload;
    const parentId = typeof payload === 'object' ? payload.parentId : null;

    const newFolder = {
      id: `folder_${Date.now()}`,
      name: String(rawName || '').trim(), // 🔒 Force string type
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      itemCount: 0,
    };

    this.folders.push(newFolder);
    this.saveFoldersToStorage();

    return { success: true, message: "Folder created successfully", data: newFolder };
  } catch (error) {
    return this.appStore?.handleError(error, { context: "Error creating folder" }) || { success: false, error };
  } finally {
    this.loading = false;
  }
},

    async updateFolder(folderId, updates) {
      this.loading = true;
      try {
        const folder = this.folders.find(f => f.id === folderId);
        if (folder) {
          Object.assign(folder, updates);
          this.saveFoldersToStorage();
          return { success: true, message: "Folder updated successfully", data: folder };
        }
        return { success: false, error: "Folder not found" };
      } catch (error) {
        return this.appStore.handleError(error, { context: "Error updating folder" });
      } finally {
        this.loading = false;
      }
    },

    async deleteFolder(folderId) {
  this.loading = true;
  try {
    // 1️⃣ Get all descendant folder IDs (recursive)
    const getDescendantIds = (id) => {
      const children = this.folders.filter(f => f.parentId === id);
      return [id, ...children.flatMap(child => getDescendantIds(child.id))];
    };
    const idsToDelete = getDescendantIds(folderId);

    // 2️⃣ Remove all media items in any of these folders
    this.mediaItems = this.mediaItems.filter(item => 
      !idsToDelete.includes(item.folderId)
    );

    // 3️⃣ Remove all folders (including subfolders)
    this.folders = this.folders.filter(f => !idsToDelete.includes(f.id));

    // 4️️ Persist changes
    this.saveMediaToStorage();
    this.saveFoldersToStorage();

    // 5️⃣ If current folder was deleted, navigate up
    if (idsToDelete.includes(this.currentFolderId)) {
      // Navigate to parent or root
      const parentFolder = this.folders.find(f => f.id === this.folders.find(f => f.id === folderId)?.parentId);
      this.currentFolderId = parentFolder?.id || null;
    }

    return { success: true, message: "Folder and contents deleted successfully" };
  } catch (error) {
    return this.appStore.handleError(error, { context: "Error deleting folder" });
  } finally {
    this.loading = false;
  }
},

    async uploadMedia(mediaData) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const newMedia = {
          id: Date.now(),
          name: mediaData.name,
          type: mediaData.type,
          size: mediaData.size || "0 KB",
          date: new Date().toISOString().split("T")[0],
          customer: mediaData.customer,
          folderId: mediaData.folderId || null,
          duration: mediaData.duration || null,
          resolution: mediaData.resolution || null,
          gradient: mediaData.gradient || "linear-gradient(135deg,#3730a3,#1e3a5f)",
          url: mediaData.url || null,
        };

        this.mediaItems.unshift(newMedia);
        this.saveMediaToStorage();

        return { success: true, message: "Media uploaded successfully", data: newMedia };
      } catch (error) {
        return this.appStore.handleError(error, { context: "Error uploading media" });
      } finally {
        this.loading = false;
      }
    },

    async deleteMedia(mediaId) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = this.mediaItems.findIndex((item) => item.id === mediaId);

        if (index !== -1) {
          const deleted = this.mediaItems.splice(index, 1)[0];
          this.saveMediaToStorage();

          return {
            success: true,
            message: `Media "${deleted.name}" deleted successfully`,
            data: deleted,
          };
        }

        return { success: false, error: "Media not found" };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error deleting media",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        this.stats = mediaStats;
        return { success: true, data: mediaStats };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error fetching media stats",
        });
      }
    },

    saveMediaToStorage() {
      try {
        localStorage.setItem('adsignage_media', JSON.stringify(this.mediaItems));
      } catch {
        // quota exceeded (e.g. large data URLs) — items still live in memory
      }
    },

    saveFoldersToStorage() {
      localStorage.setItem('adsignage_folders', JSON.stringify(this.folders));
    },

    setSearchFilter(value) {
      this.filters.search = value;
    },

    setTypeFilter(value) {
      this.filters.type = value;
    },

    setCustomerFilter(value) {
      this.filters.customer = value;
    },

    clearFilters() {
      this.filters.search = null;
      this.filters.type = null;
      this.filters.customer = null;
      this.filters.dateFrom = null;
      this.filters.dateTo = null;
    },

    clearTextFilters() {
      this.filters.search = null;
    },
  },
});