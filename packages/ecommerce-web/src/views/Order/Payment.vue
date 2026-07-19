<template>
  <div class="payment-page">
    <BreadcrumbNav :items="[{ name: '购物车', path: '/cart' }, { name: '确认订单', path: '/checkout' }, { name: '支付' }]" />

    <div v-if="loading" class="payment-content">
      <SkeletonLoader type="detail" />
    </div>

    <template v-else>
      <div class="payment-content">
        <!-- 订单信息 -->
        <div class="section-card">
          <div class="section-header">
            <h3>订单信息</h3>
          </div>
          <div class="order-info">
            <div class="info-row">
              <span class="info-label">订单编号</span>
              <span class="info-value">{{ orderNo }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">商品数量</span>
              <span class="info-value">{{ productCount }} 件</span>
            </div>
            <div class="info-row">
              <span class="info-label">下单时间</span>
              <span class="info-value">{{ orderCreateTime || '--' }}</span>
            </div>
          </div>
        </div>

        <!-- 支付方式 -->
        <div class="section-card">
          <div class="section-header">
            <h3>支付方式</h3>
          </div>
          <div class="payment-methods">
            <div
              v-for="method in paymentMethods"
              :key="method.key"
              class="method-item"
              :class="{ active: selectedMethod === method.key }"
              @click="selectedMethod = method.key"
            >
              <div class="method-icon">{{ method.icon }}</div>
              <div class="method-info">
                <span class="method-name">{{ method.name }}</span>
                <span class="method-desc">{{ method.desc }}</span>
              </div>
              <div class="method-check">
                <span v-if="selectedMethod === method.key" class="check-icon">&#10003;</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 优惠券 -->
        <div class="section-card">
          <div class="section-header">
            <h3>优惠券</h3>
            <span v-if="selectedCoupon" class="coupon-discount">-¥{{ couponDiscount.toFixed(2) }}</span>
          </div>
          <div v-if="availableCoupons.length === 0" class="empty-tip">暂无可用优惠券</div>
          <div v-else class="coupon-list">
            <div
              v-for="cp in availableCoupons"
              :key="cp.id"
              class="coupon-item"
              :class="{ active: selectedCoupon?.id === cp.id }"
              @click="toggleCoupon(cp)"
            >
              <div class="coupon-left">
                <span class="coupon-value">¥{{ cp.discountValue }}</span>
                <span class="coupon-condition">满{{ cp.minAmount }}可用</span>
              </div>
              <div class="coupon-right">
                <span class="coupon-name">{{ cp.name }}</span>
                <span class="coupon-date">{{ formatDate(cp.endTime) }}到期</span>
              </div>
              <div class="coupon-check">
                <span v-if="selectedCoupon?.id === cp.id" class="check-icon">&#10003;</span>
              </div>
            </div>
            <div
              v-if="selectedCoupon"
              class="coupon-item"
              :class="{ active: !selectedCoupon }"
              @click="selectedCoupon = null"
            >
              <div class="coupon-right" style="flex: 1;">
                <span class="coupon-name">不使用优惠券</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付金额 -->
        <div class="section-card amount-card">
          <div class="amount-row">
            <span>商品金额</span>
            <span>¥{{ originalAmount.toFixed(2) }}</span>
          </div>
          <div v-if="couponDiscount > 0" class="amount-row discount">
            <span>优惠券优惠</span>
            <span>-¥{{ couponDiscount.toFixed(2) }}</span>
          </div>
          <div class="amount-row total">
            <span>实付金额</span>
            <span class="total-price">¥{{ payAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 支付按钮 -->
      <div class="payment-bar">
        <div class="bar-info">
          <span class="bar-label">实付款：</span>
          <span class="bar-amount">¥{{ payAmount.toFixed(2) }}</span>
        </div>
        <button class="pay-btn" :disabled="paying" @click="confirmPay">
          {{ paying ? '支付中...' : '确认付款' }}
        </button>
      </div>
    </template>

    <!-- 支付成功弹窗 -->
    <div v-if="showSuccessModal" class="success-modal" @click.self="closeSuccessModal">
      <div class="modal-content">
        <div class="modal-icon success">&#10003;</div>
        <h3 class="modal-title">支付成功</h3>
        <p class="modal-desc">订单已成功支付</p>
        <div class="modal-actions">
          <button class="modal-btn-primary" @click="goToOrder">查看订单</button>
          <button class="modal-btn-default" @click="goHome">返回首页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createPayment, confirmPayment } from '@/api/payment'
import { getMyCoupons } from '@/api/marketing'
import { getOrderDetail } from '@/api/order'
import { BreadcrumbNav } from '@ecommerce/shared'
import { SkeletonLoader } from '@ecommerce/shared'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const paying = ref(false)
const showSuccessModal = ref(false)

const orderId = ref(route.params.orderId || '')
const orderNo = ref('')
const originalAmount = ref(0)
const selectedMethod = ref('alipay')
const selectedCoupon = ref(null)
const availableCoupons = ref([])
const orderCreateTime = ref('')
const productCount = ref(0)

const paymentMethods = [
  { key: 'alipay', name: '支付宝', desc: '推荐使用', icon: '💳' },
  { key: 'wechat', name: '微信支付', desc: '微信扫码支付', icon: '📱' },
  { key: 'bank', name: '银行卡', desc: '储蓄卡/信用卡', icon: '🏦' }
]

const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0
  if (originalAmount.value < selectedCoupon.value.minAmount) return 0
  return selectedCoupon.value.discountValue
})

