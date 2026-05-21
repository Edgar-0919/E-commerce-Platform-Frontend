import axios from 'axios'
import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'ecommerce_admin_token'

const instance = axios.create({
  baseURL: '/api',
  timeout: 15000
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 200) return data
    if (code === 401) {
      localStorage.removeItem(TOKEN_KEY)
      import('vue-router').then(({ default: router }) => {
        router.push('/admin/login')
      }).catch(() => {
        window.location.href = '/admin/login'
      })
      return Promise.reject(new Error(message || '未授权'))
    }
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    ElMessage.error('网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default instance