<template>
  <div class="order-page">
    <div class="order-header">
      <h2>我的订单</h2>
    </div>

    <div class="order-tabs">
      <span
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key; loadOrders()"
      >
        {{ tab.label }}
      </span>
    </div>

    <SkeletonLoader v-if="loading" type="list" :count="3" />

    <ErrorState v-else-if="error" @retry="loadOrders" />

    <EmptyState
      v-else-if="orderList.length === 0"
      description="暂无订单"
      actionText="去购物"
      @action="goToHome"
    />

    <div v-else class="order-list">
      <div v-for="order in orderList" :key="order.id" class="order-card">
        <div class="order-card-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <span class="order-status-tag" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <div class="order-card-body">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-item"
            @click="goToProduct(item.id)"
          >
            <LazyImage :src="item.image" alt="" class="item-thumb" :width="'72px'" :height="'72px'" />
            <div class="item-info">
              <h4 class="item-name">{{ item.name }}</h4>
              <p class="item-spec">{{ item.spec }}</p>
              <div class="item-price-row">
                <span class="price">¥{{ item.price }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="order-card-footer">
          <div class="order-summary">
            <span class="summary-text">共{{ order.totalQuantity }}件商品</span>
            <span class="summary-label">实付款：</span>
            <span class="summary-price">¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-actions">
            <button
              v-if="order.status === 'PENDING'"
              class="action-btn action-primary"
              @click="handleOrder(order.id, 'pay')"
            >
              去支付
            </button>
            <button
              v-if="order.status === 'PENDING'"
              class="action-btn action-default"
              @click="handleOrder(order.id, 'cancel')"
            >
              取消订单
            </button>
            <button
              v-if="order.status === 'PAID'"
              class="action-btn action-primary"
              @click="handleOrder(order.id, 'confirm')"
            >
              确认收货
            </button>
            <button
              v-if="order.status === 'COMPLETED'"
              class="action-btn action-default"
              @click="handleOrder(order.id, 'review')"
            >
              评价
            </button>
          </div>
        </div>
      </div>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadOrders"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOrderPage, cancelOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'
import LazyImage from '@/components/LazyImage.vue'
import { mockOrders } from '@/mock/order'

const router = useRouter()
const activeTab = ref('all')
const orderList = ref([])
const loading = ref(true)
const error = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'completed', label: '待收货' }
]

function getStatusText(status) {
  const map = {
    PENDING: '待付款',
    PAID: '待发货',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return map[status] || status
}

function getStatusClass(status) {
  const map = {
    PENDING: 'status-pending',
    PAID: 'status-paid',
    COMPLETED: 'status-completed',
    CANCELLED: 'status-cancelled'
  }
  return map[status] || ''
}

function goToHome() {
  router.push('/home')
}

function goToProduct(id) {
  router.push(`/product/${id}`)
}

async function handleOrder(orderId, action) {
  switch (action) {
    case 'pay':
      ElMessage.success('支付功能开发中')
      break
    case 'cancel':
      try {
        await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await cancelOrder(orderId)
        orderList.value = orderList.value.filter(o => o.id !== orderId)
        ElMessage.success('订单已取消')
      } catch (e) {
        if (e !== 'cancel') ElMessage.error('取消失败')
      }
      break
    case 'confirm':
      ElMessage.success('确认收货成功')
      break
    case 'review':
      ElMessage.success('评价功能开发中')
      break
  }
}

async function loadOrders() {
  loading.value = true
  error.value = false
  try {
    const statusParam = activeTab.value === 'all' ? undefined : activeTab.value.toUpperCase()
    const result = await getOrderPage({ pageNum: currentPage.value, pageSize: pageSize.value, status: statusParam })
    orderList.value = result.list || mockOrders
    total.value = result.total || mockOrders.length
  } catch (e) {
    orderList.value = mockOrders
    total.value = mockOrders.length
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-page {
  padding: 0;
}

.order-header {
  margin-bottom: var(--spacing-sm);
}

.order-header h2 {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.order-tabs {
  display: flex;
  gap: 0;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  border-bottom: 2px solid transparent;
  font-weight: var(--font-weight-medium);
}

.tab-item:hover {
  color: var(--primary-color);
}

.tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.order-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-light);
}

.order-no {
  color: var(--text-light);
  font-size: var(--font-size-xs);
}

.order-status-tag {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

.status-pending {
  color: #ff5000;
  background: #fff3ed;
}

.status-paid {
  color: var(--link-color);
  background: #eef3ff;
}

.status-completed {
  color: var(--text-light);
  background: var(--bg-hover);
}

.status-cancelled {
  color: var(--text-placeholder);
  background: var(--bg-hover);
}

.order-card-body {
  padding: var(--spacing-xs) var(--spacing-md);
}

.order-item {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  cursor: pointer;
  transition: background var(--duration-fast);
  border-radius: var(--radius-sm);
}

.order-item:not(:last-child) {
  border-bottom: 1px solid var(--border-light);
}

.order-item:hover {
  background: var(--bg-hover);
  margin: 0 calc(-1 * var(--spacing-xs));
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
}

.item-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-light);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-tight);
}

.item-spec {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  margin-bottom: auto;
}

.item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.price {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.quantity {
  color: var(--text-light);
  font-size: var(--font-size-xs);
}

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-light);
  background: var(--bg-white);
}

.order-summary {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.summary-text {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  margin-right: var(--spacing-xs);
}

.summary-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.summary-price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.order-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  padding: 6px 18px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all var(--duration-fast);
  border: none;
  font-weight: var(--font-weight-medium);
}

.action-default {
  background: var(--bg-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.action-default:hover {
  border-color: var(--text-light);
  color: var(--text-primary);
}

.action-primary {
  background: linear-gradient(90deg, #ff6a00, #ff5000);
  color: #fff;
}

.action-primary:hover {
  opacity: 0.9;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 768px) {
  .order-card-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>