import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/services'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)
  const isDoctor = computed(() => !!user.value?.doctor)

  async function login(credentials) {
    const res = await authApi.login(credentials)
    token.value = res.data.token
    if (res.data.user) user.value = res.data.user
    localStorage.setItem('token', token.value)
  }

  async function fetchUser() {
    try {
      const res = await authApi.me()
      user.value = res.data
    } catch {
      logout()
    }
  }

  async function logout() {
    try { await authApi.logout() } catch {}
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isAuthenticated, isDoctor, login, fetchUser, logout }
})
