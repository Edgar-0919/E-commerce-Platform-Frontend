<template>
  <div class="checkout-page">
    <BreadcrumbNav :items="[{ name: '购物车', path: '/cart' }, { name: '确认订单' }]" />

    <SkeletonLoader v-if="loading" type="list" :count="4" />

    <ErrorState v-else-if="error" @retry="init" />

    <EmptyState
      v-else-if="orderItems.length === 0"
      description="没有待结算的商品"
      actionText="去购物车"
      @action="goToCart"
    />

    <template v-else>
      <div class="checkout-content">
        <!-- 收货地址 -->
        <div class="section-card">
        <div class="section-header">
          <h3>收货地址</h3>
          <button class="link-btn" @click="showAddressModal = true">+ 新增地址</button>
        </div>
          <div v-if="addresses.length === 0" class="empty-tip">暂无收货地址，请先添加</div>
          <div v-else class="address-list">
            <div
              v-for="addr in addresses.filter(Boolean)"
              :key="addr.id"
              class="address-item"
              :class="{ active: selectedAddressId === addr.id }"
              @click="selectedAddressId = addr.id"
            >
              <div class="addr-info">
                <span class="addr-receiver">{{ addr.receiverName }}</span>
                <span class="addr-phone">{{ addr.phone }}</span>
              </div>
              <p class="addr-detail">{{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}</p>
            </div>
          </div>
        </div>

        <!-- 订单商品 -->
        <div class="section-card">
          <div class="section-header">
            <h3>订单商品</h3>
            <span class="count-text">共 {{ orderItems.length }} 件</span>
          </div>
          <div class="order-items">
            <div v-for="item in orderItems" :key="item.id" class="order-item">
              <LazyImage :src="item.mainImage || ''" alt="" class="item-img" />
              <div class="item-info">
                <h4>{{ item.productName }}</h4>
                <p class="item-spec">{{ item.specDesc || '' }}</p>
              </div>
              <div class="item-right">
                <span class="item-price">¥{{ item.price.toFixed(2) }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- 备注 -->
          <div class="remark-row">
            <span class="remark-label">订单备注</span>
            <input v-model="remark" class="remark-input" placeholder="选填，请填写备注信息" maxlength="200" />
          </div>
        </div>

        <!-- 优惠券 -->
        <div class="section-card">
          <div class="section-header">
            <h3>优惠券</h3>
          </div>
          <div v-if="coupons.length === 0" class="empty-tip">暂无可用的优惠券</div>
          <div v-else class="coupon-list">
            <div
              v-for="cp in coupons"
              :key="cp.id"
              class="coupon-item"
              :class="{ active: selectedCouponId === cp.id }"
              @click="toggleCoupon(cp.id)"
            >
              <div class="coupon-info">
                <span class="coupon-value" v-if="cp.discountType === 1">¥{{ cp.discountValue }}元</span>
                <span class="coupon-value" v-else>{{ cp.discountValue }}折</span>
                <span class="coupon-name">{{ cp.name }}</span>
              </div>
              <span class="coupon-min">满{{ cp.minAmount }}元可用</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 结算栏 -->
      <div class="checkout-bar">
        <div class="bar-summary">
          <span>商品合计：</span>
          <span class="total-price">¥{{ totalAmount.toFixed(2) }}</span>
          <span v-if="discountAmount > 0" class="discount-text">优惠：-¥{{ discountAmount.toFixed(2) }}</span>
        </div>
        <button class="submit-btn" @click="submitOrder" :disabled="submitting">
          {{ submitting ? '提交中...' : `提交订单 (实付 ¥${payAmount.toFixed(2)})` }}
        </button>
      </div>

      <!-- 新增地址弹窗 -->
      <div v-if="showAddressModal" class="modal-overlay" @click.self="closeAddressModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>添加收货地址</h3>
            <button class="modal-close" @click="closeAddressModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="form-item">
              <label>收货人</label>
              <input
                v-model="addressForm.receiverName"
                type="text"
                placeholder="请输入收货人姓名"
                class="form-input"
              />
            </div>
            <div class="form-item">
              <label>手机号</label>
              <input
                v-model="addressForm.phone"
                type="tel"
                placeholder="请输入手机号码"
                class="form-input"
              />
            </div>
            <div class="form-item">
              <label>所在地区</label>
              <div class="region-picker">
                <select v-model="addressForm.province" class="region-select" @change="onProvinceChange">
                  <option value="">请选择省份</option>
                  <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
                </select>
                <select v-model="addressForm.city" class="region-select" @change="onCityChange">
                  <option value="">请选择城市</option>
                  <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
                </select>
                <select v-model="addressForm.district" class="region-select">
                  <option value="">请选择区县</option>
                  <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
            </div>
            <div class="form-item">
              <label>详细地址</label>
              <textarea
                v-model="addressForm.detail"
                placeholder="请输入详细地址"
                class="form-textarea"
              ></textarea>
            </div>
            <div class="form-item checkbox-item">
              <input
                v-model="addressForm.isDefault"
                type="checkbox"
                id="addressIsDefault"
                class="form-checkbox"
              />
              <label for="addressIsDefault">设为默认地址</label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="modal-btn cancel" @click="closeAddressModal">取消</button>
            <button class="modal-btn confirm" @click="submitAddress">确认添加</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getCartList } from '@/api/cart'
import { getAddressList, addAddress } from '@/api/user'
import { getMyCoupons } from '@/api/marketing'
import { createOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import { LazyImage } from '@ecommerce/shared'
import { SkeletonLoader } from '@ecommerce/shared'
import { ErrorState } from '@ecommerce/shared'
import { EmptyState } from '@ecommerce/shared'
import { BreadcrumbNav } from '@ecommerce/shared'
import { provinces, getCities, getDistricts } from '@ecommerce/shared/utils/regionData'

const router = useRouter()

const loading = ref(true)
const error = ref(false)
const submitting = ref(false)

const orderItems = ref([])
const addresses = ref([])
const coupons = ref([])
const selectedAddressId = ref(null)
const selectedCouponId = ref(null)
const remark = ref('')
const showAddressModal = ref(false)

const addressForm = reactive({
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const cities = computed(() => {
  if (!addressForm.province) return []
  return getCities(addressForm.province)
})

const districts = computed(() => {
  if (!addressForm.province || !addressForm.city) return []
  return getDistricts(addressForm.province, addressForm.city)
})

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const selectedCoupon = computed(() => {
  return coupons.value.find(c => c.id === selectedCouponId.value) || null
})

const discountAmount = computed(() => {
  const cp = selectedCoupon.value
  if (!cp || totalAmount.value < cp.minAmount) return 0
  if (cp.discountType === 1) return cp.discountValue
  return totalAmount.value * (1 - cp.discountValue / 10)
})

const payAmount = computed(() => {
  return Math.max(0, totalAmount.value - discountAmount.value)
})

function goToCart() {
  router.push('/cart')
}

function closeAddressModal() {
  showAddressModal.value = false
  addressForm.receiverName = ''
  addressForm.phone = ''
  addressForm.province = ''
  addressForm.city = ''
  addressForm.district = ''
  addressForm.detail = ''
  addressForm.isDefault = false
}

function onProvinceChange() {
  addressForm.city = ''
  addressForm.district = ''
}

function onCityChange() {
  addressForm.district = ''
}

async function submitAddress() {
  if (!addressForm.receiverName) {
    ElMessage.warning('请输入收货人姓名')
    return
  }
  if (!addressForm.phone || !/^1[3-9]\d{9}$/.test(addressForm.phone)) {
    ElMessage.warning('请输入正确的手机号码')
    return
  }
  if (!addressForm.province || !addressForm.city || !addressForm.district) {
    ElMessage.warning('请选择完整的地区信息')
    return
  }
  if (!addressForm.detail.trim()) {
    ElMessage.warning('请输入详细地址')
    return
  }

  try {
    const result = await addAddress(addressForm)
    if (result && result.id != null) {
      addresses.value.push(result)
      selectedAddressId.value = result.id
    } else {
      // 后端返回的 result 可能没有 id（例如后端返回 data 为空），
      // 此时重新拉一次最新地址列表确保数据一致
      ElMessage.warning('地址已添加，正在刷新列表...')
      try {
        const latest = await getAddressList()
        addresses.value = latest || []
        if (addresses.value.length > 0) {
          selectedAddressId.value = addresses.value[0].id
        }
      } catch {
        /* ignore */
      }
    }
    closeAddressModal()
    ElMessage.success('添加成功')
  } catch (e) {
    ElMessage.error(e.message || '添加失败')
  }
}

function toggleCoupon(id) {
  selectedCouponId.value = selectedCouponId.value === id ? null : id
}

async function init() {
  loading.value = true
  error.value = false
  try {
    const [cartResult, addrResult, couponResult] = await Promise.all([
      getCartList(),
      getAddressList(),
      getMyCoupons(1).catch(() => [])
    ])
    orderItems.value = (cartResult || []).filter(item => item.selected === 1)
    addresses.value = addrResult || []
    coupons.value = (couponResult || []).filter(cp => cp.status === 1)
    if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function submitOrder() {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }
  submitting.value = true
  try {
    const orderData = {
      items: orderItems.value.map(item => ({
        skuId: item.skuId,
        quantity: item.quantity
      })),
      addressId: selectedAddressId.value,
      couponId: selectedCouponId.value || undefined,
      remark: remark.value || undefined
    }
    const order = await createOrder(orderData)
    // 将 orderId 传递到支付页面，支付接口需要 orderId 参数创建支付单据
    router.push(`/payment/${order.id}`)
  } catch (e) {
    ElMessage.error(e.message || '提交订单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.checkout-page {
  padding: 0;
}

.checkout-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light);
}

.section-header h3 {
  font-size: 16px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.count-text {
  font-size: 13px;
  color: var(--text-light);
}

.link-btn {
  font-size: 13px;
  color: var(--primary-color);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast);
}

.link-btn:hover {
  background: var(--price-bg);
}

.empty-tip {
  color: var(--text-light);
  font-size: 14px;
  padding: 12px 0;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.address-item {
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px;
  cursor: pointer;
  transition: border-color var(--duration-fast);
}

.address-item.active {
  border-color: var(--primary-color);
  background: var(--price-bg);
}

.addr-info {
  display: flex;
  gap: 16px;
  margin-bottom: 6px;
}

.addr-receiver {
  font-weight: var(--font-weight-semibold);
  font-size: 14px;
  color: var(--text-primary);
}

.addr-phone {
  font-size: 13px;
  color: var(--text-secondary);
}

.addr-detail {
  font-size: 13px;
  color: var(--text-light);
  line-height: 1.5;
}

.order-items {
  display: flex;
  flex-direction: column;
}

.order-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
}

.order-item + .order-item {
  border-top: 1px solid var(--border-light);
}

.item-img {
  width: 80px !important;
  height: 80px !important;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  border: 1px solid var(--border-light);
  overflow: hidden;
  background: var(--bg-white);
  display: block;
}

.item-img img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.item-info h4 {
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-spec {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-right {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 100px;
}

.item-price {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--danger-color);
}

.item-quantity {
  font-size: 12px;
  color: var(--text-light);
}

.price-text {
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.qty-text {
  display: block;
  font-size: 12px;
  color: var(--text-light);
  margin-top: 2px;
}

.remark-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.remark-label {
  font-size: 13px;
  color: var(--text-light);
  flex-shrink: 0;
}

.remark-input {
  flex: 1;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0 12px;
  font-size: 13px;
  outline: none;
  color: var(--text-primary);
  background: var(--bg-white);
}

.remark-input:focus {
  border-color: var(--primary-color);
}

.coupon-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.coupon-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--duration-fast);
  font-size: 13px;
}

.coupon-item.active {
  border-color: var(--primary-color);
  background: var(--price-bg);
}

.coupon-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coupon-value {
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  font-size: 15px;
  white-space: nowrap;
}

.coupon-name {
  color: var(--text-primary);
}

.coupon-min {
  color: var(--text-light);
  font-size: 12px;
  white-space: nowrap;
}

.checkout-bar {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 16px 24px;
  margin-top: 20px;
  border-radius: var(--radius-lg);
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
}

.bar-summary {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}

.total-price {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.discount-text {
  font-size: 13px;
  color: var(--success-color);
}

.submit-btn {
  padding: 12px 40px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--duration-fast);
  white-space: nowrap;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .address-list {
    grid-template-columns: 1fr;
  }

  .checkout-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
  }

  .region-picker {
    flex-direction: column;
  }
}

/* 弹窗样式 */
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
</style>