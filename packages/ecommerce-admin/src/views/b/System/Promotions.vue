<template>
  <div class="promotions-page">
    <el-card shadow="never">
      <div class="header-bar">
        <el-button type="primary" @click="handleAdd">新增促销活动</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="活动名称" min-width="160" />
        <el-table-column prop="promotionType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.promotionType === 'SECKILL' ? 'danger' : 'warning'">
              {{ row.promotionType === 'SECKILL' ? '秒杀' : '满减' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="discountValue" label="优惠" width="100">
          <template #default="{ row }">
            <span v-if="row.promotionType === 'SECKILL'">¥{{ row.discountValue }}</span>
            <span v-else>¥{{ row.discountValue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
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
          @size-change="fetchPromotions"
          @current-change="fetchPromotions"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="540px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型" prop="promotionType">
          <el-radio-group v-model="form.promotionType">
            <el-radio value="SECKILL">秒杀</el-radio>
            <el-radio value="FULL_REDUCTION">满减</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.promotionType === 'FULL_REDUCTION'" label="满减门槛" prop="thresholdAmount">
          <el-input v-model.number="form.thresholdAmount" placeholder="满多少元" />
        </el-form-item>
        <el-form-item label="优惠值" prop="discountValue">
          <el-input v-model.number="form.discountValue" placeholder="请输入优惠金额" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="关联商品ID" prop="productIds">
          <el-input v-model="form.productIds" placeholder="多个商品ID用逗号分隔" />
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
import { getPromotions, createPromotion, updatePromotion, updatePromotionStatus } from '@/api/admin'

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
  promotionType: 'SECKILL',
  thresholdAmount: null,
  discountValue: null,
  startTime: '',
  endTime: '',
  productIds: ''
})

const rules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  promotionType: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  discountValue: [{ required: true, message: '请输入优惠值', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

async function fetchPromotions() {
  loading.value = true
  try {
    const res = await getPromotions({
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
  dialogTitle.value = '新增促销活动'
  form.name = ''
  form.promotionType = 'SECKILL'
  form.thresholdAmount = null
  form.discountValue = null
  form.startTime = ''
  form.endTime = ''
  form.productIds = ''
  dialogVisible.value = true
}

function handleEdit(row) {
  editingId.value = row.id
  dialogTitle.value = '编辑促销活动'
  form.name = row.name
  form.promotionType = row.promotionType
  form.thresholdAmount = row.thresholdAmount
  form.discountValue = row.discountValue
  form.startTime = row.startTime
  form.endTime = row.endTime
  form.productIds = row.productIds
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
      await updatePromotion(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createPromotion(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchPromotions()
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
    await ElMessageBox.confirm(`确定要${action}该活动吗？`, '提示', { type: 'warning' })
    await updatePromotionStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchPromotions()
  } catch {
    // cancelled
  }
}

onMounted(() => {
  fetchPromotions()
})
</script>

<style scoped>
.promotions-page { padding: 0; }
.header-bar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>