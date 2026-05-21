/**
 * 支付模块 API
 * 支付发起、状态查询、退款申请
 */
import request from './request'

/**
 * 发起支付
 * @param {Object} data
 * @param {number} data.orderId - 订单 ID
 * @param {string} data.orderNo - 订单编号
 * @param {number} data.amount - 支付金额
 * @param {string} [data.channel='alipay'] - 支付渠道
 * @returns {Promise<string>} paymentNo
 */
export function createPayment(data) {
  return request.post('/payment/pay', null, { params: data })
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