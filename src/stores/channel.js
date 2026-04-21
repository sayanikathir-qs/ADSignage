import { defineStore } from "pinia";
import { channels as mockChannels, channelStats } from "../data/mockData.js"
import { useAppStore } from "@/stores/app";

export const useChannelStore = defineStore("channel", {
  state: () => ({
    channelItems: [],
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
      return state.channelItems.map((item) => ({
        ...item,
        typeLabel: item.type?.charAt(0).toUpperCase() + item.type?.slice(1),
        sizeFormatted: item.size,
        dateFormatted: item.date,
      }));
    },

    filteredMedia: (state) => {
      let filtered = [...state.channelItems];

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
      state.channelItems.find((item) => item.id === id),

    getStats: (state) => state.stats,

    appStore: () => useAppStore(),

    uniqueCustomers: (state) => {
      const customers = new Set(state.channelItems.map((item) => item.customer));
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

      state.channelItems.forEach((item) => {
        if (counts.hasOwnProperty(item.type)) {
          counts[item.type]++;
        }
      });

      return counts;
    },
  },

  actions: {
    async fetchChannels() {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        this.channelItems = mockChannels;
        return { success: true, data: mockChannels };
      } catch (error) {
        this.channelItems = [];
        return this.appStore.handleError(error, {
          context: "Error fetching channels",
        });
      } finally {
        this.loading = false;
      }
    },

    async createChannel(channelData) {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const newChannel = {
          id: this.channelItems.length + 1,
          name: channelData.name,
          type: channelData.type,
          size: channelData.size || "0 KB",
          date: new Date().toISOString().split("T")[0],
          customer: mediaData.customer,
          duration: mediaData.duration || null,
          resolution: mediaData.resolution || null,
          gradient:
            mediaData.gradient ||
            "linear-gradient(135deg,#3730a3,#1e3a5f)",
        };

        this.channelItems.unshift(newChannel);

        return {
          success: true,
          message: "Channel created successfully",
          data: newChannel,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error creating channel",
        });
      } finally {
        this.loading = false;
      }
    },

    async deleteChannel(channelId) {
      this.loading = true;

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = this.channelItems.findIndex((item) => item.id === channelId);

        if (index !== -1) {
          const deleted = this.channelItems.splice(index, 1)[0];

          return {
            success: true,
            message: `Channel "${deleted.name}" deleted successfully`,
            data: deleted,
          };
        }

        return { success: false, error: "Channel not found" };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error deleting channel",
        });
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        this.stats = channelStats;
        return { success: true, data: channelStats };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error fetching channel stats",
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