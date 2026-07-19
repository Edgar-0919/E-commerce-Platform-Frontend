/**
 * 用户模块API
 * 提供用户登录、注册、信息管理等接口
 */
import request from './request'

/**
 * 用户登录
 * @param {Object} data - 登录参数
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise} 登录结果
 */
export function login(data) {
  return request.post('/user/login', data)
}

export function register(data) {
  return request.post('/user/register', data)
}

export function getUserInfo() {
  return request.get('/user/info')
}

export function updateUserInfo(data) {
  return request.put('/user/info', data)
}

export function getAddressList() {
  return request.get('/user/address')
}

export function addAddress(data) {
  return request.post('/user/address', data)
}

export function updateAddress(id, data) {
  return request.put(`/user/address/${id}`, data)
}

export function deleteAddress(id) {
  return request.delete(`/user/address/${id}`)
}

export function submitMerchantApplication(data) {
  return request.post('/user/merchant-application', data)
}

export function getMerchantApplicationStatus() {
  return request.get('/user/merchant-application')
}
