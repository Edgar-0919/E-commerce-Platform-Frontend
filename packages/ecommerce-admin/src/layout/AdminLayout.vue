<template>
  <el-container class="admin-layout">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-sidebar">
      <div class="sidebar-logo" @click="$router.push('/admin/dashboard')">
        <span v-if="!isCollapse">小羊电商管理后台</span>
        <span v-else class="logo-collapsed">小羊</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        :collapse="isCollapse"
        background-color="#212529"
        text-color="#8D9096"
        active-text-color="#C9A96E"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Monitor /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-sub-menu index="product-group">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/products">商品列表</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/admin/categories">分类管理</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/admin/spec">规格管理</el-menu-item>
          <el-menu-item index="/admin/inventory">库存管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/admin/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/refunds">
          <el-icon><Money /></el-icon>
          <span>退款管理</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item v-if="isAdmin" index="/admin/merchants">
          <el-icon><OfficeBuilding /></el-icon>
          <span>商户管理</span>
        </el-menu-item>
        <el-sub-menu index="marketing-group">
          <template #title>
            <el-icon><Present /></el-icon>
            <span>营销管理</span>
          </template>
          <el-menu-item index="/admin/coupons">优惠券模板</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <div class="header-left">
          <el-button :icon="isCollapse ? Expand : Fold" text @click="isCollapse = !isCollapse" />
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" />
              <span class="username">{{ adminStore.adminInfo?.username || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/store/admin'
import { Monitor, Goods, Document, User, Present, Expand, Fold, ArrowDown, SwitchButton, Money, OfficeBuilding } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const isCollapse = ref(false)

const isAdmin = computed(() => {
  const roles = adminStore.adminInfo?.roles || []
  return roles.includes('ROLE_ADMIN')
})

const activeMenu = computed(() => {
  const p = route.path
  if (p.startsWith('/admin/products')) return '/admin/products'
  if (p.startsWith('/admin/categories')) return '/admin/categories'
  if (p.startsWith('/admin/inventory')) return '/admin/inventory'
  if (p.startsWith('/admin/orders')) return '/admin/orders'
  if (p.startsWith('/admin/refunds')) return '/admin/refunds'
  if (p.startsWith('/admin/users')) return '/admin/users'
  if (p.startsWith('/admin/coupons')) return '/admin/coupons'
  if (p.startsWith('/admin/promotions')) return '/admin/promotions'
  if (p.startsWith('/admin/merchants')) return '/admin/merchants'
  return p
})

function handleLogout() {
  adminStore.clearToken()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout { height: 100vh; overflow: hidden; }
.admin-sidebar { background-color: #212529; overflow: hidden; transition: width 0.3s; display: flex; flex-direction: column; }
.sidebar-logo { height: 60px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.1); white-space: nowrap; overflow: hidden; }
.logo-collapsed { font-size: 14px; }
.admin-sidebar .el-menu { border-right: none; flex: 1; overflow-y: auto; overflow-x: hidden; }
.admin-header { display: flex; align-items: center; justify-content: space-between; background: var(--bg-white); border-bottom: 1px solid var(--border-color); padding: 0 20px; }
.header-left, .header-right { display: flex; align-items: center; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text-primary); }
.username { font-size: 14px; }
.admin-main { background-color: var(--bg-page); padding: 20px; overflow-y: auto; height: calc(100vh - 60px); }
</style>