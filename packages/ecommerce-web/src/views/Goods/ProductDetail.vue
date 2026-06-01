<template>
  <div class="product-detail">
    <BreadcrumbNav :items="breadcrumbs" />

    <SkeletonLoader v-if="loading" type="detail" />

    <ErrorState v-else-if="error" @retry="loadProduct" />

    <template v-else>
      <div class="detail-main">
        <div class="product-gallery">
          <div class="main-image-wrap">
            <button class="img-arrow left" @click="prevImage" :disabled="currentImageIndex === 0" aria-label="上一张">
              <ArrowLeft />
            </button>
            <LazyImage :src="currentImage" :alt="product.name" class="main-image" />
            <button class="img-arrow right" @click="nextImage" :disabled="currentImageIndex === productImages.length - 1" aria-label="下一张">
              <ArrowRight />
            </button>
          </div>
          <div class="image-thumbs">
            <div
              v-for="(img, index) in productImages"
              :key="index"
              class="thumb-item"
              :class="{ active: currentImageIndex === index }"
              @click="currentImageIndex = index"
            >
              <img :src="img" alt="" loading="lazy" />
            </div>
          </div>
        </div>

        <div class="product-info">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-desc">{{ product.description }}</p>

          <div class="price-block">
            <div class="price-main">
              <span class="price-symbol">¥</span>
              <span class="price-current">{{ displayPrice }}</span>
            </div>
            <div class="price-sub" v-if="displayMarketPrice">
              <span class="price-label">价格</span>
              <span class="price-original">¥{{ displayMarketPrice }}</span>
              <span v-if="displayDiscount" class="discount-badge">{{ displayDiscount }}折</span>
            </div>
          </div>

          <div class="meta-row">
            <span>累计销量 <em>{{ product.sales || 0 }}</em></span>
            <span class="split">|</span>
            <span>好评率 <em>98%</em></span>
          </div>

          <div class="sku-section" v-if="product.skus && product.skus.length > 0">
            <div class="section-label">规格</div>
            <div class="sku-options">
              <span
                v-for="sku in product.skus"
                :key="sku.id"
                class="sku-pill"
                :class="{ active: selectedSkuId === sku.id }"
                @click="selectedSkuId = sku.id"
              >
                {{ sku.specValues ? Object.values(sku.specValues).join(' / ') : sku.skuCode }}
              </span>
            </div>
          </div>

          <div class="quantity-section">
            <span class="section-label">数量</span>
            <div class="quantity-control">
              <button class="qty-btn" @click="decreaseQty" :disabled="quantity <= 1">−</button>
              <input class="qty-input" type="text" :value="quantity" readonly />
              <button class="qty-btn" @click="increaseQty">+</button>
            </div>
            <span class="stock-tip">有货</span>
          </div>

          <div class="action-buttons">
            <button class="btn-cart" @click="handleAddToCart">
              <ShoppingCart />
              加入购物车
            </button>
            <button class="btn-buy" @click="buyNow">
              立即购买
            </button>
          </div>
        </div>
      </div>

      <div class="detail-tabs">
        <div class="tabs-header">
          <span
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </span>
        </div>
        <div class="tabs-content">
          <div v-if="activeTab === 'detail'" class="tab-panel">
            <div class="detail-content">
              <p>{{ product.description || '暂无详细描述' }}</p>
            </div>
          </div>
          <div v-if="activeTab === 'spec'" class="tab-panel">
            <table class="spec-table">
              <tr><td class="spec-label">品牌</td><td>{{ product.brandName || '未知' }}</td></tr>
              <tr><td class="spec-label">分类</td><td>{{ product.categoryName || '未知' }}</td></tr>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCart, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { addToCart } from '@/api/cart'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import LazyImage from '@/components/common/LazyImage.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const error = ref(false)

const product = reactive({
  id: 0,
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  discount: null,
  sales: 0,
  image: '',
  brandName: '',
  categoryName: '',
  mainImage: '',
  images: [],
  skus: []
})

