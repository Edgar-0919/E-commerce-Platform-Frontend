import request from './request'

export function getDashboardStats() {
  return request.get('/admin/dashboard/stats')
}

export function getDashboardTrend() {
  return request.get('/admin/dashboard/trend')
}

export function getTopProducts() {
  return request.get('/admin/dashboard/top-products')
}

export function getProducts(params) {
  return request.get('/admin/products', { params })
}

export function getProductDetail(id) {
  return request.get(`/admin/products/${id}`)
}

export function createProduct(data) {
  return request.post('/admin/products', data)
}

export function updateProduct(id, data) {
  return request.put(`/admin/products/${id}`, data)
}

export function updateProductStatus(id, status) {
  return request.put(`/admin/products/${id}/status`, null, { params: { status } })
}

export function deleteProduct(id) {
  return request.delete(`/admin/products/${id}`)
}

export function getBrands(params) {
  return request.get('/admin/brands', { params })
}

export function createBrand(data) {
  return request.post('/admin/brands', data)
}

export function updateBrand(id, data) {
  return request.put(`/admin/brands/${id}`, data)
}

export function updateBrandStatus(id, status) {
  return request.put(`/admin/brands/${id}/status`, null, { params: { status } })
}

export function deleteBrand(id) {
  return request.delete(`/admin/brands/${id}`)
}

export function getCategories() {
  return request.get('/admin/categories')
}

export function createCategory(data) {
  return request.post('/admin/categories', data)
}

export function updateCategory(id, data) {
  return request.put(`/admin/categories/${id}`, data)
}

export function deleteCategory(id) {
  return request.delete(`/admin/categories/${id}`)
}

export function getOrders(params) {
  return request.get('/admin/orders', { params })
}

export function getOrderDetail(id) {
  return request.get(`/admin/orders/${id}`)
}

export function shipOrder(id, data) {
  return request.put(`/admin/orders/${id}/ship`, data)
}

export function cancelOrder(id, data) {
  return request.put(`/admin/orders/${id}/cancel`, data)
}

export function getUsers(params) {
  return request.get('/admin/users', { params })
}

export function getUserDetail(id) {
  return request.get(`/admin/users/${id}`)
}

export function updateUserStatus(id, status) {
  return request.put(`/admin/users/${id}/status`, null, { params: { status } })
}

export function assignUserRoles(id, roles) {
  return request.put(`/admin/users/${id}/roles`, { roles })
}

export function getCouponTemplates(params) {
  return request.get('/admin/coupons/templates', { params })
}

export function createCouponTemplate(data) {
  return request.post('/admin/coupons/templates', data)
}

export function updateCouponTemplate(id, data) {
  return request.put(`/admin/coupons/templates/${id}`, data)
}

export function updateTemplateStatus(id, status) {
  return request.put(`/admin/coupons/templates/${id}/status`, { status })
}

export function getPromotions(params) {
  return request.get('/admin/promotions', { params })
}

export function createPromotion(data) {
  return request.post('/admin/promotions', data)
}

export function updatePromotion(id, data) {
  return request.put(`/admin/promotions/${id}`, data)
}

export function updatePromotionStatus(id, status) {
  return request.put(`/admin/promotions/${id}/status`, { status })
}

export function getInventoryList(params) {
  return request.get('/admin/inventory/list', { params })
}

export function adjustInventory(skuId, data) {
  return request.put(`/admin/inventory/${skuId}/adjust`, null, { params: data })
}

export function getInventoryLog(skuId, params) {
  return request.get(`/admin/inventory/log/${skuId}`, { params })
}

export function getRefunds(params) {
  return request.get('/admin/refunds', { params })
}

export function approveRefund(id) {
  return request.put(`/admin/refunds/${id}/approve`)
}

export function rejectRefund(id) {
  return request.put(`/admin/refunds/${id}/reject`)
}