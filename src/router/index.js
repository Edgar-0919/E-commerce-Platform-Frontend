import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', showHeader: true, showFooter: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', showHeader: false, showFooter: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', showHeader: false, showFooter: false }
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue'),
    meta: { title: '商品详情', showHeader: true, showFooter: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true, showHeader: true, showFooter: false }
  },
  {
    path: '/order',
    name: 'OrderList',
    component: () => import('@/views/OrderList.vue'),
    meta: { title: '我的订单', requiresAuth: true, showHeader: true, showFooter: false }
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/UserCenter.vue'),
    meta: { title: '个人中心', requiresAuth: true, showHeader: true, showFooter: false }
  },
  {
    path: '/search',
    name: 'SearchResult',
    component: () => import('@/views/SearchResult.vue'),
    meta: { title: '搜索', showHeader: true, showFooter: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面未找到', showHeader: true, showFooter: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.title) {
    document.title = to.meta.title + ' - 小羊电商'
  }

  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
    return
  }

  next()
})

export default router