const currentImageIndex = ref(0)
const selectedSkuId = ref(null)
const quantity = ref(1)
const activeTab = ref('detail')

const productImages = computed(() => {
  const imgs = []
  if (product.mainImage) imgs.push(product.mainImage)
  if (product.images && product.images.length > 0) imgs.push(...product.images)
  return imgs.length > 0 ? imgs : []
})

const currentImage = computed(() => productImages.value[currentImageIndex.value] || '')

const currentSku = computed(() => {
  if (!selectedSkuId.value || !product.skus || product.skus.length === 0) {
    return product.skus?.[0] || null
  }
  return product.skus.find(s => s.id === selectedSkuId.value) || product.skus[0]
})

const displayPrice = computed(() => currentSku.value?.price || product.price || 0)
const displayMarketPrice = computed(() => currentSku.value?.marketPrice || product.originalPrice || 0)
const displayDiscount = computed(() => {
  if (displayMarketPrice.value && displayPrice.value) {
    const d = Math.round(displayPrice.value / displayMarketPrice.value * 10)
    return d < 10 ? d : null
  }
  return product.discount || null
})

const breadcrumbs = computed(() => [
  { name: '首页', path: '/home' },
  { name: product.name || '商品详情' }
])

const tabs = [
  { key: 'detail', label: '商品详情' },
  { key: 'spec', label: '规格参数' }
]

function prevImage() {
  if (currentImageIndex.value > 0) currentImageIndex.value--
}

function nextImage() {
  if (currentImageIndex.value < productImages.value.length - 1) currentImageIndex.value++
}

function decreaseQty() {
  if (quantity.value > 1) quantity.value--
}

function increaseQty() {
  quantity.value++
}

async function handleAddToCart() {
  // 未登录时跳转到登录页，登录成功后回跳当前商品详情
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  try {
    await addToCart({ skuId: selectedSkuId.value, quantity: quantity.value })
    ElMessage.success('已加入购物车')
  } catch (e) {
    // 响应拦截器已统一弹窗提示，此处仅阻止异常冒泡
  }
}

function buyNow() {
  router.push('/cart')
}

async function loadProduct() {
  loading.value = true
  error.value = false
  const id = route.params.id
  try {
    const result = await getProductDetail(id)
    Object.assign(product, result)
    if (product.skus && product.skus.length > 0) {
      selectedSkuId.value = product.skus[0].id
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail {
  padding: 0;
}

.detail-main {
  display: flex;
  gap: 32px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
}

.product-gallery {
  width: 450px;
  flex-shrink: 0;
}

.main-image-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border: 1px solid var(--border-light);
  overflow: hidden;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  background: #fff;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.main-image :deep(img) {
  object-fit: cover;
}

.img-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  background: rgba(0, 0, 0, 0.15);
  color: #fff;
  border: none;
  width: 32px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.img-arrow:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.4);
}

.img-arrow:disabled {
  opacity: 0.15;
  cursor: default;
}

.img-arrow.left { left: 0; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; }
.img-arrow.right { right: 0; border-radius: var(--radius-sm) 0 0 var(--radius-sm); }

