import { createRequest } from '@ecommerce/shared/utils/request.js'

export default createRequest({
  tokenKey: 'ecommerce_web_token',
  loginPath: '/login'
})