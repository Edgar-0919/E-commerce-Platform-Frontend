<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ activeTab === 'merchants' ? '商户管理' : '商户申请' }}</span>
          <el-button type="primary" v-if="activeTab === 'merchants'" @click="showDialog(null)">新增商户</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="商户列表" name="merchants">
          <el-form :inline="true" :model="searchForm" size="default">
            <el-form-item label="商户名称">
              <el-input v-model="searchForm.name" placeholder="商户名称" clearable />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="searchForm.status" placeholder="全部" clearable>
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchMerchants">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="merchantList" border stripe v-loading="loading">
            <el-table-column prop="id" label="ID" width="120" />
            <el-table-column prop="name" label="商户名称" />
            <el-table-column prop="contactName" label="联系人" />
            <el-table-column prop="contactPhone" label="联系电话" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="showDialog(row)">编辑</el-button>
                <el-popconfirm
                  :title="`确定${row.status === 1 ? '禁用' : '启用'}该商户？`"
                  @confirm="toggleStatus(row)"
                >
                  <template #reference>
                    <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'">
                      {{ row.status === 1 ? '禁用' : '启用' }}
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="fetchMerchants"
          />
        </el-tab-pane>

        <el-tab-pane label="入驻申请" name="applications">
          <el-form :inline="true" :model="applicationSearch" size="default">
            <el-form-item label="状态">
              <el-select v-model="applicationSearch.status" placeholder="全部" clearable>
                <el-option label="待审核" :value="0" />
                <el-option label="已通过" :value="1" />
                <el-option label="已拒绝" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchApplications">搜索</el-button>
              <el-button @click="resetApplicationSearch">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="applicationList" border stripe v-loading="applicationLoading">
            <el-table-column prop="id" label="申请ID" width="120" />
            <el-table-column prop="username" label="申请人" />
            <el-table-column prop="merchantName" label="商户名称" />
            <el-table-column prop="contactName" label="联系人" />
            <el-table-column prop="contactPhone" label="联系电话" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'">
                  {{ row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reviewRemark" label="审核备注" width="200" />
            <el-table-column prop="createTime" label="申请时间" width="180" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="showApplicationDetail(row)">详情</el-button>
                <template v-if="row.status === 0">
                  <el-button size="small" type="success" @click="approveApplication(row)">通过</el-button>
                  <el-button size="small" type="danger" @click="rejectApplication(row)">拒绝</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="applicationPageNum"
            v-model:page-size="applicationPageSize"
            :total="applicationTotal"
            layout="total, prev, pager, next"
            @current-change="fetchApplications"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      :title="isEdit ? '编辑商户' : '新增商户'"
      v-model="dialogVisible"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="商户名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      title="申请详情"
      v-model="detailVisible"
      width="600px"
    >
      <div v-if="selectedApplication" class="application-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="申请ID">{{ selectedApplication.id }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ selectedApplication.username }}</el-descriptions-item>
          <el-descriptions-item label="商户名称">{{ selectedApplication.merchantName }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ selectedApplication.contactName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ selectedApplication.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedApplication.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商户地址">{{ selectedApplication.address || '-' }}</el-descriptions-item>
          <el-descriptions-item label="营业执照">{{ selectedApplication.businessLicense || '-' }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">
            <el-tag :type="selectedApplication.status === 1 ? 'success' : selectedApplication.status === 2 ? 'danger' : 'warning'">
              {{ selectedApplication.statusText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核人">{{ selectedApplication.reviewerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ selectedApplication.reviewTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="审核备注">{{ selectedApplication.reviewRemark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      :title="reviewType === 'approve' ? '通过申请' : '拒绝申请'"
      v-model="reviewVisible"
      width="400px"
    >
      <el-form :model="reviewForm" label-width="80px">
        <el-form-item label="审核备注">
          <el-input v-model="reviewForm.reviewRemark" type="textarea" :rows="3" placeholder="请输入审核备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">{{ reviewType === 'approve' ? '确认通过' : '确认拒绝' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getMerchants, createMerchant, updateMerchant, updateMerchantStatus,
  getMerchantApplications, reviewMerchantApplication
} from '@/api/admin'

const activeTab = ref('merchants')

const loading = ref(false)
const merchantList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const searchForm = reactive({ name: '', status: null })

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const formRef = ref(null)
const form = reactive({ name: '', contactName: '', contactPhone: '', email: '', address: '' })
const rules = { name: [{ required: true, message: '请输入商户名称', trigger: 'blur' }] }

const applicationLoading = ref(false)
const applicationList = ref([])
const applicationTotal = ref(0)
const applicationPageNum = ref(1)
const applicationPageSize = ref(20)
const applicationSearch = reactive({ status: null })

const detailVisible = ref(false)
const selectedApplication = ref(null)

const reviewVisible = ref(false)
const reviewType = ref('approve')
const reviewForm = reactive({ reviewRemark: '' })
const currentReviewId = ref(null)

function handleTabChange() {
  if (activeTab.value === 'applications') {
    fetchApplications()
  }
}

function fetchMerchants() {
  loading.value = true
  const params = { pageNum: pageNum.value, pageSize: pageSize.value, ...searchForm }
  getMerchants(params).then(res => {
    merchantList.value = res.items || res.records || []
    total.value = parseInt(res.total || 0, 10)
  }).finally(() => { loading.value = false })
}

function resetSearch() {
  searchForm.name = ''
  searchForm.status = null
  pageNum.value = 1
  fetchMerchants()
}

function showDialog(row) {
  if (row) {
    isEdit.value = true
    editId.value = row.id
    Object.assign(form, { name: row.name, contactName: row.contactName, contactPhone: row.contactPhone, email: row.email, address: row.address })
  } else {
    isEdit.value = false
    editId.value = null
  }
  dialogVisible.value = true
}

function resetForm() {
  Object.assign(form, { name: '', contactName: '', contactPhone: '', email: '', address: '' })
  formRef.value?.resetFields()
}

function submit() {
  formRef.value.validate(valid => {
    if (!valid) return
    const data = { ...form }
    const api = isEdit.value ? updateMerchant(editId.value, data) : createMerchant(data)
    api.then(() => {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      fetchMerchants()
    })
  })
}

function toggleStatus(row) {
  updateMerchantStatus(row.id, row.status === 1 ? 0 : 1).then(() => {
    ElMessage.success('状态更新成功')
    fetchMerchants()
  })
}

function fetchApplications() {
  applicationLoading.value = true
  const params = { pageNum: applicationPageNum.value, pageSize: applicationPageSize.value, ...applicationSearch }
  getMerchantApplications(params).then(res => {
    applicationList.value = res.items || res.records || []
    applicationTotal.value = parseInt(res.total || 0, 10)
  }).finally(() => { applicationLoading.value = false })
}

function resetApplicationSearch() {
  applicationSearch.status = null
  applicationPageNum.value = 1
  fetchApplications()
}

function showApplicationDetail(row) {
  selectedApplication.value = row
  detailVisible.value = true
}

function approveApplication(row) {
  currentReviewId.value = row.id
  reviewType.value = 'approve'
  reviewForm.reviewRemark = ''
  reviewVisible.value = true
}

function rejectApplication(row) {
  currentReviewId.value = row.id
  reviewType.value = 'reject'
  reviewForm.reviewRemark = ''
  reviewVisible.value = true
}

function submitReview() {
  reviewMerchantApplication(currentReviewId.value, {
    status: reviewType.value === 'approve' ? 1 : 2,
    reviewRemark: reviewForm.reviewRemark
  }).then(() => {
    ElMessage.success(reviewType.value === 'approve' ? '审核通过' : '审核拒绝')
    reviewVisible.value = false
    fetchApplications()
  })
}

onMounted(fetchMerchants)
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>