.image-thumbs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.thumb-item {
  width: calc((100% - 32px) / 5);
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  padding: 1px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color var(--duration-fast);
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-item.active {
  border-color: var(--price-color);
}

.thumb-item:hover:not(.active) {
  border-color: var(--border-color);
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 8px;
}

.product-desc {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 16px;
  line-height: 1.5;
}

.price-block {
  background: var(--price-bg);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 16px;
}

.price-main {
  display: flex;
  align-items: baseline;
  margin-bottom: 6px;
}

.price-symbol {
  font-size: 14px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.price-current {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
  font-family: Arial, sans-serif;
  line-height: 1;
}

.price-sub {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-label {
  font-size: 12px;
  color: var(--text-light);
}

.price-original {
  font-size: 12px;
  color: var(--text-light);
  text-decoration: line-through;
}

.discount-badge {
  display: inline-block;
  background: var(--price-color);
  color: #fff;
  font-size: 12px;
  padding: 0 6px;
  line-height: 18px;
  border-radius: 2px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-light);
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-light);
}

.meta-row em {
  font-style: normal;
  font-weight: var(--font-weight-semibold);
  color: var(--price-color);
}

.split {
  color: var(--border-color);
}

.sku-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.section-label {
  font-size: 13px;
  color: var(--text-light);
  width: 42px;
  flex-shrink: 0;
  padding-top: 6px;
}

.sku-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.sku-pill {
  padding: 4px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
  line-height: 22px;
  white-space: nowrap;
  background: var(--bg-white);
}

.sku-pill:hover {
  border-color: var(--price-color);
}

.sku-pill.active {
  border-color: var(--price-color);
  color: var(--price-color);
  background: var(--price-bg);
}

.quantity-section {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  background: var(--bg-white);
  cursor: pointer;
  font-size: 16px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast);
}

.qty-btn:first-child {
  border-radius: var(--radius-full) 0 0 var(--radius-full);
}

.qty-btn:last-child {
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
}

.qty-btn:hover:not(:disabled) {
  border-color: var(--price-color);
  color: var(--price-color);
}

.qty-btn:disabled {
  color: var(--text-placeholder);
  cursor: not-allowed;
}

.qty-input {
  width: 50px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 14px;
  color: var(--text-primary);
  background: var(--bg-white);
  outline: none;
}

.stock-tip {
  margin-left: 12px;
  font-size: 12px;
  color: var(--success-color);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-cart,
.btn-buy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 46px;
  font-size: 16px;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--duration-fast);
  border-radius: 24px;
  padding: 0 28px;
}

.btn-cart {
  background: var(--bg-white);
  color: var(--price-color);
  border: 1px solid var(--price-color);
}

.btn-cart:hover {
  background: var(--price-bg);
}

.btn-buy {
  flex: 1;
  background: var(--price-color);
  color: #fff;
  border: 1px solid var(--price-color);
}

.btn-buy:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
}

.detail-tabs {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-light);
}

.tab-item {
  position: relative;
  padding: 12px 24px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--duration-fast);
  font-weight: var(--font-weight-medium);
}

.tab-item:hover {
  color: var(--price-color);
}

.tab-item.active {
  color: var(--price-color);
  font-weight: var(--font-weight-bold);
  background: var(--bg-card);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--price-color);
}

.tab-panel {
  padding: 24px;
}

.detail-content p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.75;
  margin-bottom: 16px;
}

.detail-images {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-images img {
  width: 100%;
  border-radius: var(--radius-sm);
}

.spec-table {
  width: 100%;
  border-collapse: collapse;
}

.spec-table tr {
  border-bottom: 1px solid var(--border-light);
}

.spec-table tr:last-child {
  border-bottom: none;
}

.spec-table td {
  padding: 10px 8px;
  font-size: 14px;
}

.spec-label {
  width: 100px;
  color: var(--text-light);
}

.spec-table td:last-child {
  color: var(--text-primary);
}

.no-reviews {
  text-align: center;
  color: var(--text-light);
  font-size: 14px;
  padding: 40px 0;
}

.review-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
}

.review-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.review-user {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.review-time {
  font-size: 12px;
  color: var(--text-light);
}

.review-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.related-section {
  margin-top: 32px;
}

.section-header {
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
  padding-left: 12px;
  border-left: 3px solid var(--price-color);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .product-gallery {
    width: 380px;
  }
}

@media (max-width: 768px) {
  .detail-main {
    flex-direction: column;
    padding: 16px;
    gap: 20px;
  }

  .product-gallery {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-cart {
    flex: auto;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }

  .price-current {
    font-size: 22px;
  }

  .tab-item {
    padding: 10px 14px;
  }
}
</style>