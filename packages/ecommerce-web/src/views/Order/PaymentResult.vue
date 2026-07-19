<template>
  <div class="payment-result-page">
    <div class="result-card" v-if="!loading">
      <!-- 成功状态 -->
      <template v-if="status === 'success'">
        <div class="result-icon success">&#10003;</div>
        <h2 class="result-title">支付成功</h2>
        <p class="result-desc">订单已支付，我们将尽快为您发货</p>
        <div class="result-info">
          <div class="info-row"><span>订单编号</span><span>{{ order.orderNo || orderNo }}</span></div>
          <div class="info-row"><span>支付金额</span><span class="price">¥{{ (order.payAmount || order.totalAmount || 0).toFixed(2) }}</span></div>
          <div class="info-row"><span>支付时间</span><span>{{ order.payTime || '--' }}</span></div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" @click="goToOrder">查看订单</button>
          <button class="btn-default" @click="goHome">返回首页</button>
        </div>
      </template>

      <!-- 失败状态 -->
      <template v-else-if="status === 'fail'">
        <div class="result-icon fail">&#10007;</div>
        <h2 class="result-title">支付失败</h2>
        <p class="result-desc">{{ failReason || '支付未成功，请重试' }}</p>
        <div class="result-actions">
          <button class="btn-primary" @click="retryPay">重新支付</button>
          <button class="btn-default" @click="goToOrder">查看订单</button>
        </div>
      </template>

      <!-- 等待中 -->
      <template v-else>
        <div class="result-icon waiting">...</div>
        <h2 class="result-title">等待支付</h2>
        <p class="result-desc">订单已创建，请尽快完成支付</p>
        <div class="result-info">
          <div class="info-row"><span>订单编号</span><span>{{ orderNo }}</span></div>
          <div class="info-row"><span>应付金额</span><span class="price">¥{{ amount.toFixed(2) }}</span></div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" @click="retryPay">立即支付</button>
          <button class="btn-default" @click="goToOrder">查看订单</button>
        </div>
      </template>
    </div>

    <SkeletonLoader v-else type="detail" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { queryPayStatus } from '@/api/payment'
import { getOrderDetail } from '@/api/order'
import { SkeletonLoader } from '@ecommerce/shared'

const route = useRoute()
const router = useRouter()

const orderNo = ref(route.query.orderNo || '')
const amount = ref(Number(route.query.amount) || 0)
const status = ref('paying')
const order = ref({})
const failReason = ref('')
const loading = ref(true)

function goHome() {
  router.push('/home')
}

function goToOrder() {
  router.push('/order')
}

function retryPay() {
  if (orderNo.value) {
    router.push(`/order`)
  }
}

async function checkStatus() {
  if (!orderNo.value) {
    status.value = 'fail'
    failReason.value = '缺少订单信息'
    loading.value = false
    return
  }
  try {
    const payStatus = await queryPayStatus(orderNo.value)
    if (payStatus === 30 || payStatus === 40 || payStatus === 50) {
      status.value = 'success'
      try {
        order.value = await getOrderDetail(orderNo.value)
      } catch (e) { /* ignore */ }
    } else {
      status.value = 'paying'
    }
  } catch (e) {
    status.value = 'paying'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkStatus()
})
</script>

<style scoped>
.payment-result-page {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.result-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 48px 40px;
  text-align: center;
  width: 100%;
  max-width: 480px;
}

.result-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
  font-weight: var(--font-weight-bold);
}

.result-icon.success {
  background: #e8f8e8;
  color: #52c41a;
}

.result-icon.fail {
  background: #fff1f0;
  color: #ff4d4f;
}

.result-icon.waiting {
  background: rgba(212, 168, 83, 0.1);
  color: var(--warning-color);
  font-size: 24px;
}

.result-title {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 8px;
}

.result-desc {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 24px;
}

.result-info {
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  text-align: left;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.info-row span:last-child {
  color: var(--text-primary);
}

.price {
  font-weight: var(--font-weight-bold);
  color: var(--price-color) !important;
  font-size: 15px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-primary {
  padding: 10px 32px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-default {
  padding: 10px 32px;
  background: var(--bg-white);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
}

.btn-default:hover {
  border-color: var(--text-light);
}
</style>