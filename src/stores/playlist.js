import { defineStore } from "pinia";
import { playlists as mockPlaylists } from "../data/mockData.js";
import { useAppStore } from "@/stores/app";

const STORAGE_KEY = 'adsignage_playlists';

export const usePlaylistStore = defineStore("playlist", {
  state: () => ({
    playlistItems: [],
    loading: false,
  }),

  getters: {
    getAll: (state) => state.playlistItems,
    getById: (state) => (id) => state.playlistItems.find((item) => item.id === id),
  },

  actions: {
    async fetchPlaylists() {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const saved = localStorage.getItem(STORAGE_KEY);
        
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            this.playlistItems = Array.isArray(parsed) ? parsed : (mockPlaylists || []);
          } catch {
            this.playlistItems = mockPlaylists || [];
          }
        } else {
          this.playlistItems = mockPlaylists || [];
        }
        
        return { success: true,  data:this.playlistItems };
        
      } catch (error) {
        this.playlistItems = mockPlaylists || [];
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    async createPlaylist(playlistData) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const newPlaylist = {
          id: Date.now(),
          name: playlistData.name || 'Untitled',
          customer: playlistData.customer || 'Default',
          items: Array.isArray(playlistData.items) ? playlistData.items : [],
          duration: playlistData.duration || '00:00:00',
          lastEdited: new Date().toLocaleString(),
          date: new Date().toISOString().split('T')[0],
          status: playlistData.status || 'active',
        };

        this.playlistItems.unshift(newPlaylist);
        this._persistToStorage();
        
        return { success: true,  newPlaylist };
        
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    async deletePlaylist(playlistId) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const index = this.playlistItems.findIndex((item) => item.id === playlistId);
        
        if (index === -1) {
          return { success: false, error: 'Not found' };
        }

        const deleted = this.playlistItems.splice(index, 1)[0];
        this._persistToStorage();
        
        return { success: true, data: deleted };
        
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    async updatePlaylist(playlistId, updates) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = this.playlistItems.findIndex((item) => item.id === playlistId);
        if (index === -1) throw new Error('Playlist not found');

        this.playlistItems[index] = { ...this.playlistItems[index], ...updates };
        this._persistToStorage();

        return { success: true,  data: this.playlistItems[index] };
        
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        this.loading = false;
      }
    },

    _persistToStorage() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.playlistItems));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    clearAll() {
      localStorage.removeItem(STORAGE_KEY);
      this.playlistItems = mockPlaylists || [];
      return { success: true };
    },

    // Filter helpers
    setSearchFilter(value) { this.filters.search = value; },
    setTypeFilter(value) { this.filters.type = value; },
    setCustomerFilter(value) { this.filters.customer = value; },
    clearFilters() {
      this.filters.search = null;
      this.filters.type = null;
      this.filters.customer = null;
      this.filters.dateFrom = null;
      this.filters.dateTo = null;
    },
  },
});