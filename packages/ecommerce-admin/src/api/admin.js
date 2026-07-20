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

export function getCategories() {
  return request.get('/admin/categories')
}

export function getSpecGroups(categoryId) {
  return request.get('/admin/products/spec-groups', { params: { categoryId } })
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

export function deleteCouponTemplate(id) {
  return request.delete(`/admin/coupons/templates/${id}`)
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

export function confirmReturn(id) {
  return request.put(`/admin/refunds/${id}/confirm-return`)
}

export function getMerchants(params) {
  return request.get('/admin/merchants', { params })
}

export function getMerchantDetail(id) {
  return request.get(`/admin/merchants/${id}`)
}

export function createMerchant(data) {
  return request.post('/admin/merchants', data)
}

export function updateMerchant(id, data) {
  return request.put(`/admin/merchants/${id}`, data)
}

export function updateMerchantStatus(id, status) {
  return request.put(`/admin/merchants/${id}/status`, { status })
}

export function getMerchantApplications(params) {
  return request.get('/admin/merchant-applications', { params })
}

export function reviewMerchantApplication(id, data) {
  return request.put(`/admin/merchant-applications/${id}/review`, data)
}