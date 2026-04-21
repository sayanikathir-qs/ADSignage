import { defineStore } from "pinia";
import { mockPlaylist, mockPlaylistStats } from "../data/mockData.js"
import { useAppStore } from "@/stores/app";

export const usePlaylistStore = defineStore("playlist", {
  state: () => ({
    playlistItems: [],
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
    formattedPlaylists: (state) => {
      return state.playlistItems.map((item) => ({
        ...item,
        typeLabel: item.type?.charAt(0).toUpperCase() + item.type?.slice(1),
        sizeFormatted: item.size,
        dateFormatted: item.date,
      }));
    },

    filteredPlaylists: (state) => {
      let filtered = [...state.playlistItems];

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
      state.playlistItems.find((item) => item.id === id),

    getStats: (state) => state.stats,

    appStore: () => useAppStore(),

    uniqueCustomers: (state) => {
      const customers = new Set(state.playlistItems.map((item) => item.customer));
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

      state.playlistItems.forEach((item) => {
        if (counts.hasOwnProperty(item.type)) {
          counts[item.type]++;
        }
      });

      return counts;
    },
  },

  actions: {
    async fetchPlaylists() {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.playlistItems = mockPlaylist;
        return { success: true, data: mockPlaylist };
      } catch (error) {
        this.playlistItems = [];
        return this.appStore.handleError(error, {
          context: "Error fetching playlist",
        });
      } finally {
        this.loading = false;
      }
    },

    async createPlaylist(playlistData) {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const newMedia = {
          id: this.mediaItems.length + 1,
          name: playlistData.name,
          type: playlistData.type,
          size: playlistData.size || "0 KB",
          date: new Date().toISOString().split("T")[0],
          customer: playlistData.customer,
          duration: playlistData.duration || null,
          resolution: playlistData.resolution || null,
          gradient:
            playlistData.gradient ||
            "linear-gradient(135deg,#3730a3,#1e3a5f)",
        };

        this.playlistItems.unshift(newPlaylist);

        return {
          success: true,
          message: "Playlist created successfully",
          data: newPlaylist,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error creating playlist",
        });
      } finally {
        this.loading = false;
      }
    },

    async deletePlaylist(playlistId) {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = this.playlistItems.findIndex((item) => item.id === playlistId);

        if (index !== -1) {
          const deleted = this.playlistItems.splice(index, 1)[0];

          return {
            success: true,
            message: `Playlist "${deleted.name}" deleted successfully`,
            data: deleted,
          };
        }

        return { success: false, error: "Playlist not found" };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error deleting playlist",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        this.stats = mockPlaylistStats;
        return { success: true, data: mockPlaylistStats };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error fetching playlist stats",
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