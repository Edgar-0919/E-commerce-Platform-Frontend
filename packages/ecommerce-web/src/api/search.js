import request from './request'

/**
 * 商品搜索
 * @param {Object} params - 搜索参数
 * @param {string} [params.keyword] - 关键词
 * @param {number} [params.categoryId] - 分类 ID
 * @param {number} [params.brandId] - 品牌 ID
 * @param {number} [params.minPrice] - 最低价格
 * @param {number} [params.maxPrice] - 最高价格
 * @param {string} [params.sortField] - 排序字段
 * @param {string} [params.sortOrder] - 排序方向 asc/desc
 * @param {number} [params.page] - 页码
 * @param {number} [params.size] - 每页数量
 */
export function searchProducts(params) {
  return request.get('/search/product', { params })
}

/**
 * 搜索建议（自动补全）
 * @param {string} keyword - 关键词
 * @returns {Promise<string[]>}
 */
export function searchSuggest(keyword) {
  return request.get('/search/suggest', { params: { keyword } })
}

/**
 * 筛选条件聚合
 * @param {string} [keyword] - 关键词
 * @returns {Promise<Object>}
 */
export function searchFilters(keyword) {
  return request.get('/search/filter', { params: { keyword } })
}
