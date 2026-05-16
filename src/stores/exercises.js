import { defineStore } from 'pinia'
import { ref } from 'vue'
import { exercisesApi } from '../api/services'

export const useExercisesStore = defineStore('exercises', () => {
  const exercises = ref([])
  const currentExercise = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const res = await exercisesApi.list()
      exercises.value = res.data.data || res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    const res = await exercisesApi.get(id)
    currentExercise.value = res.data.data || res.data
    return currentExercise.value
  }

  async function create(data) {
    const res = await exercisesApi.create(data)
    const created = res.data.data || res.data
    exercises.value.unshift(created)
    return created
  }

  async function update(id, data) {
    const res = await exercisesApi.update(id, data)
    const updated = res.data.data || res.data
    const idx = exercises.value.findIndex(e => e.id === id)
    if (idx !== -1) exercises.value[idx] = updated
    return updated
  }

  async function remove(id) {
    await exercisesApi.delete(id)
    exercises.value = exercises.value.filter(e => e.id !== id)
  }

  return { exercises, currentExercise, loading, fetchAll, fetchOne, create, update, remove }
})
