<template>
  <div class="refunds-page">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-select v-model="filterStatus" placeholder="退款状态" style="width: 140px" clearable @change="handleFilter">
          <el-option label="处理中" :value="0" />
          <el-option label="已退款" :value="1" />
          <el-option label="已拒绝" :value="2" />
        </el-select>
        <el-button type="primary" @click="handleFilter">搜索</el-button>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="refundNo" label="退款单号" width="180" />
        <el-table-column prop="orderId" label="关联订单ID" width="120" />
        <el-table-column prop="amount" label="退款金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="reason" label="退款原因" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleViewDetail(row)">详情</el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="success"
              link
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 0"
              size="small"
              type="danger"
              link
              @click="handleReject(row)"
            >
              拒绝
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
          @size-change="fetchRefunds"
          @current-change="fetchRefunds"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="退款详情" width="500px" destroy-on-close>
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="退款单号">{{ detail.refundNo }}</el-descriptions-item>
        <el-descriptions-item label="退款金额">¥{{ detail.amount }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(detail.status)">{{ statusText(detail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联订单ID">{{ detail.orderId }}</el-descriptions-item>
        <el-descriptions-item label="退款原因" :span="2">{{ detail.reason }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRefunds, approveRefund, rejectRefund } from '@/api/admin'

const tableData = ref([])
const loading = ref(false)
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailDialogVisible = ref(false)
const detail = ref(null)

const statusMap = { 0: '处理中', 1: '已退款', 2: '已拒绝' }

function statusText(status) {
  return statusMap[status] || status
}

function statusType(status) {
  const map = { 0: 'warning', 1: 'success', 2: 'danger' }
  return map[status] || 'info'
}

async function fetchRefunds() {
  loading.value = true
  try {
    const params = { page: currentPage.value, size: pageSize.value }
    if (filterStatus.value !== '' && filterStatus.value !== null) {
      params.status = filterStatus.value
    }
    const res = await getRefunds(params)
    tableData.value = res.items || res.records || []
    total.value = parseInt(res.total || 0, 10)
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleFilter() {
  currentPage.value = 1
  fetchRefunds()
}

function handleViewDetail(row) {
  detail.value = row
  detailDialogVisible.value = true
}

async function handleApprove(row) {
  try {
    await ElMessageBox.confirm('确定通过该退款申请吗？', '提示', { type: 'warning' })
    await approveRefund(row.id)
    ElMessage.success('退款已通过')
    fetchRefunds()
  } catch {
    // cancelled
  }
}

async function handleReject(row) {
  try {
    await ElMessageBox.confirm('确定拒绝该退款申请吗？', '提示', { type: 'warning' })
    await rejectRefund(row.id)
    ElMessage.success('退款已拒绝')
    fetchRefunds()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchRefunds()
})
</script>

<style scoped>
.refunds-page { padding: 0; }
.filter-bar { display: flex; align-items: center; gap: 12px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>