import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { patientsApi, treatmentsApi } from '../api/services'

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref([])
  const currentPatient = ref(null)
  const patientTreatments = ref([])
  const loading = ref(false)
  const pagination = reactive({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  })

  async function fetchAll(params = {}) {
    loading.value = true
    try {
      const res = await patientsApi.list(params)
      const data = res.data
      if (data.data) {
        patients.value = data.data
        pagination.currentPage = data.current_page || 1
        pagination.lastPage = data.last_page || 1
        pagination.total = data.total || 0
        pagination.perPage = data.per_page || 15
      } else {
        patients.value = data
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    const res = await patientsApi.get(id)
    currentPatient.value = res.data
    return currentPatient.value
  }

  async function fetchTreatments(id) {
    const res = await patientsApi.getTreatments(id)
    patientTreatments.value = res.data
    return patientTreatments.value
  }

  async function create(data) {
    const res = await patientsApi.create(data)
    patients.value.unshift(res.data)
    return res.data
  }

  async function createTreatment(patientId, data) {
    const res = await treatmentsApi.create({
      ...data,
      patient_id: patientId
    })
    patientTreatments.value.unshift(res.data.data || res.data)
    return res.data.data || res.data
  }

  async function update(id, data) {
    const res = await patientsApi.update(id, data)
    const idx = patients.value.findIndex(p => p.id === id)
    if (idx !== -1) patients.value[idx] = res.data
    return res.data
  }

  async function remove(id) {
    await patientsApi.delete(id)
    patients.value = patients.value.filter(p => p.id !== id)
  }

  async function toggleActive(id) {
    const res = await patientsApi.toggleActive(id)
    if (currentPatient.value) {
      currentPatient.value.active = res.data.active
    }
    return res.data
  }

  return {
    patients, currentPatient, patientTreatments, loading, pagination,
    fetchAll, fetchOne, fetchTreatments, create, createTreatment, update, remove, toggleActive,
  }
})
