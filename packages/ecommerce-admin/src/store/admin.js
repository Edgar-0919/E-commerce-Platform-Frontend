import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getAdminInfo } from '@/api/auth'

export const useAdminStore = defineStore('admin', () => {
  const adminInfo = ref(null)
  const TOKEN_KEY = 'ecommerce_admin_token'
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')

  const isLoggedIn = computed(() => !!token.value)
  const isSuperAdmin = computed(() =>
    adminInfo.value?.roles?.includes('ROLE_ADMIN')
  )

  function setToken(t) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  function clearToken() {
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    adminInfo.value = null
  }

  async function fetchAdminInfo() {
    if (!token.value) return
    try {
      adminInfo.value = await getAdminInfo()
    } catch {
      clearToken()
    }
  }

  return { adminInfo, token, isLoggedIn, isSuperAdmin, setToken, clearToken, fetchAdminInfo }
})