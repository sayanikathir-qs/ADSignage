import { defineStore } from "pinia";
import { screens as mockScreens, screenGroups as mockGroups } from "../data/mockData.js";
import { useAppStore } from "@/stores/app";

export const useScreensStore = defineStore("screens", {
  state: () => ({
    screens: [],
    groups: [],
    loading: false,
    filters: {
      search: null,
      status: null,
      type: null,
      groupId: null,
    },
  }),

  getters: {
    formattedScreens: (state) => {
      return state.screens.map((item) => ({
        ...item,
        statusLabel: item.status?.charAt(0).toUpperCase() + item.status?.slice(1),
        offlineAtFormatted: item.offlineAt || "N/A",
        groupName: state.groups.find((g) => g.id === item.groupId)?.name || "Ungrouped",
      }));
    },

    filteredScreens: (state) => {
      let filtered = [...state.screens];

      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.name?.toLowerCase().includes(searchLower) ||
            item.type?.toLowerCase().includes(searchLower) ||
            item.channel?.toLowerCase().includes(searchLower) ||
            item.pairingCode?.toLowerCase().includes(searchLower)
        );
      }

      if (state.filters.status) {
        filtered = filtered.filter((item) => item.status === state.filters.status);
      }

      if (state.filters.type) {
        filtered = filtered.filter((item) => item.type === state.filters.type);
      }

      if (state.filters.groupId !== null && state.filters.groupId !== undefined) {
        filtered = filtered.filter((item) => item.groupId === state.filters.groupId);
      }

      return filtered;
    },

    ungroupedScreens: (state) =>
      state.screens.filter((screen) => !screen.groupId),

    groupedScreens: (state) =>
      state.screens.filter((screen) => screen.groupId),

    getScreensByGroup: (state) => (groupId) =>
      state.screens.filter((screen) => screen.groupId === groupId),

    getById: (state) => (id) =>
      state.screens.find((item) => item.id === id),

    getGroupById: (state) => (id) =>
      state.groups.find((group) => group.id === id),

    onlineScreens: (state) =>
      state.screens.filter((screen) => screen.status === "online"),

    offlineScreens: (state) =>
      state.screens.filter((screen) => screen.status === "offline"),

    screensWithChannel: (state) =>
      state.screens.filter((screen) => screen.channel),

    appStore: () => useAppStore(),
  },

  actions: {
    async fetchScreens() {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const savedScreens = localStorage.getItem("adsignage_screens");
        const savedGroups = localStorage.getItem("adsignage_groups");

        this.screens = savedScreens ? JSON.parse(savedScreens) : mockScreens;
        this.groups = savedGroups ? JSON.parse(savedGroups) : mockGroups;

        return { success: true, data: { screens: this.screens, groups: this.groups } };
      } catch (error) {
        this.screens = mockScreens;
        this.groups = mockGroups;
        return this.appStore.handleError(error, {
          context: "Error fetching screens",
        });
      } finally {
        this.loading = false;
      }
    },

    async createScreen(screenData) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const newScreen = {
          id: Date.now(),
          name: screenData.name,
          type: screenData.type || "Web",
          groupId: screenData.groupId || null,
          status: "pending",
          offlineAt: null,
          channel: screenData.channel || null,
          pairingCode: screenData.pairingCode || "",
          freeTrial: screenData.freeTrial || false,
          subscription: screenData.subscription || "",
        };

        this.screens.unshift(newScreen);
        this._saveToStorage();

        return {
          success: true,
          message: "Screen created successfully",
          data: newScreen,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error creating screen",
        });
      } finally {
        this.loading = false;
      }
    },

    async updateScreen(id, updates) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const index = this.screens.findIndex((item) => item.id === id);
        if (index === -1) throw new Error("Screen not found");

        this.screens[index] = { ...this.screens[index], ...updates };
        this._saveToStorage();

        return {
          success: true,
          message: "Screen updated successfully",
          data: this.screens[index],
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error updating screen",
        });
      } finally {
        this.loading = false;
      }
    },

    async deleteScreen(id) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = this.screens.findIndex((item) => item.id === id);
        if (index === -1) throw new Error("Screen not found");

        const deleted = this.screens.splice(index, 1)[0];
        this._saveToStorage();

        return {
          success: true,
          message: `Screen "${deleted.name}" deleted successfully`,
          data: deleted,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error deleting screen",
        });
      } finally {
        this.loading = false;
      }
    },

    async createGroup(groupData) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const newGroup = {
          id: Date.now(),
          name: groupData.name.trim(),
          createdAt: new Date().toISOString(),
        };

        this.groups.push(newGroup);

        // Optionally assign selected screens to this group
        if (groupData.screenIds?.length) {
          groupData.screenIds.forEach((screenId) => {
            this.assignScreenToGroup(screenId, newGroup.id);
          });
        }

        this._saveToStorage();

        return {
          success: true,
          message: "Screen group created successfully",
          data: newGroup,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error creating screen group",
        });
      } finally {
        this.loading = false;
      }
    },

    async updateGroup(id, updates) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));

        const index = this.groups.findIndex((g) => g.id === id);
        if (index === -1) throw new Error("Group not found");

        this.groups[index] = { ...this.groups[index], ...updates };
        this._saveToStorage();

        return {
          success: true,
          message: "Group updated successfully",
          data: this.groups[index],
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error updating group",
        });
      } finally {
        this.loading = false;
      }
    },

    async deleteGroup(id) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const index = this.groups.findIndex((g) => g.id === id);
        if (index === -1) throw new Error("Group not found");

        // Unassign all screens from this group before deleting
        this.screens.forEach((screen) => {
          if (screen.groupId === id) {
            screen.groupId = null;
          }
        });

        const deleted = this.groups.splice(index, 1)[0];
        this._saveToStorage();

        return {
          success: true,
          message: `Group "${deleted.name}" deleted successfully`,
          data: deleted,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error deleting group",
        });
      } finally {
        this.loading = false;
      }
    },

    async assignScreenToGroup(screenId, groupId) {
      try {
        const screen = this.screens.find((s) => s.id === screenId);
        if (!screen) throw new Error("Screen not found");

        const group = this.groups.find((g) => g.id === groupId);
        if (!group) throw new Error("Group not found");

        screen.groupId = groupId;
        this._saveToStorage();

        return {
          success: true,
          message: `Screen "${screen.name}" assigned to "${group.name}"`,
          data: screen,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error assigning screen to group",
        });
      }
    },

    async removeScreenFromGroup(screenId) {
      try {
        const screen = this.screens.find((s) => s.id === screenId);
        if (!screen) throw new Error("Screen not found");

        const oldGroupId = screen.groupId;
        screen.groupId = null;
        this._saveToStorage();

        return {
          success: true,
          message: `Screen "${screen.name}" removed from group`,
          data: screen,
          oldGroupId,
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error removing screen from group",
        });
      }
    },

    async assignChannelToGroup(groupId, channelName) {
      try {
        const group = this.groups.find((g) => g.id === groupId);
        if (!group) throw new Error("Group not found");

        const groupScreens = this.screens.filter((s) => s.groupId === groupId);
        
        groupScreens.forEach((screen) => {
          screen.channel = channelName || null;
        });

        this._saveToStorage();

        return {
          success: true,
          message: `Channel "${channelName || "none"}" assigned to "${group.name}" (${groupScreens.length} screens)`,
          data: { group, updatedScreens: groupScreens },
        };
      } catch (error) {
        return this.appStore.handleError(error, {
          context: "Error assigning channel to group",
        });
      }
    },

    async updateScreenStatus(id, status) {
      const screen = this.screens.find((s) => s.id === id);
      if (!screen) throw new Error("Screen not found");

      screen.status = status;
      if (status === "online") {
        screen.offlineAt = null;
      } else if (status === "offline") {
        screen.offlineAt = new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
      }

      this._saveToStorage();
      return { success: true, data: screen };
    },

    async updateScreenChannel(id, channelName) {
      const screen = this.screens.find((s) => s.id === id);
      if (!screen) throw new Error("Screen not found");

      screen.channel = channelName || null;
      this._saveToStorage();

      return {
        success: true,
        message: channelName 
          ? `Channel "${channelName}" assigned to "${screen.name}"`
          : `Channel removed from "${screen.name}"`,
        data: screen,
      };
    },

    // Private helper to persist state
    _saveToStorage() {
      localStorage.setItem("adsignage_screens", JSON.stringify(this.screens));
      localStorage.setItem("adsignage_groups", JSON.stringify(this.groups));
    },

    // Filter setters
    setSearchFilter(value) {
      this.filters.search = value;
    },

    setStatusFilter(value) {
      this.filters.status = value;
    },

    setTypeFilter(value) {
      this.filters.type = value;
    },

    setGroupFilter(value) {
      this.filters.groupId = value;
    },

    clearFilters() {
      this.filters.search = null;
      this.filters.status = null;
      this.filters.type = null;
      this.filters.groupId = null;
    },
  },
});