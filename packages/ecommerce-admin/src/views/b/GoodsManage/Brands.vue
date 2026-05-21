<template>
  <div class="brands-page">
    <el-card shadow="never">
      <div class="header-bar">
        <el-button type="primary" @click="handleAdd">新增品牌</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="品牌名称" min-width="160" />
        <el-table-column prop="logo" label="品牌Logo" width="120">
          <template #default="{ row }">
            <el-avatar v-if="row.logo" :src="row.logo" :size="40" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" link @click="handleStatusChange(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="Logo URL" prop="logo">
          <el-input v-model="form.logo" placeholder="请输入Logo图片URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input v-model.number="form.sortOrder" placeholder="请输入排序值" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBrands, createBrand, updateBrand, updateBrandStatus, deleteBrand } from '@/api/admin'

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = reactive({
  name: '',
  logo: '',
  sortOrder: 0
})

const rules = {
  name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }]
}

async function fetchBrands() {
  loading.value = true
  try {
    const res = await getBrands()
    tableData.value = res.records || res || []
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  editingId.value = null
  dialogTitle.value = '新增品牌'
  form.name = ''
  form.logo = ''
  form.sortOrder = 0
  dialogVisible.value = true
}

function handleEdit(row) {
  editingId.value = row.id
  dialogTitle.value = '编辑品牌'
  form.name = row.name
  form.logo = row.logo
  form.sortOrder = row.sortOrder
  dialogVisible.value = true
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  submitting.value = true
  try {
    if (editingId.value) {
      await updateBrand(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createBrand(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchBrands()
  } catch {
    // handled
  } finally {
    submitting.value = false
  }
}

async function handleStatusChange(row) {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}该品牌吗？`, '提示', { type: 'warning' })
    await updateBrandStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchBrands()
  } catch {
    // cancelled
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除该品牌吗？', '警告', { type: 'warning' })
    await deleteBrand(row.id)
    ElMessage.success('删除成功')
    fetchBrands()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchBrands()
})
</script>

<style scoped>
.brands-page { padding: 0; }
.header-bar { margin-bottom: 16px; }
</style>