import axios from 'axios'
import { ElMessage } from 'element-plus'

/**
 * 创建 Axios 请求实例
 * @param {Object} options
 * @param {string} options.tokenKey - localStorage 中存储 token 的 key
 * @param {string} options.loginPath - 401 跳转的登录页路径
 * @returns {import('axios').AxiosInstance}
 */
export function createRequest({ tokenKey, loginPath }) {
  const request = axios.create({
    baseURL: '/api',
    timeout: 15000
  })

  request.interceptors.request.use(config => {
    const token = localStorage.getItem(tokenKey)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  request.interceptors.response.use(
    response => {
      const res = response.data
      // 兼容 Result<T> 包装：直接返回 data 字段，方便调用方 .then(data => ...)
      if (res && typeof res === 'object' && 'code' in res) {
        if (res.code === 200) {
          return res.data
        }
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      return res
    },
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem(tokenKey)
        window.location.href = loginPath
      }
      ElMessage.error(error.message || '网络错误')
      return Promise.reject(error)
    }
  )

  return request
}