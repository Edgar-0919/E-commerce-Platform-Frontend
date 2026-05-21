/**
 * 营销模块 API (C 端)
 * 优惠券领取、积分查询、促销活动
 */
import request from './request'

/**
 * 获取可用优惠券列表
 * @returns {Promise<Array>} 优惠券模板列表
 */
export function getAvailableCoupons() {
  return request.get('/marketing/coupon/page')
}

/**
 * 领取优惠券
 * @param {number} templateId - 优惠券模板 ID
 */
export function receiveCoupon(templateId) {
  return request.post(`/marketing/coupon/receive/${templateId}`)
}

/**
 * 我的优惠券
 * @param {number} [status] - 优惠券状态筛选
 * @returns {Promise<Array>}
 */
export function getMyCoupons(status) {
  return request.get('/marketing/coupon/my', { params: { status } })
}

/**
 * 我的积分
 * @returns {Promise<Object>} UserPoints
 */
export function getMyPoints() {
  return request.get('/marketing/points')
}

/**
 * 促销活动列表
 * @param {string} type - 活动类型
 * @returns {Promise<Array>}
 */
export function getPromotions(type) {
  return request.get(`/marketing/promotion/${type}`)
}