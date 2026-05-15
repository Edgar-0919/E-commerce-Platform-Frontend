/**
 * 订单模块API
 * 提供订单创建、查询、取消等接口
 */
import request from './request'

/**
 * 创建订单
 * @param {Object} data - 订单参数
 * @param {Array} data.items - 订单项列表
 * @param {string} [data.remark] - 订单备注
 * @returns {Promise} 订单信息
 */
export function createOrder(data) {
  return request.post('/order', data)
}

export function getOrderPage(params) {
  return request.get('/order/page', { params })
}

export function getOrderDetail(id) {
  return request.get(`/order/${id}`)
}

export function cancelOrder(id) {
  return request.put(`/order/${id}/cancel`)
}
