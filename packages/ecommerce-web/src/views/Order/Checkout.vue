<template>
  <div class="checkout-page">
    <BreadcrumbNav :items="[{ name: '购物车', path: '/cart' }, { name: '确认订单' }]" />

    <SkeletonLoader v-if="loading" type="list" :count="4" />

    <ErrorState v-else-if="error" @retry="init" />

    <EmptyState
      v-else-if="orderItems.length === 0"
      description="没有待结算的商品"
      actionText="去购物车"
      @action="goToCart"
    />

    <template v-else>
      <div class="checkout-content">
        <!-- 收货地址 -->
        <div class="section-card">
          <div class="section-header">
            <h3>收货地址</h3>
            <button class="link-btn" @click="showAddressForm = true">+ 新增地址</button>
          </div>
          <div v-if="addresses.length === 0" class="empty-tip">暂无收货地址，请先添加</div>
          <div v-else class="address-list">
            <div
              v-for="addr in addresses"
              :key="addr.id"
              class="address-item"
              :class="{ active: selectedAddressId === addr.id }"
              @click="selectedAddressId = addr.id"
            >
              <div class="addr-info">
                <span class="addr-receiver">{{ addr.receiverName }}</span>
                <span class="addr-phone">{{ addr.phone }}</span>
              </div>
              <p class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</p>
            </div>
          </div>
        </div>

        <!-- 订单商品 -->
        <div class="section-card">
          <div class="section-header">
            <h3>订单商品</h3>
            <span class="count-text">共 {{ orderItems.length }} 件</span>
          </div>
          <div class="order-items">
            <div v-for="item in orderItems" :key="item.id" class="order-item">
              <LazyImage :src="item.mainImage || ''" alt="" class="item-img" />
              <div class="item-info">
                <h4>{{ item.productName }}</h4>
                <p class="item-spec">{{ item.specDesc || '' }}</p>
              </div>
              <div class="item-price">
                <span class="price-text">¥{{ item.price.toFixed(2) }}</span>
                <span class="qty-text">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- 备注 -->
          <div class="remark-row">
            <span class="remark-label">订单备注</span>
            <input v-model="remark" class="remark-input" placeholder="选填，请填写备注信息" maxlength="200" />
          </div>
        </div>

        <!-- 优惠券 -->
        <div class="section-card">
          <div class="section-header">
            <h3>优惠券</h3>
          </div>
          <div v-if="coupons.length === 0" class="empty-tip">暂无可用的优惠券</div>
          <div v-else class="coupon-list">
            <div
              v-for="cp in coupons"
              :key="cp.id"
              class="coupon-item"
              :class="{ active: selectedCouponId === cp.id }"
              @click="toggleCoupon(cp.id)"
            >
              <div class="coupon-info">
                <span class="coupon-value" v-if="cp.discountType === 1">¥{{ cp.discountValue }}元</span>
                <span class="coupon-value" v-else>{{ cp.discountValue }}折</span>
                <span class="coupon-name">{{ cp.name }}</span>
              </div>
              <span class="coupon-min">满{{ cp.minAmount }}元可用</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 结算栏 -->
      <div class="checkout-bar">
        <div class="bar-summary">
          <span>商品合计：</span>
          <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
          <span v-if="discountAmount > 0" class="discount-text">优惠：-¥{{ discountAmount.toFixed(2) }}</span>
        </div>
        <button class="submit-btn" @click="submitOrder" :disabled="submitting">
          {{ submitting ? '提交中...' : `提交订单 (实付 ¥${payAmount.toFixed(2)})` }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCartList } from '@/api/cart'
