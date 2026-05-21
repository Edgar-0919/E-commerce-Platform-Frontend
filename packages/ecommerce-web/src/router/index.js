import { createRouter, createWebHistory } from 'vue-router'
import WebLayout from '@/layout/WebLayout.vue'
import { useUserStore } from '@/store/user'

const TOKEN_KEY = 'ecommerce_web_token'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '首页', requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/User/Login.vue'),
    meta: { title: '登录', requiresAuth: false, layout: 'none' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/User/Register.vue'),
    meta: { title: '注册', requiresAuth: false, layout: 'none' }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/Goods/ProductDetail.vue'),
    meta: { title: '商品详情', requiresAuth: false }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Order/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true }
  },
  {
    path: '/order',
    name: 'OrderList',
    component: () => import('@/views/Order/OrderList.vue'),
    meta: { title: '我的订单', requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/Order/OrderDetail.vue'),
    meta: { title: '订单详情', requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Order/Checkout.vue'),
    meta: { title: '确认订单', requiresAuth: true }
  },
  {
    path: '/payment/result',
    name: 'PaymentResult',
    component: () => import('@/views/Order/PaymentResult.vue'),
    meta: { title: '支付结果', requiresAuth: true }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/User/UserCenter.vue'),
    meta: { title: '个人中心', requiresAuth: true }
  },
  {
    path: '/user/coupons',
    name: 'UserCoupons',
    component: () => import('@/views/User/UserCoupons.vue'),
    meta: { title: '我的优惠券', requiresAuth: true }
  },
  {
    path: '/user/points',
    name: 'UserPoints',
    component: () => import('@/views/User/UserPoints.vue'),
    meta: { title: '积分明细', requiresAuth: true }
  },
  {
    path: '/search',
    name: 'SearchResult',
    component: () => import('@/views/Goods/SearchResult.vue'),
    meta: { title: '商品搜索', requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404', requiresAuth: false }
  }
]

const embedInLayout = (routes, layout) =>
  routes.map(route => {
    if (route.meta?.layout === 'none') return route
    return {
      path: route.path,
      component: layout,
      children: [{ ...route, path: '' }]
    }
  })

const router = createRouter({
  history: createWebHistory(),
  routes: embedInLayout(routes, WebLayout),
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const userStore = useUserStore()
  document.title = `${to.meta.title || ''} - 小羊电商`

  const requiresAuth = to.matched.some(r => r.meta.requiresAuth)

  if (!requiresAuth) return next()

  if (!token) {
    return next('/login')
  }

  next()
})

router.afterEach(() => window.scrollTo(0, 0))

export default router