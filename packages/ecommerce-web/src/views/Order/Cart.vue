<template>
  <div class="cart-page">
    <div class="cart-header">
      <h2>购物车</h2>
      <span class="cart-count" v-if="!loading && !error && cartList.length > 0">已选 {{ selectedCount }} 件，共 {{ totalCount }} 件商品</span>
    </div>

    <SkeletonLoader v-if="loading" type="list" :count="3" />

    <ErrorState v-else-if="error" @retry="loadCart" />

    <EmptyState
      v-else-if="cartList.length === 0"
      description="购物车空空如也"
      actionText="去挑选心仪商品"
      @action="goToHome"
    />

    <div v-else class="cart-content">
      <div class="cart-table">
        <div class="table-header">
          <div class="col-check">
            <label class="tao-checkbox">
              <input type="checkbox" :checked="isAllSelected" :indeterminate.prop="isIndeterminate" @change="toggleSelectAll($event.target.checked)" />
              <span class="check-mark"></span>
            </label>
          </div>
          <div class="col-info">商品信息</div>
          <div class="col-price">单价</div>
          <div class="col-qty">数量</div>
          <div class="col-subtotal">金额</div>
          <div class="col-action">操作</div>
        </div>

        <div
          v-for="item in cartList"
          :key="item.id"
          class="table-row"
          :class="{ selected: selectedItems.includes(item.id) }"
        >
          <div class="col-check">
            <label class="tao-checkbox">
              <input type="checkbox" :checked="selectedItems.includes(item.id)" @change="toggleSelect(item.id)" />
              <span class="check-mark"></span>
            </label>
          </div>
          <div class="col-info">
            <div class="item-image" @click="goToProduct(item.productId)">
              <LazyImage :src="item.mainImage || ''" alt="" />
            </div>
            <div class="item-detail">
              <h3 class="item-name" @click="goToProduct(item.productId)">{{ item.productName }}</h3>
              <p class="item-spec">{{ item.specDesc || '规格：默认' }}</p>
            </div>
          </div>
          <div class="col-price">
            <span class="price-text">¥{{ item.price }}</span>
          </div>
          <div class="col-qty">
            <div class="qty-pill">
              <button class="qty-btn-minus" @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button class="qty-btn-plus" @click="updateQuantity(item.id, item.quantity + 1)">+</button>
            </div>
          </div>
          <div class="col-subtotal">
            <span class="subtotal-text">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
          </div>
          <div class="col-action">
            <button class="delete-link" @click="deleteItem(item.id)">删除</button>
          </div>
        </div>
      </div>

      <div class="cart-bottom-bar">
        <div class="bottom-left">
          <label class="tao-checkbox">
            <input type="checkbox" :checked="isAllSelected" :indeterminate.prop="isIndeterminate" @change="toggleSelectAll($event.target.checked)" />
            <span class="check-mark"></span>
          </label>
          <span class="select-all-text">全选</span>
          <button class="clear-link" @click="clearCart">清空购物车</button>
        </div>
        <div class="bottom-right">
          <div class="total-block">
            <span class="total-selected">已选 <em>{{ selectedCount }}</em> 件</span>
            <span class="total-label">合计：</span>
            <span class="total-amount">¥{{ totalPrice }}</span>
          </div>
          <button class="checkout-pill" :disabled="selectedCount === 0" @click="checkout">
            结算{{ selectedCount > 0 ? ` (${selectedCount})` : '' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart } from '@element-plus/icons-vue'
import { getCartList, updateCartItem, deleteCartItem } from '@/api/cart'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SkeletonLoader } from '@ecommerce/shared'
import { ErrorState } from '@ecommerce/shared'
import { EmptyState } from '@ecommerce/shared'
import { LazyImage } from '@ecommerce/shared'

const router = useRouter()
const cartList = ref([])
const selectedItems = ref([])
const loading = ref(true)
const error = ref(false)

const totalCount = computed(() => cartList.value.reduce((sum, item) => sum + item.quantity, 0))

const selectedCount = computed(() =>
  cartList.value
    .filter(item => selectedItems.value.includes(item.id))
    .reduce((sum, item) => sum + item.quantity, 0)
)

