<template>
  <div class="address-page">
    <BreadcrumbNav :items="[{ name: '个人中心', path: '/user' }, { name: '收货地址' }]" />

    <div v-if="loading" class="address-content">
      <SkeletonLoader type="list" :count="3" />
    </div>

    <template v-else>
      <div class="address-content">
        <div v-if="addressList.length === 0" class="empty-state">
          <div class="empty-icon">
            <MapLocation />
          </div>
          <p class="empty-text">暂无收货地址</p>
          <button class="empty-btn" @click="showAddModal = true">添加收货地址</button>
        </div>

        <div v-else class="address-list">
          <div
            v-for="addr in addressList"
            :key="addr.id"
            class="address-card"
            :class="{ active: addr.isDefault }"
            @click="selectAddress(addr)"
          >
            <div class="card-header">
              <span class="receiver">{{ addr.receiverName }} {{ addr.phone }}</span>
              <span v-if="addr.isDefault" class="default-tag">默认</span>
            </div>
            <div class="address-detail">
              {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
            </div>
            <div class="card-actions">
              <button class="action-btn edit" @click.stop="editAddress(addr)">编辑</button>
              <button class="action-btn delete" @click.stop="removeAddress(addr.id)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 添加/编辑地址弹窗 -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingAddress ? '编辑收货地址' : '添加收货地址' }}</h3>
            <button class="modal-close" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label>收货人</label>
              <input
                v-model="formData.receiverName"
                type="text"
                placeholder="请输入收货人姓名"
                class="form-input"
              />
            </div>
            <div class="form-item">
              <label>手机号</label>
              <input
                v-model="formData.phone"
                type="tel"
                placeholder="请输入手机号码"
                class="form-input"
              />
            </div>
            <div class="form-item">
              <label>所在地区</label>
              <div class="region-picker">
                <select v-model="formData.province" class="region-select" @change="onProvinceChange">
                  <option value="">请选择省份</option>
                  <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                </select>
                <select v-model="formData.city" class="region-select" @change="onCityChange">
                  <option value="">请选择城市</option>
                  <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
                </select>
                <select v-model="formData.district" class="region-select">
                  <option value="">请选择区县</option>
                  <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>
            <div class="form-item">
              <label>详细地址</label>
              <textarea
                v-model="formData.detail"
                placeholder="请输入详细地址"
                class="form-textarea"
              ></textarea>
            </div>
            <div class="form-item checkbox-item">
              <input
                v-model="formData.isDefault"
                type="checkbox"
                id="isDefault"
                class="form-checkbox"
              />
              <label for="isDefault">设为默认地址</label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeModal">取消</button>
            <button class="modal-btn confirm" @click="submitAddress">{{ editingAddress ? '保存修改' : '确认添加' }}</button>
          </div>
        </div>
      </div>
    </template>

    <!-- 底部添加按钮 -->
    <button v-if="!loading && addressList.length > 0" class="add-btn" @click="showAddModal = true">
      <Plus />
      <span>添加收货地址</span>
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MapLocation, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAddressList, addAddress, updateAddress, deleteAddress } from '@/api/user'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

const router = useRouter()

const loading = ref(true)
const addressList = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingAddress = ref(null)