import { getAddressList } from '@/api/user'
import { getMyCoupons } from '@/api/marketing'
import { createOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import LazyImage from '@/components/common/LazyImage.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

const router = useRouter()

const loading = ref(true)
const error = ref(false)
const submitting = ref(false)

const orderItems = ref([])
const addresses = ref([])
const coupons = ref([])
const selectedAddressId = ref(null)
const selectedCouponId = ref(null)
const remark = ref('')
const showAddressForm = ref(false)

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const selectedCoupon = computed(() => {
  return coupons.value.find(c => c.id === selectedCouponId.value) || null
})

const discountAmount = computed(() => {
  const cp = selectedCoupon.value
  if (!cp || totalAmount.value < cp.minAmount) return 0
  if (cp.discountType === 1) return cp.discountValue
  return totalAmount.value * (1 - cp.discountValue / 10)
})

const payAmount = computed(() => {
  return Math.max(0, totalAmount.value - discountAmount.value)
})

function goToCart() {
  router.push('/cart')
}

function toggleCoupon(id) {
  selectedCouponId.value = selectedCouponId.value === id ? null : id
}

async function init() {
  loading.value = true
  error.value = false
  try {
    const [cartResult, addrResult, couponResult] = await Promise.all([
      getCartList(),
      getAddressList(),
      getMyCoupons(1).catch(() => [])
    ])
    orderItems.value = (cartResult || []).filter(item => item.selected === 1)
    addresses.value = addrResult || []
    coupons.value = (couponResult || []).filter(cp => cp.status === 1)
    if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function submitOrder() {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  submitting.value = true
  try {
    const orderData = {
      items: orderItems.value.map(item => ({
        skuId: item.skuId,
        quantity: item.quantity
      })),
      addressId: selectedAddressId.value,
      couponId: selectedCouponId.value || undefined,
      remark: remark.value || undefined
    }
    const order = await createOrder(orderData)
    // 将 orderId 一并传递，支付接口需要 orderId 参数创建支付单据
    router.push(`/payment?orderNo=${order.orderNo}&amount=${payAmount.value}&orderId=${order.id}`)
  } catch (e) {
    ElMessage.error(e.message || '提交订单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.checkout-page {
  padding: 0;
}

.checkout-content {
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

.count-text {
  font-size: 13px;
  color: var(--text-light);
}

.link-btn {
  font-size: 13px;
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
}

.empty-tip {
  color: var(--text-light);
  font-size: 14px;
  padding: 12px 0;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.address-item {
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
  cursor: pointer;
  transition: border-color var(--duration-fast);
}

.address-item.active {
  border-color: var(--primary-color);
  background: var(--price-bg);
}

.addr-info {
  display: flex;
  gap: 16px;
  margin-bottom: 6px;
}

.addr-receiver {
  font-weight: var(--font-weight-semibold);
  font-size: 14px;
  color: var(--text-primary);
}

.addr-phone {
  font-size: 13px;
  color: var(--text-secondary);
}

.addr-detail {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.5;
}

.order-items {
  display: flex;
  flex-direction: column;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.order-item + .order-item {
  border-top: 1px solid var(--border-light);
}

.item-img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h4 {
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-spec {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
}

.item-price {
  text-align: right;
  flex-shrink: 0;
}

.price-text {
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.qty-text {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  margin-top: 2px;
}

.remark-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.remark-label {
  font-size: 13px;
  color: var(--text-light);
  flex-shrink: 0;
}

.remark-input {
  flex: 1;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  font-size: 13px;
  outline: none;
  color: var(--text-primary);
  background: var(--bg-white);
}

.remark-input:focus {
  border-color: var(--primary-color);
}

.coupon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.coupon-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-fast);
  font-size: 13px;
}

.coupon-item.active {
  border-color: var(--primary-color);
  background: var(--price-bg);
}

.coupon-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coupon-value {
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  font-size: 15px;
  white-space: nowrap;
}

.coupon-name {
  color: var(--text-primary);
}

.coupon-min {
  color: var(--text-light);
  font-size: 12px;
  white-space: nowrap;
}

.checkout-bar {
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

.bar-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.total-price {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.discount-text {
  font-size: 13px;
  color: var(--success-color);
}

.submit-btn {
  padding: 12px 40px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--duration-fast);
  white-space: nowrap;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .address-list {
    grid-template-columns: 1fr;
  }

  .checkout-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
  }
}
</style>