const totalPrice = computed(() =>
  cartList.value
    .filter(item => selectedItems.value.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const isAllSelected = computed(() =>
  cartList.value.length > 0 && selectedItems.value.length === cartList.value.length
)

const isIndeterminate = computed(() =>
  selectedItems.value.length > 0 && selectedItems.value.length < cartList.value.length
)

async function updateQuantity(id, quantity) {
  if (quantity < 1) return
  try {
    await updateCartItem(id, { quantity })
    const item = cartList.value.find(i => i.id === id)
    if (item) item.quantity = quantity
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

function toggleSelect(id) {
  const index = selectedItems.value.indexOf(id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
    updateCartItem(id, { selected: 0 }).catch(() => {})
  } else {
    selectedItems.value.push(id)
    updateCartItem(id, { selected: 1 }).catch(() => {})
  }
}

function toggleSelectAll(val) {
  selectedItems.value = val ? cartList.value.map(item => item.id) : []
  cartList.value.forEach(item => {
    updateCartItem(item.id, { selected: val ? 1 : 0 }).catch(() => {})
  })
}

async function deleteItem(id) {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCartItem(id)
    cartList.value = cartList.value.filter(item => item.id !== id)
    selectedItems.value = selectedItems.value.filter(i => i !== id)
    ElMessage.success('删除成功')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

async function clearCart() {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    cartList.value.forEach(item => deleteCartItem(item.id))
    cartList.value = []
    selectedItems.value = []
    ElMessage.success('已清空购物车')
  } catch {}
}

function checkout() {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  router.push('/checkout')
}

function goToHome() {
  router.push('/home')
}

function goToProduct(id) {
  router.push(`/product/${id}`)
}

async function loadCart() {
  loading.value = true
  error.value = false
  try {
    const result = await getCartList()
    cartList.value = result || []
    selectedItems.value = cartList.value.filter(item => item.selected === 1).map(item => item.id)
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped>
.cart-page {
  padding: 0;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.cart-header h2 {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.cart-count {
  color: var(--text-light);
  font-size: var(--font-size-xs);
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.cart-table {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.table-header {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-md);
  height: 44px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.table-row {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  transition: background var(--duration-fast);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--bg-hover);
}

.col-check {
  width: 48px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.col-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.col-price {
  width: 100px;
  text-align: center;
  flex-shrink: 0;
}

.col-qty {
  width: 130px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.col-subtotal {
  width: 100px;
  text-align: center;
  flex-shrink: 0;
}

.col-action {
  width: 70px;
  text-align: center;
  flex-shrink: 0;
}

.tao-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.tao-checkbox input[type="checkbox"] {
  display: none;
}

.check-mark {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--text-placeholder);
  border-radius: 3px;
  display: inline-block;
  position: relative;
  transition: all var(--duration-fast);
  flex-shrink: 0;
}

.tao-checkbox input:checked + .check-mark {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.tao-checkbox input:checked + .check-mark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 6px;
  height: 10px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.tao-checkbox input:indeterminate + .check-mark {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.tao-checkbox input:indeterminate + .check-mark::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 7px;
  width: 10px;
  height: 2px;
  background: #fff;
  border-radius: 1px;
}

.item-image {
  width: 80px;
  height: 80px;
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid var(--border-light);
}

.item-detail {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  color: var(--text-primary);
  margin-bottom: 6px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: var(--line-height-tight);
}

.item-name:hover {
  color: var(--primary-color);
}

.item-spec {
  color: var(--text-light);
  font-size: var(--font-size-xs);
}

.price-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.qty-pill {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.qty-btn-minus,
.qty-btn-plus {
  width: 30px;
  height: 30px;
  border: none;
  background: var(--bg-hover);
  cursor: pointer;
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  transition: background var(--duration-fast);
  line-height: 30px;
  text-align: center;
  padding: 0;
}

.qty-btn-minus:hover:not(:disabled),
.qty-btn-plus:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.qty-btn-minus:disabled {
  color: var(--text-placeholder);
  cursor: not-allowed;
}

.qty-value {
  min-width: 40px;
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.subtotal-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.delete-link {
  background: none;
  border: none;
  color: var(--text-light);
  font-size: var(--font-size-xs);
  cursor: pointer;
  padding: 2px 6px;
  transition: color var(--duration-fast);
}

.delete-link:hover {
  color: var(--danger-color);
}

.cart-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  margin-top: var(--spacing-sm);
  box-shadow: var(--shadow-sm);
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
}

.bottom-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.select-all-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.clear-link {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast);
}

.clear-link:hover {
  color: var(--danger-color);
  background: var(--price-bg);
}

.bottom-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.total-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-selected {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-right: var(--spacing-sm);
}

.total-selected em {
  font-style: normal;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.total-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.total-amount {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.checkout-pill {
  height: 42px;
  padding: 0 32px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--duration-fast);
  white-space: nowrap;
}

.checkout-pill:disabled {
  background: var(--text-placeholder);
  cursor: not-allowed;
  opacity: 0.7;
}

.checkout-pill:not(:disabled):hover {
  opacity: 0.9;
}

@media (max-width: 768px) {
  .cart-header {
    flex-direction: column;
    gap: var(--spacing-xs);
    align-items: flex-start;
  }

  .table-header {
    display: none;
  }

  .table-row {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
  }

  .col-info {
    width: calc(100% - 60px);
  }

  .col-price,
  .col-qty,
  .col-subtotal,
  .col-action {
    width: auto;
    text-align: left;
  }

  .cart-bottom-bar {
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .bottom-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>