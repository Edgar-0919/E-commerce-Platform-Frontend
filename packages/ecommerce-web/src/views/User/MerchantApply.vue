<template>
  <div class="merchant-apply-page">
    <BreadcrumbNav :items="[{ name: '个人中心', path: '/user' }, { name: '商户入驻' }]" />

    <div class="apply-card">
      <div class="card-header">
        <h2 class="apply-title">商户入驻申请</h2>
        <p class="apply-desc">请填写以下信息，提交后等待平台审核</p>
      </div>

      <template v-if="loading">
        <el-skeleton :rows="6" animated />
      </template>

      <template v-else-if="application">
        <div class="status-section">
          <div class="status-icon" :class="application.status === 1 ? 'success' : application.status === 2 ? 'reject' : 'pending'">
            <Check v-if="application.status === 1" />
            <Close v-else-if="application.status === 2" />
            <Clock v-else />
          </div>
          <div class="status-info">
            <h3>{{ application.statusText }}</h3>
            <p v-if="application.reviewRemark" class="review-remark">审核备注：{{ application.reviewRemark }}</p>
            <p class="apply-time">申请时间：{{ formatDate(application.createTime) }}</p>
          </div>
        </div>
        <el-divider />
        <div class="application-detail">
          <div class="detail-row">
            <span class="detail-label">商户名称</span>
            <span class="detail-value">{{ application.merchantName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">联系人</span>
            <span class="detail-value">{{ application.contactName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">联系电话</span>
            <span class="detail-value">{{ application.contactPhone }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">邮箱</span>
            <span class="detail-value">{{ application.email || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">商户地址</span>
            <span class="detail-value">{{ application.address || '-' }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="apply-form">
          <el-form-item label="商户名称" prop="merchantName">
            <el-input v-model="form.merchantName" placeholder="请输入商户名称" />
          </el-form-item>

          <el-form-item label="联系人姓名" prop="contactName">
            <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
          </el-form-item>

          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>

          <el-form-item label="电子邮箱">
            <el-input v-model="form.email" type="email" placeholder="请输入电子邮箱（选填）" />
          </el-form-item>

          <el-form-item label="商户地址">
            <el-input v-model="form.address" type="textarea" :rows="3" placeholder="请输入商户地址（选填）" />
          </el-form-item>

          <el-form-item label="营业执照">
            <el-input v-model="form.businessLicense" placeholder="请上传营业执照图片URL（选填）" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmit" :loading="submitting" class="submit-btn">
              提交申请
            </el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Close, Clock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { submitMerchantApplication, getMerchantApplicationStatus } from '@/api/user'
import { BreadcrumbNav } from '@ecommerce/shared'

const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const application = ref(null)
const formRef = ref(null)

const form = reactive({
  merchantName: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  businessLicense: ''
})

const rules = {
  merchantName: [
    { required: true, message: '请输入商户名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商户名称长度2-100位', trigger: 'blur' }
  ],
  contactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '联系人姓名长度2-50位', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

async function loadApplicationStatus() {
  loading.value = true
  try {
    const res = await getMerchantApplicationStatus()
    if (res) {
      application.value = res
    }
  } catch (e) {
    console.error('获取申请状态失败', e)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  submitting.value = true
  try {
    await submitMerchantApplication(form)
    ElMessage.success('申请提交成功，等待审核')
    await loadApplicationStatus()
  } catch (e) {
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(() => {
  loadApplicationStatus()
})
</script>

<style scoped>
.merchant-apply-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height));
}

.apply-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 600px;
  align-self: center;
  margin-top: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.card-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.apply-title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 8px;
}

.apply-desc {
  font-size: var(--font-size-sm);
  color: var(--text-light);
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.status-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-page);
  border-radius: var(--radius-md);
}

.status-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.status-icon.pending {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.status-icon.success {
  background: rgba(46, 125, 50, 0.1);
  color: var(--success-color);
}

.status-icon.reject {
  background: rgba(211, 47, 47, 0.1);
  color: var(--danger-color);
}

.status-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 4px;
}

.review-remark {
  font-size: var(--font-size-sm);
  color: var(--danger-color);
  margin-bottom: 4px;
}

.apply-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.application-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .apply-card {
    padding: var(--spacing-lg);
  }

  .status-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>