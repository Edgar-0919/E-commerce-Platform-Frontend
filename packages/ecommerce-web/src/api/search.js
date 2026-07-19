import request from './request'

/**
 * 商品搜索 — 基于 MySQL LIKE 查询（替代 ES 全文搜索）
 * @param {Object} params - 搜索参数
 * @param {string} [params.keyword] - 关键词
 * @param {number} [params.categoryId] - 分类 ID
 * @param {number} [params.minPrice] - 最低价格
 * @param {number} [params.maxPrice] - 最高价格
 * @param {string} [params.sortBy] - 排序方式
 * @param {number} [params.page] - 页码，默认 1
 * @param {number} [params.size] - 每页数量，默认 20
 */
export function searchProducts(params) {
  return request.get('/product/search', { params })
}