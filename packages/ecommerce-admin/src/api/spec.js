import request from './request'

export function listSpecGroups(categoryId) {
  const params = categoryId ? { categoryId } : {}
  return request.get('/admin/spec/groups', { params })
}

export function saveSpecGroup(data) {
  return request.post('/admin/spec/groups', data)
}

export function updateSpecGroup(id, data) {
  return request.put(`/admin/spec/groups/${id}`, data)
}

export function deleteSpecGroup(id) {
  return request.delete(`/admin/spec/groups/${id}`)
}

export function listSpecParams(groupId) {
  const params = groupId ? { groupId } : {}
  return request.get('/admin/spec/params', { params })
}

export function saveSpecParam(data) {
  return request.post('/admin/spec/params', data)
}

export function updateSpecParam(id, data) {
  return request.put(`/admin/spec/params/${id}`, data)
}

export function deleteSpecParam(id) {
  return request.delete(`/admin/spec/params/${id}`)
}