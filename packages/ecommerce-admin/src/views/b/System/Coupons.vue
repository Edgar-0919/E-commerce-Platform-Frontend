<template>
  <div class="coupons-page">
    <el-card shadow="never">
      <div class="header-bar">
        <el-button type="primary" @click="handleAdd">新增优惠券模板</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="模板名称" min-width="160" />
        <el-table-column prop="couponType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.couponType === 'DISCOUNT' ? '折扣券' : '满减券' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="discountValue" label="优惠值" width="100">
          <template #default="{ row }">
            <span v-if="row.couponType === 'DISCOUNT'">{{ row.discountValue }}折</span>
            <span v-else>¥{{ row.discountValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="minAmount" label="最低消费" width="100">
          <template #default="{ row }">¥{{ row.minAmount || 0 }}</template>
        </el-table-column>
        <el-table-column prop="validDays" label="有效天数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" link @click="handleStatusChange(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
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
          @size-change="fetchCoupons"
          @current-change="fetchCoupons"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="优惠类型" prop="couponType">
          <el-radio-group v-model="form.couponType">
            <el-radio value="DISCOUNT">折扣券</el-radio>
            <el-radio value="FULL_REDUCTION">满减券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优惠值" prop="discountValue">
          <el-input v-model.number="form.discountValue" :placeholder="form.couponType === 'DISCOUNT' ? '请输入折扣值（如8.5）' : '请输入减扣金额'" />
        </el-form-item>
        <el-form-item label="最低消费" prop="minAmount">
          <el-input v-model.number="form.minAmount" placeholder="0表示无门槛" />
        </el-form-item>
        <el-form-item label="有效天数" prop="validDays">
          <el-input v-model.number="form.validDays" placeholder="领取后有效天数" />
        </el-form-item>
        <el-form-item label="发放数量" prop="totalQuantity">
          <el-input v-model.number="form.totalQuantity" placeholder="请输入发放总数量" />
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
import { getCouponTemplates, createCouponTemplate, updateCouponTemplate, updateTemplateStatus } from '@/api/admin'

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

const form = reactive({
  name: '',
  couponType: 'FULL_REDUCTION',
  discountValue: null,
  minAmount: 0,
  validDays: 30,
  totalQuantity: 100
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  couponType: [{ required: true, message: '请选择优惠类型', trigger: 'change' }],
  discountValue: [{ required: true, message: '请输入优惠值', trigger: 'blur' }],
  validDays: [{ required: true, message: '请输入有效天数', trigger: 'blur' }]
}

async function fetchCoupons() {
  loading.value = true
  try {
    const res = await getCouponTemplates({
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

function handleAdd() {
  editingId.value = null
  dialogTitle.value = '新增优惠券模板'
  form.name = ''
  form.couponType = 'FULL_REDUCTION'
  form.discountValue = null
  form.minAmount = 0
  form.validDays = 30
  form.totalQuantity = 100
  dialogVisible.value = true
}

function handleEdit(row) {
  editingId.value = row.id
  dialogTitle.value = '编辑优惠券模板'
  form.name = row.name
  form.couponType = row.couponType
  form.discountValue = row.discountValue
  form.minAmount = row.minAmount
  form.validDays = row.validDays
  form.totalQuantity = row.totalQuantity
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
      await updateCouponTemplate(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createCouponTemplate(form)
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

onMounted(() => {
  fetchCoupons()
})
</script>

<style scoped>
.coupons-page { padding: 0; }
.header-bar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>