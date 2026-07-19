<template>
  <div class="inventory-page">
    <el-card shadow="never">
      <div class="filter-bar">
        <el-input v-model="searchProductId" placeholder="商品ID" style="width: 180px" clearable @clear="handleFilter" @keyup.enter="handleFilter" />
        <el-switch v-model="onlyLowStock" active-text="仅看低库存" @change="handleFilter" />
        <el-button type="primary" @click="handleFilter">搜索</el-button>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="tableData" v-loading="loading" stripe :row-class-name="rowClassName">
        <el-table-column prop="skuId" label="SKU ID" width="120" />
        <el-table-column prop="productId" label="商品ID" width="100" />
        <el-table-column prop="productName" label="商品名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="totalStock" label="总库存" width="90" />
        <el-table-column prop="lockedStock" label="锁定库存" width="100" />
        <el-table-column prop="availableStock" label="可用库存" width="100">
          <template #default="{ row }">
            <span :class="{ 'low-stock': row.availableStock <= row.safetyStock }">
              {{ row.availableStock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="safetyStock" label="安全库存" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.availableStock <= row.safetyStock" type="danger" size="small">预警</el-tag>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="warning" link @click="handleAdjust(row, 1)">入库</el-button>
            <el-button size="small" type="danger" link @click="handleAdjust(row, -1)">出库</el-button>
            <el-button size="small" type="primary" link @click="handleViewLog(row)">日志</el-button>
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
          @size-change="fetchInventory"
          @current-change="fetchInventory"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="adjustDialogVisible"
      :title="adjustType === 1 ? '入库' : '出库'"
      width="400px"
      destroy-on-close
    >
      <el-form label-width="80px">
        <el-form-item label="SKU ID">
          <span>{{ adjustSkuId }}</span>
        </el-form-item>
        <el-form-item label="数量" required>
          <el-input v-model.number="adjustQuantity" type="number" :min="1" placeholder="请输入数量" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="adjustRemark" placeholder="操作备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdjustSubmit" :loading="adjustSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="logDialogVisible" title="库存变更日志" width="640px" destroy-on-close>
      <el-table :data="logData" v-loading="logLoading" stripe max-height="400">
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'increase' ? 'success' : 'danger'" size="small">
              {{ row.type === 'increase' ? '入库' : '出库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="beforeQty" label="变更前" width="80" />
        <el-table-column prop="afterQty" label="变更后" width="80" />
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
        <el-table-column prop="createTime" label="时间" width="170" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getInventoryList, adjustInventory, getInventoryLog } from '@/api/admin'

const tableData = ref([])
const loading = ref(false)
const searchProductId = ref('')
const onlyLowStock = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const adjustDialogVisible = ref(false)
const adjustType = ref(1)
const adjustSkuId = ref(null)
const adjustQuantity = ref(1)
const adjustRemark = ref('')
const adjustSubmitting = ref(false)

const logDialogVisible = ref(false)
const logData = ref([])
const logLoading = ref(false)

function rowClassName({ row }) {
  if (row.availableStock <= row.safetyStock) return 'row-warning'
  return ''
}

async function fetchInventory() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    if (searchProductId.value) params.productId = searchProductId.value
    if (onlyLowStock.value) params.lowStock = true
    const res = await getInventoryList(params)
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
  fetchInventory()
}

function handleAdjust(row, type) {
  adjustSkuId.value = row.skuId
  adjustType.value = type
  adjustQuantity.value = 1
  adjustRemark.value = type === 1 ? '管理员入库' : '管理员出库'
  adjustDialogVisible.value = true
}

async function handleAdjustSubmit() {
  if (!adjustQuantity.value || adjustQuantity.value < 1) {
    ElMessage.warning('请输入有效数量')
    return
  }
  adjustSubmitting.value = true
  try {
    const delta = adjustType.value === 1 ? adjustQuantity.value : -adjustQuantity.value
    await adjustInventory(adjustSkuId.value, { delta, remark: adjustRemark.value })
    ElMessage.success('库存调整成功')
    adjustDialogVisible.value = false
    fetchInventory()
  } catch {
    // handled
  } finally {
    adjustSubmitting.value = false
  }
}

async function handleViewLog(row) {
  logDialogVisible.value = true
  logLoading.value = true
  try {
    const data = await getInventoryLog(row.skuId, { page: 1, size: 50 })
    logData.value = data || []
  } catch {
    logData.value = []
  } finally {
    logLoading.value = false
  }
}

onMounted(() => {
  fetchInventory()
})
</script>

<style scoped>
.inventory-page { padding: 0; }
.filter-bar { display: flex; align-items: center; gap: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
.low-stock { color: #f56c6c; font-weight: bold; }
:deep(.row-warning) { background-color: #fef0f0; }
</style>