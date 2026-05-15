/**
 * HTTP请求封装
 * 基于axios的二次封装，提供统一的请求拦截和响应处理
 * 功能特性：
 * 1. 自动添加JWT Token到请求头
 * 2. 统一响应格式处理
 * 3. Token过期自动跳转登录页
 * 4. 全局错误提示
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: '/api',
  timeout: 15000
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

instance.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 200) {
      return data
    }
    if (code === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
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
