import { defineStore } from "pinia";
import { media as mockMedia, mediaStats } from "../data/mockData.js"
import { useAppStore } from "@/stores/app";

export const useMediaStore = defineStore("media", {
  state: () => ({
    mediaItems: [],
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

    uniqueCustomers: (state) => {
      const customers = new Set(state.mediaItems.map((item) => item.customer));
      return Array.from(customers).filter(Boolean);
    },

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
  },

  actions: {
    async fetchMedia() {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.mediaItems = mockMedia;
        return { success: true, data: mockMedia };
      } catch (error) {
        this.mediaItems = [];
        return this.appStore.handleError(error, {
          context: "Error fetching media",
        });
      } finally {
        this.loading = false;
      }
    },

    async uploadMedia(mediaData) {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const newMedia = {
          id: this.mediaItems.length + 1,
          name: mediaData.name,
          type: mediaData.type,
          size: mediaData.size || "0 KB",
          date: new Date().toISOString().split("T")[0],
          customer: mediaData.customer,
          duration: mediaData.duration || null,
          resolution: mediaData.resolution || null,
          gradient:
            mediaData.gradient ||
            "linear-gradient(135deg,#3730a3,#1e3a5f)",
        };

        this.mediaItems.unshift(newMedia);

        return {
          success: true,
          message: "Media uploaded successfully",
          data: newMedia,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error uploading media",
        });
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