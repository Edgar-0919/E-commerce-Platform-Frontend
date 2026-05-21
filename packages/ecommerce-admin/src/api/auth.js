import request from './request'

/**
 * 管理员登录
 * @param {string} username
 * @param {string} password
 * @returns {Promise}
 */
export function adminLogin(data) {
  return request.post('/user/login', data)
}

/**
 * 获取当前管理员信息
 * @returns {Promise}
 */
export function getAdminInfo() {
  return request.get('/user/info')
}