<template>
  <div class="orders-page">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="订单状态" style="width: 140px" clearable @change="handleFilter">
          <el-option label="待付款" value="PENDING_PAYMENT" />
          <el-option label="待发货" value="PENDING_SHIP" />
          <el-option label="已发货" value="SHIPPED" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELLED" />
        </el-select>
        <el-date-picker
          v-model="filterDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @change="handleFilter"
        />
        <el-input v-model="filterOrderNo" placeholder="搜索订单号" style="width: 200px" clearable @change="handleFilter" />
        <el-button type="primary" @click="handleFilter">搜索</el-button>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="totalAmount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleViewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'PENDING_SHIP'" size="small" type="success" link @click="handleShip(row)">发货</el-button>
            <el-button
              v-if="row.status === 'PENDING_PAYMENT' || row.status === 'PENDING_SHIP'"
              size="small"
              type="danger"
              link
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchOrders"
          @current-change="fetchOrders"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="订单详情" width="640px" destroy-on-close>
      <template v-if="orderDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ orderDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusType(orderDetail.status)">{{ statusText(orderDetail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户">{{ orderDetail.username }}</el-descriptions-item>
          <el-descriptions-item label="金额">¥{{ orderDetail.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ orderDetail.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ orderDetail.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">{{ orderDetail.receiverAddress }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ orderDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ orderDetail.payTime || '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <el-table :data="orderDetail.items" stripe>
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="subtotal" label="小计" width="100">
            <template #default="{ row }">¥{{ row.subtotal }}</template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrders, getOrderDetail, shipOrder, cancelOrder } from '@/api/admin'

const tableData = ref([])
const loading = ref(false)
const filterStatus = ref('')
const filterDateRange = ref(null)
const filterOrderNo = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailDialogVisible = ref(false)
const orderDetail = ref(null)

const statusMap = {
  PENDING_PAYMENT: '待付款',
  PENDING_SHIP: '待发货',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}

function statusText(status) {
  return statusMap[status] || status
}

function statusType(status) {
  const map = {
    PENDING_PAYMENT: 'warning',
    PENDING_SHIP: 'primary',
    SHIPPED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return map[status] || 'info'
}

async function fetchOrders() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      status: filterStatus.value,
      orderNo: filterOrderNo.value
    }
    if (filterDateRange.value && filterDateRange.value.length === 2) {
      params.startDate = filterDateRange.value[0]
      params.endDate = filterDateRange.value[1]
    }
    const res = await getOrders(params)
    tableData.value = res.records || []
    total.value = res.total || 0
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleFilter() {
  currentPage.value = 1
  fetchOrders()
}

async function handleViewDetail(row) {
  try {
    orderDetail.value = await getOrderDetail(row.id)
    detailDialogVisible.value = true
  } catch {
    // handled
  }
}

async function handleShip(row) {
  try {
    await ElMessageBox.prompt('请输入物流单号', '发货', { confirmButtonText: '确定', cancelButtonText: '取消' })
      .then(async ({ value }) => {
        await shipOrder(row.id, { trackingNo: value })
        ElMessage.success('发货成功')
        fetchOrders()
      })
  } catch {
    // cancelled
  }
}

async function handleCancel(row) {
  try {
    await ElMessageBox.prompt('请输入取消原因', '取消订单', { confirmButtonText: '确定', cancelButtonText: '取消' })
      .then(async ({ value }) => {
        await cancelOrder(row.id, { reason: value })
        ElMessage.success('订单已取消')
        fetchOrders()
      })
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-page { padding: 0; }
.filter-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>