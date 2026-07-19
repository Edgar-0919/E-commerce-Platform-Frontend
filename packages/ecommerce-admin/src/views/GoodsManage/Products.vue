<template>
  <div class="products-page">
    <el-card shadow="never">
      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索商品名称" style="width: 240px" clearable @clear="handleSearch" @keyup.enter="handleSearch" />
        <el-select v-model="searchStatus" placeholder="商品状态" style="width: 140px" clearable @change="handleSearch">
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button type="success" @click="$router.push('/admin/products/create')">新增商品</el-button>
      </div>
    </el-card>

    <el-card shadow="never" style="margin-top: 16px">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="$router.push(`/admin/products/${row.id}/edit`)">编辑</el-button>
            <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" link @click="handleStatusChange(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
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
          @size-change="fetchProducts"
          @current-change="fetchProducts"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProducts, updateProductStatus, deleteProduct } from '@/api/admin'

const tableData = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const searchStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

async function fetchProducts() {
  loading.value = true
  try {
    const res = await getProducts({
      keyword: searchKeyword.value,
      status: searchStatus.value,
      page: currentPage.value,
      size: pageSize.value
    })
    tableData.value = res.records || []
    total.value = res.total || 0
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchProducts()
}

async function handleStatusChange(row) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确定要${action}该商品吗？`, '提示', { type: 'warning' })
    await updateProductStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchProducts()
  } catch {
    // cancelled or error
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？此操作不可恢复', '警告', { type: 'warning' })
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch {
    // cancelled or error
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-page { padding: 0; }
.search-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>