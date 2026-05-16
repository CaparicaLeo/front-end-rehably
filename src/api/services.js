import api from './client'

export const authApi = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/user'),
  register: (data) => api.post('/register', data),
  forgotPassword: (data) => api.post('/forgot-password', data),
  resetPassword: (data) => api.post('/reset-password', data),
}

export const treatmentsApi = {
  list: () => api.get('/treatments'),
  get: (id) => api.get(`/treatments/${id}`),
  create: (data) => api.post('/treatments', data),
  update: (id, data) => api.put(`/treatments/${id}`, data),
  delete: (id) => api.delete(`/treatments/${id}`),
}

export const treatmentItemsApi = {
  list: (treatmentId) => api.get(`/treatments/${treatmentId}/items`),
  get: (id) => api.get(`/treatment-items/${id}`),
  create: (treatmentId, data) => api.post(`/treatments/${treatmentId}/items`, data),
  update: (id, data) => api.put(`/treatment-items/${id}`, data),
  delete: (id) => api.delete(`/treatment-items/${id}`),
}

export const addressApi = {
  list: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
}

export const patientsApi = {
  list: () => api.get('/patients'),
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
  getTreatments: (id) => api.get(`/patients/${id}/treatments`),
}

export const exercisesApi = {
  list: () => api.get('/exercises'),
  get: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
}