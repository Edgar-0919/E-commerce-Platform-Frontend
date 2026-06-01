/**
 * 支付模块 API
 * 支付发起、状态查询、退款申请
 */
import request from './request'

/**
 * 发起支付
 * @param {number} orderId - 订单 ID（后端必须字段，用于创建支付单据和幂等校验）
 * @param {string} orderNo - 订单编号
 * @param {number} amount - 支付金额
 * @param {string} [channel='alipay'] - 支付渠道
 * @returns {Promise<{paymentNo, payUrl}>} 支付信息
 */
export function createPayment(orderId, orderNo, amount, channel = 'alipay') {
  return request.post('/payment/pay', null, { params: { orderId, orderNo, amount, channel } })
}

/**
 * 确认支付（模拟支付成功回调）
 * @param {string} orderNo - 订单编号
 * @returns {Promise}
 */
export function confirmPayment(orderNo) {
  return request.post(`/payment/callback/simulate/${orderNo}`)
}

/**
 * 查询支付状态
 * @param {string} orderNo - 订单编号
 * @returns {Promise<number>} 支付状态码
 */
export function queryPayStatus(orderNo) {
  return request.get(`/payment/${orderNo}`)
}

/**
 * 申请退款
 * @param {Object} data
 * @param {number} data.orderId - 订单 ID
 * @param {number} data.amount - 退款金额
 * @param {string} [data.reason] - 退款原因
 */
export function requestRefund(data) {
  return request.post('/payment/refund', null, { params: data })
}