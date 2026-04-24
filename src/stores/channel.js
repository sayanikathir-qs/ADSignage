import { defineStore } from "pinia";
import { channels as mockChannels } from "../data/mockData.js";

import { useAppStore } from "@/stores/app";

export const useChannelsStore = defineStore("channels", {
  state: () => ({
    channels: [],
    loading: false,
    filters: {
      search: null,
      status: null,
      customer: null,
    },
  }),

  getters: {
    formattedChannels: (state) => {
      return state.channels.map((item) => ({
        ...item,
        statusLabel: item.status?.charAt(0).toUpperCase() + item.status?.slice(1),
        dateFormatted: item.date || new Date().toISOString().split("T")[0],
      }));
    },

    filteredChannels: (state) => {
      let filtered = [...state.channels];

      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name?.toLowerCase().includes(searchLower) ||
            item.location?.toLowerCase().includes(searchLower) ||
            item.customer?.toLowerCase().includes(searchLower)
        );
      }

      if (state.filters.status) {
        filtered = filtered.filter((item) => item.status === state.filters.status);
      }

      if (state.filters.customer) {
        filtered = filtered.filter((item) => item.customer === state.filters.customer);
      }

      return filtered;
    },

    getById: (state) => (id) =>
      state.channels.find((item) => item.id === id),

    activeChannels: (state) =>
      state.channels.filter((channel) => channel.status === "active"),


    appStore: () => useAppStore(),
  },

  actions: {
    async fetchChannels() {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const saved = localStorage.getItem("adsignage_channels");
        this.channels = saved ? JSON.parse(saved) : mockChannels;

        return { success: true, data: this.channels };
      } catch (error) {
        this.channels = mockChannels;
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
        await new Promise((resolve) => setTimeout(resolve, 600));

        const newChannel = {
    id: Date.now(),
    name: channelData.name,
    url: channelData.url || `https://via.placeholder.com/1920x1080/fdc704/ffffff?text=${encodeURIComponent(channelData.name)}`, // ✅ ADD THIS LINE
    customer: channelData.customer,
    location: channelData.location || "",
    status: channelData.status || "Draft",
    playlistId: channelData.playlistId || null,
    screenId: channelData.screenId || null,
    lastConnected: null,
    date: new Date().toISOString().split("T")[0],
  }

        this.channels.unshift(newChannel);
        this._saveToStorage();

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

    async updateChannel(id, updates) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const index = this.channels.findIndex((item) => item.id === id);
        if (index === -1) throw new Error("Channel not found");

        this.channels[index] = { ...this.channels[index], ...updates };
        this._saveToStorage();

        return {
          success: true,
          message: "Channel updated successfully",
          data: this.channels[index],
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error updating channel",
        });
      } finally {
        this.loading = false;
      }
    },

    async deleteChannel(id) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = this.channels.findIndex((item) => item.id === id);
        if (index === -1) throw new Error("Channel not found");

        const deleted = this.channels.splice(index, 1)[0];
        this._saveToStorage();

        return {
          success: true,
          message: `Channel "${deleted.name}" deleted successfully`,
          data: deleted,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error deleting channel",
        });
      } finally {
        this.loading = false;
      }
    },

    async updateChannelStatus(id, status) {
      const channel = this.channels.find((c) => c.id === id);
      if (!channel) throw new Error("Channel not found");

      channel.status = status;
      if (status === "active") {
        channel.lastConnected = new Date().toISOString();
      }

      this._saveToStorage();
      return { success: true, data: channel };
    },

    // Private helper to persist state
    _saveToStorage() {
      localStorage.setItem("adsignage_channels", JSON.stringify(this.channels));
    },

    setSearchFilter(value) {
      this.filters.search = value;
    },

    setStatusFilter(value) {
      this.filters.status = value;
    },

    setCustomerFilter(value) {
      this.filters.customer = value;
    },

    clearFilters() {
      this.filters.search = null;
      this.filters.status = null;
      this.filters.customer = null;
    },
  },
});