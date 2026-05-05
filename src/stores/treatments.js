import { defineStore } from 'pinia'
import { ref } from 'vue'
import { treatmentsApi, treatmentItemsApi } from '../api/services'

export const useTreatmentsStore = defineStore('treatments', () => {
  const treatments = ref([])
  const currentTreatment = ref(null)
  const items = ref([])
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const res = await treatmentsApi.list()
      treatments.value = res.data.data || res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    const res = await treatmentsApi.get(id)
    currentTreatment.value = res.data.data || res.data
    return currentTreatment.value
  }

  async function create(data) {
    const res = await treatmentsApi.create(data)
    treatments.value.unshift(res.data.data || res.data)
    return res.data.data || res.data
  }

  async function update(id, data) {
    const res = await treatmentsApi.update(id, data)
    const updated = res.data.data || res.data
    const idx = treatments.value.findIndex(t => t.id === id)
    if (idx !== -1) treatments.value[idx] = updated
    return updated
  }

  async function remove(id) {
    await treatmentsApi.delete(id)
    treatments.value = treatments.value.filter(t => t.id !== id)
  }

  async function fetchItems(treatmentId) {
    const res = await treatmentItemsApi.list(treatmentId)
    items.value = res.data
    return items.value
  }

  async function createItem(treatmentId, data) {
    const res = await treatmentItemsApi.create(treatmentId, data)
    items.value.push(res.data)
    return res.data
  }

  async function updateItem(id, data) {
    const res = await treatmentItemsApi.update(id, data)
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value[idx] = res.data
    return res.data
  }

  async function removeItem(id) {
    await treatmentItemsApi.delete(id)
    items.value = items.value.filter(i => i.id !== id)
  }

  return {
    treatments, currentTreatment, items, loading,
    fetchAll, fetchOne, create, update, remove,
    fetchItems, createItem, updateItem, removeItem
  }
})
