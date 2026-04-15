import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { media as mockMedia } from '../data/mockData'

export const useMediaStore = defineStore('media', () => {
  // ------- State -------
  const items = ref([...mockMedia])
  const search = ref('')
  const activeType = ref('all')
  const sortBy = ref('latest')
  const viewMode = ref('grid') // 'grid' | 'list'

  // ------- Getters -------
  const filteredItems = computed(() => {
    let result = items.value

    if (activeType.value !== 'all') {
      result = result.filter(item => item.type === activeType.value)
    }

    if (search.value.trim()) {
      const q = search.value.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.customer?.toLowerCase().includes(q)
      )
    }

    if (sortBy.value === 'latest') {
      result = [...result].sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy.value === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.date) - new Date(b.date))
    } else if (sortBy.value === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy.value === 'size') {
      result = [...result].sort((a, b) => {
        const parseSize = s => parseFloat(s) * (s.includes('MB') ? 1024 : 1)
        return parseSize(b.size) - parseSize(a.size)
      })
    }

    return result
  })

  // ------- Actions -------
  function setSearch(val) { search.value = val }
  function setType(val) { activeType.value = val }
  function setSort(val) { sortBy.value = val }
  function setView(val) { viewMode.value = val }

  return {
    items,
    search,
    activeType,
    sortBy,
    viewMode,
    filteredItems,
    setSearch,
    setType,
    setSort,
    setView,
  }
})
