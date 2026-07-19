<template>
  <div class="user-center">
    <template v-if="loading">
      <div class="user-banner-skeleton">
        <div class="avatar-skeleton"><el-skeleton-item variant="circle" style="width:72px;height:72px" /></div>
        <div style="flex:1"><el-skeleton-item variant="text" style="width:120px;height:28px" /><el-skeleton-item variant="text" style="width:180px" /></div>
      </div>
      <div class="section-skeleton"><el-skeleton :rows="6" animated /></div>
    </template>

    <template v-else-if="error">
      <ErrorState @retry="loadUserInfo" />
    </template>

    <template v-else>
      <div class="user-banner">
        <div class="banner-top">
          <div class="avatar-circle">
            <User class="avatar-icon" />
          </div>
          <div class="banner-info">
            <h2>{{ userInfo.nickname || userInfo.username || '用户' }}</h2>
            <p class="member-level">普通会员</p>
          </div>
        </div>
      </div>

      <div class="menu-card">
        <div class="card-header">
          <h3>我的订单</h3>
          <span class="card-more" @click="goToOrders">全部订单 <ArrowRight /></span>
        </div>
        <div class="order-icons">
          <div class="icon-item" @click="goToOrder('pending')">
            <div class="icon-circle">
              <ShoppingCart />
            </div>
            <span>待付款</span>
          </div>
          <div class="icon-item" @click="goToOrder('paid')">
            <div class="icon-circle">
              <Box />
            </div>
            <span>待发货</span>
          </div>
          <div class="icon-item">
            <div class="icon-circle">
              <Star />
            </div>
            <span>待评价</span>
          </div>
          <div class="icon-item">
            <div class="icon-circle">
              <Refresh />
            </div>
            <span>退换/售后</span>
          </div>
        </div>
      </div>

      <div class="menu-card">
        <div class="menu-list">
          <div class="menu-item" @click="goToAddress">
            <MapLocation class="menu-icon" />
            <span>收货地址</span>
            <ArrowRight class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goToCoupons">
            <Ticket class="menu-icon" />
            <span>优惠券</span>
            <span class="menu-badge"></span>
            <ArrowRight class="menu-arrow" />
          </div>
          <div class="menu-item" @click="goToMerchantApply">
            <OfficeBuilding class="menu-icon" />
            <span>成为商家</span>
            <span v-if="userInfo.merchantApplicationStatus" 
                  class="menu-badge" 
                  :class="getApplicationBadgeClass(userInfo.merchantApplicationStatus)">
              {{ userInfo.merchantApplicationStatusText }}
            </span>
            <ArrowRight class="menu-arrow" />
          </div>
          <div class="menu-item">
            <Setting class="menu-icon" />
            <span>账户设置</span>
            <ArrowRight class="menu-arrow" />
          </div>
          <div class="menu-item menu-logout" @click="handleLogout">
            <Back class="menu-icon" />
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User, ShoppingCart, Box, Star, Refresh,
  MapLocation, Ticket, Setting, Back, ArrowRight, OfficeBuilding
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { getUserInfo } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ErrorState } from '@ecommerce/shared'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const error = ref(false)

const userInfo = ref({
  username: '',
  nickname: ''
})

const userStats = ref({
  orders: 5,
  coupons: 3,
  favorites: 12
})



function goToOrder(type) {
  router.push({ path: '/order', query: { status: type } })
}

function goToOrders() {
  router.push('/order')
}

function goToAddress() {
  router.push('/address')
}

function goToCoupons() {
  router.push('/user/coupons')
}

function goToMerchantApply() {
  router.push('/user/merchant-apply')
}

function getApplicationBadgeClass(status) {
  return {
    'badge-warning': status === 0,
    'badge-success': status === 1,
    'badge-danger': status === 2
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    userStore.clearToken()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch {}
}

async function loadUserInfo() {
  loading.value = true
  error.value = false
  try {
    const info = await getUserInfo()
    userInfo.value = info
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-center {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.user-banner-skeleton {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.avatar-skeleton {
  flex-shrink: 0;
}

.section-skeleton {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.user-banner {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 60%, var(--primary-dark) 100%);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl) var(--spacing-lg);
  color: #fff;
  box-shadow: 0 4px 16px rgba(44, 44, 44, 0.12);
}

.banner-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.avatar-circle {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.35);
}

.avatar-icon {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.9);
}

.banner-info h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: 4px;
}

.member-level {
  font-size: var(--font-size-xs);
  opacity: 0.85;
}

.menu-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

.card-header h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card-more {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: color var(--duration-fast);
  white-space: nowrap;
}

.card-more svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.card-more:hover {
  color: var(--primary-color);
}

.order-icons {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md) var(--spacing-sm);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  position: relative;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: background var(--duration-fast);
}

.icon-item:hover {
  background: var(--bg-hover);
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 24px;
  transition: all var(--duration-fast);
}

.icon-item:hover .icon-circle {
  background: var(--primary-bg);
  color: var(--primary-color);
}

.icon-item > span {
  font-size: var(--font-size-xs);
  color: var(--text-primary);
}

.badge {
  position: absolute;
  top: 2px;
  right: 4px;
  background: var(--danger-color);
  color: #fff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
  line-height: 16px;
}

.badge-warning {
  background: var(--warning-color);
}

.badge-success {
  background: var(--success-color);
}

.badge-danger {
  background: var(--danger-color);
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background var(--duration-fast);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-icon {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
  flex-shrink: 0;
}

.menu-item span {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.menu-badge {
  flex: none !important;
  font-size: var(--font-size-xs) !important;
  color: var(--text-light) !important;
  margin-right: var(--spacing-xs);
}

.menu-arrow {
  color: var(--text-placeholder);
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: color var(--duration-fast);
}

.menu-item:hover .menu-arrow {
  color: var(--text-secondary);
}

.menu-logout .menu-icon {
  color: var(--text-light);
}

.menu-logout span {
  color: var(--text-light);
}

.menu-logout:hover {
  background: var(--price-bg);
}

.menu-logout:hover .menu-icon,
.menu-logout:hover span {
  color: var(--danger-color);
}

@media (max-width: 768px) {
  .user-center {
    gap: var(--spacing-xs);
  }

  .user-banner {
    padding: var(--spacing-md);
  }

  .avatar-circle {
    width: 56px;
    height: 56px;
  }

  .avatar-icon {
    font-size: 28px;
  }

  .order-icons {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }
}
</style>