<template>
  <div class="coupons-page">
    <BreadcrumbNav :items="[{ name: '个人中心', path: '/user' }, { name: '我的优惠券' }]" />

    <div class="page-header">
      <h2>我的优惠券</h2>
      <div class="status-tabs">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key; loadCoupons()"
        >
          {{ tab.label }}
        </span>
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="list" :count="3" />
    <ErrorState v-else-if="error" @retry="loadCoupons" />
    <EmptyState
      v-else-if="couponList.length === 0"
      :description="activeTab === 'all' ? '暂无优惠券' : '暂无符合条件的优惠券'"
      actionText="去领券"
      @action="goToHome"
    />

    <div v-else class="coupon-grid">
      <div
        v-for="cp in couponList"
        :key="cp.id"
        class="coupon-card"
        :class="{ used: cp.status === 2, expired: cp.status === 3 }"
      >
        <div class="coupon-left">
          <div class="coupon-value" v-if="cp.discountType === 1">
            <span class="symbol">¥</span>
            <span class="num">{{ cp.discountValue }}</span>
          </div>
          <div class="coupon-value" v-else>
            <span class="num">{{ cp.discountValue }}</span>
            <span class="symbol">折</span>
          </div>
        </div>
        <div class="coupon-right">
          <h4 class="coupon-name">{{ cp.name }}</h4>
          <p class="coupon-condition">满{{ cp.minAmount }}元可用</p>
          <p class="coupon-date">有效期至 {{ cp.expireTime || '--' }}</p>
        </div>
        <div class="coupon-status-badge" v-if="cp.status === 2">已使用</div>
        <div class="coupon-status-badge expired-badge" v-if="cp.status === 3">已过期</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyCoupons } from '@/api/marketing'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

const router = useRouter()
const loading = ref(true)
const error = ref(false)
const activeTab = ref('all')
const couponList = ref([])

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'available', label: '可使用' },
  { key: 'used', label: '已使用' },
  { key: 'expired', label: '已过期' }
]

function goToHome() {
  router.push('/home')
}

async function loadCoupons() {
  loading.value = true
  error.value = false
  try {
    const statusMap = { all: undefined, available: 1, used: 2, expired: 3 }
    const result = await getMyCoupons(statusMap[activeTab.value])
    couponList.value = result || []
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCoupons()
})
</script>

<style scoped>
.coupons-page {
  padding: 0;
}

.page-header {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 16px;
}

.status-tabs {
  display: flex;
  gap: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-color);
  display: inline-flex;
}

.tab-item {
  padding: 6px 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  transition: all var(--duration-fast);
}

.tab-item:last-child {
  border-right: none;
}

.tab-item.active {
  background: var(--primary-color);
  color: #fff;
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.coupon-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  display: flex;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-light);
}

.coupon-card.used,
.coupon-card.expired {
  opacity: 0.55;
}

.coupon-left {
  width: 110px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  flex-shrink: 0;
}

.coupon-card.used .coupon-left,
.coupon-card.expired .coupon-left {
  background: #bbb;
}

.coupon-value {
  display: flex;
  align-items: baseline;
  line-height: 1;
}

.num {
  font-size: 30px;
  font-weight: var(--font-weight-bold);
}

.symbol {
  font-size: 16px;
}

.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.coupon-name {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.coupon-condition {
  font-size: 12px;
  color: var(--text-light);
}

.coupon-date {
  font-size: 11px;
  color: var(--text-placeholder);
}

.coupon-status-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: #e8e8e8;
  color: #888;
}

.expired-badge {
  background: #fff1f0;
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .coupon-grid {
    grid-template-columns: 1fr;
  }
}
</style>