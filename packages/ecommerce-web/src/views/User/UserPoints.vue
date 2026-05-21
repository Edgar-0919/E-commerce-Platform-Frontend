<template>
  <div class="points-page">
    <BreadcrumbNav :items="[{ name: '个人中心', path: '/user' }, { name: '积分明细' }]" />

    <div class="points-card">
      <div class="points-header">
        <span class="points-label">当前积分</span>
        <span class="points-value">{{ totalPoints }}</span>
      </div>
      <p class="points-tip">积分可用于兑换优惠券及参与活动</p>
    </div>

    <SkeletonLoader v-if="loading" type="list" :count="5" />

    <ErrorState v-else-if="error" @retry="loadPoints" />

    <div v-else class="points-list">
      <div class="list-header">
        <h3>积分明细</h3>
      </div>
      <EmptyState
        v-if="records.length === 0"
        description="暂无积分记录"
      />
      <div v-else class="record-items">
        <div v-for="record in records" :key="record.id" class="record-item">
          <div class="record-info">
            <span class="record-desc">{{ record.description || record.source || '积分变动' }}</span>
            <span class="record-time">{{ record.createTime || '--' }}</span>
          </div>
          <div class="record-amount" :class="record.value > 0 ? 'income' : 'expense'">
            {{ record.value > 0 ? '+' : '' }}{{ record.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyPoints } from '@/api/marketing'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

const loading = ref(true)
const error = ref(false)
const totalPoints = ref(0)
const records = ref([])

async function loadPoints() {
  loading.value = true
  error.value = false
  try {
    const result = await getMyPoints()
    if (result) {
      totalPoints.value = result.points || result.totalPoints || result.total || 0
      records.value = result.records || result.list || result.records || []
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPoints()
})
</script>

<style scoped>
.points-page {
  padding: 0;
}

.points-card {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  color: #fff;
  margin-bottom: 20px;
}

.points-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.points-label {
  font-size: 15px;
  opacity: 0.9;
}

.points-value {
  font-size: 40px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.points-tip {
  font-size: 13px;
  opacity: 0.75;
}

.points-list {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.list-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.list-header h3 {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.record-items {
  padding: 0 20px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
}

.record-item + .record-item {
  border-top: 1px solid var(--border-light);
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-desc {
  font-size: 14px;
  color: var(--text-primary);
}

.record-time {
  font-size: 12px;
  color: var(--text-placeholder);
}

.record-amount {
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
}

.record-amount.income {
  color: var(--success-color);
}

.record-amount.expense {
  color: var(--text-light);
}
</style>