const payAmount = computed(() => {
  return Math.max(0, originalAmount.value - couponDiscount.value)
})

function toggleCoupon(coupon) {
  if (selectedCoupon.value?.id === coupon.id) {
    selectedCoupon.value = null
  } else {
    selectedCoupon.value = coupon
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

async function init() {
  loading.value = true
  try {
    const [couponResult, orderResult] = await Promise.all([
      getMyCoupons(1).catch(() => []),
      getOrderDetail(orderId.value).catch(() => null)
    ])
    
    if (orderResult) {
      orderNo.value = orderResult.orderNo
      orderCreateTime.value = orderResult.createTime
      productCount.value = orderResult.totalQuantity || orderResult.items?.length || 0
      if (orderResult.payAmount) {
        originalAmount.value = orderResult.payAmount
      }
    }
    
    availableCoupons.value = (couponResult || []).filter(cp => 
      cp.status === 1 && cp.minAmount <= originalAmount.value
    )
  } catch (e) {
    console.error('初始化失败', e)
  } finally {
    loading.value = false
  }
}

async function confirmPay() {
  if (paying.value) return
  
  paying.value = true
  try {
    // 传递 orderId，后端支服接口依赖此字段创建支付单据并进行幂等校验
    await createPayment(orderId.value, orderNo.value, originalAmount.value, selectedMethod.value)
    await confirmPayment(orderNo.value)
    
    showSuccessModal.value = true
  } catch (e) {
    ElMessage.error(e.message || '支付失败，请重试')
  } finally {
    paying.value = false
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  router.push('/order')
}

function goToOrder() {
  showSuccessModal.value = false
  router.push('/order')
}

function goHome() {
  showSuccessModal.value = false
  router.push('/home')
}

onMounted(() => {
  if (!orderId.value || orderId.value === '0') {
    router.push('/cart')
    return
  }
  init()
})
</script>

<style scoped>
.payment-page {
  padding: 0;
}

.payment-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.section-header h3 {
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.coupon-discount {
  font-size: 14px;
  color: var(--success-color);
  font-weight: var(--font-weight-semibold);
}

.empty-tip {
  color: var(--text-light);
  font-size: 14px;
  padding: 12px 0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.method-item.active {
  border-color: var(--primary-color);
  background: var(--price-bg);
}

.method-icon {
  font-size: 28px;
}

.method-info {
  flex: 1;
}

.method-name {
  display: block;
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.method-desc {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  margin-top: 2px;
}

.method-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 16px;
  height: 16px;
  background: var(--primary-color);
  color: #fff;
  border-radius: 50%;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.coupon-item.active {
  border-color: var(--primary-color);
  background: var(--price-bg);
}

.coupon-left {
  text-align: center;
  padding-right: 16px;
  border-right: 1px dashed var(--border-light);
}

.coupon-value {
  display: block;
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--danger-color);
}

.coupon-condition {
  display: block;
  font-size: 11px;
  color: var(--text-light);
  margin-top: 2px;
}

.coupon-right {
  flex: 1;
}

.coupon-name {
  display: block;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.coupon-date {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
}

.coupon-check {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-card {
  padding: 16px 24px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.amount-row span:last-child {
  color: var(--text-primary);
}

.amount-row.discount span:last-child {
  color: var(--success-color);
}

.amount-row.total {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid var(--border-light);
}

.total-price {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color) !important;
}

.payment-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 16px 24px;
  margin-top: 20px;
  border-radius: var(--radius-lg);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
}

.bar-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.bar-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.bar-amount {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.pay-btn {
  padding: 12px 48px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.pay-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 40px;
  text-align: center;
  width: 90%;
  max-width: 400px;
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 16px;
}

.modal-icon.success {
  background: #e8f8e8;
  color: #52c41a;
}

.modal-title {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.modal-btn-primary {
  padding: 10px 28px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.modal-btn-primary:hover {
  opacity: 0.9;
}

.modal-btn-default {
  padding: 10px 28px;
  background: var(--bg-white);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.modal-btn-default:hover {
  border-color: var(--text-light);
}

@media (max-width: 768px) {
  .payment-bar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .bar-info {
    justify-content: flex-end;
  }
  
  .pay-btn {
    width: 100%;
  }
  
  .modal-content {
    padding: 32px 24px;
  }
}
</style>