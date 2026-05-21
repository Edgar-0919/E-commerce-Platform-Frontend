/**
 * 购物车模块API
 * 提供购物车增删改查接口
 */
import request from './request'

/**
 * 获取购物车列表
 * @returns {Promise} 购物车列表
 */
export function getCartList() {
  return request.get('/cart')
}

export function addToCart(data) {
  return request.post('/cart', data)
}

export function updateCartItem(id, data) {
  return request.put(`/cart/${id}`, null, { params: data })
}

export function deleteCartItem(id) {
  return request.delete(`/cart/${id}`)
}
