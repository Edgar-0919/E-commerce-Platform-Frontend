/**
 * 商品模块API
 * 提供商品查询、详情获取、分类等接口
 */
import request from './request'

/**
 * 分页查询商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {number} [params.categoryId] - 分类ID
 * @param {string} [params.keyword] - 关键词
 * @returns {Promise} 商品列表
 */
export function getProductPage(params) {
  return request.get('/product/page', { params })
}

export function getProductDetail(id) {
  return request.get(`/product/${id}`)
}

export function getCategoryTree() {
  return request.get('/product/category/tree')
}

export function getSkuDetail(id) {
  return request.get(`/product/sku/${id}`)
}
