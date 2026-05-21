import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layout/AdminLayout.vue'
import { useAdminStore } from '@/store/admin'

const TOKEN_KEY = 'ecommerce_admin_token'

const routes = [
  { path: '/', redirect: '/admin' },
  { path: '/admin', redirect: '/admin/dashboard' },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/b/System/Login.vue'),
    meta: { title: '管理员登录', requiresAuth: false, roles: [], layout: 'none' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/b/Dashboard/index.vue'),
    meta: { title: '仪表盘', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/products',
    name: 'AdminProducts',
    component: () => import('@/views/b/GoodsManage/Products.vue'),
    meta: { title: '商品管理', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/products/create',
    name: 'AdminProductCreate',
    component: () => import('@/views/b/GoodsManage/ProductForm.vue'),
    meta: { title: '新增商品', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/products/:id/edit',
    name: 'AdminProductEdit',
    component: () => import('@/views/b/GoodsManage/ProductForm.vue'),
    meta: { title: '编辑商品', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/brands',
    name: 'AdminBrands',
    component: () => import('@/views/b/GoodsManage/Brands.vue'),
    meta: { title: '品牌管理', requiresAuth: true, roles: ['ROLE_ADMIN'] }
  },
  {
    path: '/admin/categories',
    name: 'AdminCategories',
    component: () => import('@/views/b/GoodsManage/Categories.vue'),
    meta: { title: '分类管理', requiresAuth: true, roles: ['ROLE_ADMIN'] }
  },
  {
    path: '/admin/inventory',
    name: 'AdminInventory',
    component: () => import('@/views/b/GoodsManage/Inventory.vue'),
    meta: { title: '库存管理', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: () => import('@/views/b/OrderManage/index.vue'),
    meta: { title: '订单管理', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/refunds',
    name: 'AdminRefunds',
    component: () => import('@/views/b/OrderManage/Refunds.vue'),
    meta: { title: '退款管理', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/b/UserManage/index.vue'),
    meta: { title: '用户管理', requiresAuth: true, roles: ['ROLE_ADMIN'] }
  },
  {
    path: '/admin/coupons',
    name: 'AdminCoupons',
    component: () => import('@/views/b/System/Coupons.vue'),
    meta: { title: '优惠券管理', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  },
  {
    path: '/admin/promotions',
    name: 'AdminPromotions',
    component: () => import('@/views/b/System/Promotions.vue'),
    meta: { title: '促销管理', requiresAuth: true, roles: ['ROLE_ADMIN', 'ROLE_MERCHANT'] }
  }
]

function embedInLayout(routes, layoutComponent) {
  return routes.map(route => {
    if (route.redirect || route.meta?.layout === 'none') return route
    return {
      ...route,
      component: layoutComponent,
      children: [
        {
          path: '',
          component: route.component,
          meta: route.meta
        }
      ]
    }
  })
}

const wrappedRoutes = embedInLayout(routes, AdminLayout)

const router = createRouter({
  history: createWebHistory('/'),
  routes: wrappedRoutes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (to.meta.requiresAuth) {
    if (!token) {
      next('/admin/login')
      return
    }
    const store = useAdminStore()
    if (!store.adminInfo) {
      store.fetchAdminInfo().then(() => {
        const userRoles = store.adminInfo?.roles || []
        const requiredRoles = to.meta.roles || []
        if (requiredRoles.length > 0 && !requiredRoles.some(r => userRoles.includes(r))) {
          next('/admin/dashboard')
        } else {
          next()
        }
      })
      return
    }
    const userRoles = store.adminInfo?.roles || []
    const requiredRoles = to.meta.roles || []
    if (requiredRoles.length > 0 && !requiredRoles.some(r => userRoles.includes(r))) {
      next('/admin/dashboard')
    } else {
      next()
    }
    return
  }

  if (to.path === '/admin/login' && token) {
    next('/admin/dashboard')
    return
  }

  next()
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} - 管理后台` : '管理后台'
})

export default router