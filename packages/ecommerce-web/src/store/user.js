/**
 * 用户状态管理Store
 * 使用Pinia管理用户登录状态：
 * - token: JWT令牌（持久化到localStorage）
 * - userInfo: 用户信息
 * 核心方法：
 * - setToken: 设置token并持久化
 * - clearToken: 清除token和用户信息
 * - fetchUserInfo: 获取用户信息
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const TOKEN_KEY = 'ecommerce_web_token'
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')

  function setToken(newToken) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  function clearToken() {
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    userInfo.value = null
  }

  async function fetchUserInfo() {
    if (!token.value) return
    try {
      userInfo.value = await getUserInfo()
    } catch {
      clearToken()
    }
  }

  return { userInfo, token, setToken, clearToken, fetchUserInfo }
})
