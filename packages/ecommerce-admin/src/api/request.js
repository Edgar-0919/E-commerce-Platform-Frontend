import { createRequest } from '@ecommerce/shared/utils/request.js'

export default createRequest({
  tokenKey: 'ecommerce_admin_token',
  loginPath: '/admin/login'
})