const formData = reactive({
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省']

const citiesMap = {
  '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
  '上海市': ['黄浦区', '徐汇区', '浦东新区', '长宁区', '静安区'],
  '广东省': ['广州市', '深圳市', '东莞市', '佛山市', '中山市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '绍兴市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市']
}

const districtsMap = {
  '东城区': ['东华门街道', '景山街道', '交道口街道'],
  '西城区': ['西长安街街道', '新街口街道', '金融街街道'],
  '广州市': ['天河区', '越秀区', '白云区', '海珠区', '番禺区'],
  '深圳市': ['南山区', '福田区', '宝安区', '龙华区', '龙岗区'],
  '杭州市': ['西湖区', '拱墅区', '江干区', '滨江区', '余杭区'],
  '南京市': ['玄武区', '秦淮区', '鼓楼区', '建邺区', '栖霞区']
}

const cities = computed(() => {
  if (!formData.province) return []
  return citiesMap[formData.province] || []
})

const districts = computed(() => {
  if (!formData.city) return []
  return districtsMap[formData.city] || []
})

function onProvinceChange() {
  formData.city = ''
  formData.district = ''
}

function onCityChange() {
  formData.district = ''
}

function selectAddress(addr) {
  router.back()
}

function editAddress(addr) {
  editingAddress.value = addr
  formData.receiverName = addr.receiverName
  formData.phone = addr.phone
  formData.province = addr.province
  formData.city = addr.city
  formData.district = addr.district
  formData.detail = addr.detail
  formData.isDefault = addr.isDefault
  showEditModal.value = true
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确定要删除这个收货地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteAddress(id)
    addressList.value = addressList.value.filter(a => a.id !== id)
    ElMessage.success('删除成功')
  } catch {}
}

function removeAddress(id) {
  handleDelete(id)
}

function closeModal() {
  showAddModal.value = false
  showEditModal.value = false
  editingAddress.value = null
  formData.receiverName = ''
  formData.phone = ''
  formData.province = ''
  formData.city = ''
  formData.district = ''
  formData.detail = ''
  formData.isDefault = false
}

async function submitAddress() {
  if (!formData.receiverName) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
    ElMessage.warning('请输入正确的手机号码')
    return
  }
  if (!formData.province || !formData.city || !formData.district) {
    ElMessage.warning('请选择完整的地区信息')
    return
  }
  if (!formData.detail.trim()) {
    ElMessage.warning('请输入详细地址')
    return
  }

  try {
    if (editingAddress.value) {
      await updateAddress(editingAddress.value.id, formData)
      ElMessage.success('修改成功')
    } else {
      await addAddress(formData)
      ElMessage.success('添加成功')
    }
    closeModal()
    loadAddresses()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function loadAddresses() {
  loading.value = true
  try {
    addressList.value = await getAddressList()
  } catch (e) {
    ElMessage.error('加载地址失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.address-page {
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--header-height));
}

.address-content {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: 36px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  margin-bottom: 20px;
}

.empty-btn {
  padding: 10px 28px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.empty-btn:hover {
  opacity: 0.9;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all var(--duration-fast);
}

.address-card:hover {
  box-shadow: var(--shadow-sm);
}

.address-card.active {
  border-color: var(--primary-color);
  background: var(--price-bg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.receiver {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.default-tag {
  font-size: 11px;
  color: var(--primary-color);
  background: var(--primary-bg);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.address-detail {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
}

.card-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.action-btn {
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.action-btn:hover {
  opacity: 0.8;
}

.action-btn.edit {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.action-btn.delete {
  background: var(--danger-bg);
  color: var(--danger-color);
}

.add-btn {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 32px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: opacity var(--duration-fast);
}

.add-btn:hover {
  opacity: 0.9;
}

.add-btn svg {
  font-size: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 20px;
}

.modal-content {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.modal-close {
  font-size: 20px;
  color: var(--text-light);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.region-picker {
  display: flex;
  gap: 8px;
}

.region-select {
  flex: 1;
  padding: 10px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  background: #fff;
}

.region-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-checkbox {
  width: 16px;
  height: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
  justify-content: flex-end;
}

.modal-btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: opacity var(--duration-fast);
}

.modal-btn:hover {
  opacity: 0.9;
}

.modal-btn.cancel {
  background: var(--bg-hover);
  color: var(--text-secondary);
}

.modal-btn.confirm {
  background: var(--primary-color);
  color: #fff;
}

@media (max-width: 768px) {
  .region-picker {
    flex-direction: column;
  }

  .modal-content {
    margin: 10px;
  }
}
</style>