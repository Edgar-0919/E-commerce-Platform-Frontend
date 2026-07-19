<template>
  <div class="coupons-page">
    <el-card shadow="never">
      <div class="header-bar">
        <el-button type="primary" @click="handleAdd">新增优惠券模板</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="模板名称" min-width="160" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="优惠金额" width="100">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="threshold" label="使用门槛" width="100">
          <template #default="{ row }">¥{{ row.threshold || 0 }}</template>
        </el-table-column>
        <el-table-column prop="totalCount" label="发放总量" width="100" />
        <el-table-column prop="perUserLimit" label="每人限领" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
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

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchCoupons"
          @current-change="fetchCoupons"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="优惠类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :value="1">满减券</el-radio>
            <el-radio :value="2">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠金额" prop="amount">
          <el-input v-model.number="form.amount" :placeholder="form.type === 2 ? '请输入折扣率（如0.85）' : '请输入减扣金额'" />
        </el-form-item>
        <el-form-item label="使用门槛" prop="threshold">
          <el-input v-model.number="form.threshold" placeholder="0表示无门槛" />
        </el-form-item>
        <el-form-item label="发放总量" prop="totalCount">
          <el-input v-model.number="form.totalCount" placeholder="请输入发放总数量" />
        </el-form-item>
        <el-form-item label="每人限领" prop="perUserLimit">
          <el-input v-model.number="form.perUserLimit" placeholder="每人限领数量" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
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
import { getCouponTemplates, createCouponTemplate, updateCouponTemplate, updateTemplateStatus, deleteCouponTemplate } from '@/api/admin'

const tableData = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref(null)

// 类型映射: 1满减券 2折扣券 3直减券
const typeMap = { 1: '满减券', 2: '折扣券', 3: '直减券' }
function typeText(type) {
  return typeMap[type] || '未知'
}

const form = reactive({
  name: '',
  type: 1,
  amount: null,
  threshold: 0,
  totalCount: 100,
  perUserLimit: 1,
  startTime: '',
  endTime: ''
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择优惠类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入优惠金额', trigger: 'blur' }],
  totalCount: [{ required: true, message: '请输入发放总量', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

async function fetchCoupons() {
  loading.value = true
  try {
    const res = await getCouponTemplates({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    tableData.value = res.records || []
    total.value = res.total || 0
  } catch {
    tableData.value = []
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  editingId.value = null
  dialogTitle.value = '新增优惠券模板'
  form.name = ''
  form.type = 1
  form.amount = null
  form.threshold = 0
  form.totalCount = 100
  form.perUserLimit = 1
  form.startTime = ''
  form.endTime = ''
  dialogVisible.value = true
}

function handleEdit(row) {
  editingId.value = row.id
  dialogTitle.value = '编辑优惠券模板'
  form.name = row.name
  form.type = row.type
  form.amount = row.amount
  form.threshold = row.threshold ?? 0
  form.totalCount = row.totalCount
  form.perUserLimit = row.perUserLimit ?? 1
  form.startTime = row.startTime ?? ''
  form.endTime = row.endTime ?? ''
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
      await updateCouponTemplate(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createCouponTemplate({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchCoupons()
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
    await ElMessageBox.confirm(`确定要${action}该模板吗？`, '提示', { type: 'warning' })
    await updateTemplateStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchCoupons()
  } catch {
    // cancelled
  }
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm('确定要删除该优惠券模板吗？', '警告', { type: 'warning' })
    await deleteCouponTemplate(row.id)
    ElMessage.success('删除成功')
    fetchCoupons()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>

<style scoped>
.coupons-page { padding: 0; }
.header-bar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>