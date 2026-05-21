<template>
  <div class="order-detail-page">
    <BreadcrumbNav :items="[{ name: '我的订单', path: '/order' }, { name: '订单详情' }]" />

    <SkeletonLoader v-if="loading" type="detail" />

    <ErrorState v-else-if="error" @retry="loadDetail" />

    <template v-else>
      <!-- 订单状态 -->
      <div class="status-bar">
        <span class="status-icon" :class="statusIconClass">{{ statusIcon }}</span>
        <div>
          <h2 class="status-title">{{ order.statusDesc }}</h2>
          <p class="status-sub" v-if="order.status === 20">请尽快完成支付</p>
          <p class="status-sub" v-else-if="order.status === 30">等待商家发货</p>
          <p class="status-sub" v-else-if="order.status === 40">商品运输中，请留意收货</p>
        </div>
        <div class="status-actions" v-if="order.status === 20">
          <button class="btn-primary" @click="handlePay">去支付</button>
          <button class="btn-cancel" @click="handleCancel">取消订单</button>
        </div>
        <div class="status-actions" v-if="order.status === 40">
          <button class="btn-primary" @click="handleConfirmReceipt">确认收货</button>
        </div>
      </div>

      <!-- 物流信息 -->
      <div class="section-card" v-if="order.logisticsNo">
        <h3>物流信息</h3>
        <div class="logistics-row">
          <div class="logistics-item">
            <span class="log-label">物流公司</span>
            <span>{{ order.logisticsCompany }}</span>
          </div>
          <div class="logistics-item">
            <span class="log-label">运单号</span>
            <span>{{ order.logisticsNo }}</span>
          </div>
        </div>
      </div>

      <!-- 收货地址 -->
      <div class="section-card">
        <h3>收货信息</h3>
        <div class="address-info">
          <span class="addr-receiver">{{ order.receiverName }}</span>
          <span class="addr-phone">{{ order.phone }}</span>
          <p class="addr-detail">{{ order.address }}</p>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="section-card">
        <h3>订单商品</h3>
        <div class="goods-list">
          <div v-for="item in order.items" :key="item.id" class="goods-item">
            <LazyImage :src="item.image" alt="" class="goods-img" />
            <div class="goods-info">
              <h4>{{ item.productName }}</h4>
              <p class="goods-spec">{{ item.specDesc }}</p>
            </div>
            <div class="goods-price">
              <span>¥{{ item.price.toFixed(2) }}</span>
              <span class="goods-qty">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="section-card">
        <h3>订单信息</h3>
        <div class="info-table">
          <div class="info-row" v-if="order.orderNo"><span>订单编号</span><span>{{ order.orderNo }}</span></div>
          <div class="info-row"><span>创建时间</span><span>{{ order.createTime || '--' }}</span></div>
          <div class="info-row"><span>支付时间</span><span>{{ order.payTime || '--' }}</span></div>
          <div class="info-row"><span>备注</span><span>{{ order.remark || '无' }}</span></div>
          <div class="info-row price-row">
            <span>商品总额</span>
            <span>¥{{ order.totalAmount ? order.totalAmount.toFixed(2) : '--' }}</span>
          </div>
          <div class="info-row" v-if="order.discountAmount">
            <span>优惠金额</span>
            <span class="discount-text">-¥{{ order.discountAmount.toFixed(2) }}</span>
          </div>
          <div class="info-row price-row total">
            <span>实付款</span>
            <span class="final-price">¥{{ order.payAmount ? order.payAmount.toFixed(2) : '--' }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getOrderDetail, cancelOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import LazyImage from '@/components/common/LazyImage.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(false)
const order = ref({})

const statusIconMap = {
  10: { icon: '✕', class: 'cancel' },
  20: { icon: '⏳', class: 'pending' },
  30: { icon: '✓', class: 'paid' },
  40: { icon: '🚚', class: 'shipped' },
  50: { icon: '✔', class: 'completed' },
  60: { icon: '↺', class: 'refunding' },
  70: { icon: '↻', class: 'refunded' }
}

const statusIcon = computed(() => (statusIconMap[order.value.status] || {}).icon || '--')
const statusIconClass = computed(() => (statusIconMap[order.value.status] || {}).class || '')

function handlePay() {
  router.push(`/payment/result?orderNo=${order.value.orderNo}&amount=${order.value.payAmount || order.value.totalAmount}`)
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelOrder(order.value.id)
    ElMessage.success('订单已取消')
    loadDetail()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('取消失败')
  }
}

async function handleConfirmReceipt() {
  ElMessage.success('确认收货成功')
}

async function loadDetail() {
  loading.value = true
  error.value = false
  try {
    const id = route.params.id
    order.value = await getOrderDetail(id)
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.order-detail-page {
  padding: 0;
}

.status-bar {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.status-icon {
  font-size: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon.pending { background: rgba(212, 168, 83, 0.1); color: var(--warning-color); }
.status-icon.paid { background: #e6f7ff; color: #1890ff; }
.status-icon.shipped { background: #f6ffed; color: #52c41a; }
.status-icon.completed { background: #e8f8e8; color: #52c41a; }
.status-icon.cancel { background: #fff1f0; color: #ff4d4f; }
.status-icon.refunding { background: rgba(212, 168, 83, 0.1); color: var(--warning-color); }
.status-icon.refunded { background: #f0f0f0; color: #888; }

.status-title {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.status-sub {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 4px;
}

.status-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.btn-primary {
  padding: 8px 24px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
}

.btn-primary:hover { opacity: 0.9; }

.btn-cancel {
  padding: 8px 24px;
  background: var(--bg-white);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
}

.btn-cancel:hover { border-color: var(--text-light); }

.section-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 16px;
}

.section-card h3 {
  font-size: 15px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}

.address-info {
  font-size: 14px;
  color: var(--text-primary);
}

.addr-receiver {
  font-weight: var(--font-weight-semibold);
  margin-right: 12px;
}

.addr-phone {
  color: var(--text-secondary);
}

.addr-detail {
  color: var(--text-light);
  font-size: 13px;
  margin-top: 6px;
}

.goods-list {
  display: flex;
  flex-direction: column;
}

.goods-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.goods-item + .goods-item {
  border-top: 1px solid var(--border-light);
}

.goods-img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-info h4 {
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-spec {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
}

.goods-price {
  text-align: right;
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  flex-shrink: 0;
}

.goods-qty {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  font-weight: var(--font-weight-normal);
  margin-top: 2px;
}

.info-table {
  font-size: 13px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  color: var(--text-secondary);
}

.info-row + .info-row {
  border-top: 1px solid var(--border-light);
}

.info-row span:last-child {
  color: var(--text-primary);
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.price-row span:last-child {
  font-weight: var(--font-weight-semibold);
}

.discount-text {
  color: var(--success-color) !important;
}

.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
}

.final-price {
  font-size: 18px !important;
  font-weight: var(--font-weight-bold) !important;
  color: var(--price-color) !important;
}

.logistics-row {
  display: flex;
  gap: 32px;
}

.logistics-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.log-label {
  color: var(--text-light);
}

@media (max-width: 768px) {
  .status-bar {
    flex-wrap: wrap;
  }

  .status-actions {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
    margin-top: 12px;
  }
}
</style>