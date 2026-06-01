<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="hero-center">
        <div class="hero-carousel">
          <div
            v-for="(item, index) in carouselItems"
            :key="index"
            class="hero-slide"
            :class="{ active: currentSlide === index }"
            @click="handleBannerClick(item)"
          >
            <img :src="item.image" :alt="item.title" />
          </div>
          <div class="hero-indicators">
            <span
              v-for="(_, index) in carouselItems"
              :key="index"
              class="indicator"
              :class="{ active: currentSlide === index }"
              @click="currentSlide = index"
            ></span>
          </div>
          <button class="carousel-btn left" @click="prevSlide">‹</button>
          <button class="carousel-btn right" @click="nextSlide">›</button>
        </div>
      </div>
    </div>

    <div class="seckill-section">
      <div class="seckill-header">
        <div class="seckill-header-left">
          <span class="seckill-brand">咩咩秒杀</span>
          <span class="seckill-divider">|</span>
          <span class="seckill-timer-label">距结束</span>
          <span class="timer-block">{{ countdown.hours }}</span>
          <span class="timer-colon">:</span>
          <span class="timer-block">{{ countdown.minutes }}</span>
          <span class="timer-colon">:</span>
          <span class="timer-block">{{ countdown.seconds }}</span>
        </div>
        <span class="more-link" @click="goToCategory('seckill')">更多秒杀 ›</span>
      </div>
      <div class="seckill-body">
        <div
          v-for="item in seckillProducts"
          :key="item.id"
          class="seckill-item"
          @click="goToProduct(item.id)"
        >
          <LazyImage :src="item.image" :alt="item.name" class="seckill-img" />
          <div class="seckill-price">
            <span class="seckill-symbol">¥</span>
            <span class="seckill-value">{{ item.price }}</span>
          </div>
          <div class="seckill-original">¥{{ item.originalPrice }}</div>
        </div>
      </div>
    </div>

    <ErrorState v-if="error" @retry="loadProducts" />

    <template v-else>
      <div v-for="section in productSections" :key="section.title" class="product-section">
        <div class="section-header">
          <h2 class="section-title">{{ section.title }}</h2>
          <span class="refresh-btn" @click="refreshSection">换一批</span>
        </div>

        <SkeletonLoader v-if="loading" type="card" :count="5" />

        <EmptyState
          v-else-if="section.products.length === 0"
          description="暂无商品"
        />

        <div v-else class="product-grid">
          <ProductCard
            v-for="product in section.products"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import LazyImage from '@/components/common/LazyImage.vue'
import { getProductPage } from '@/api/product'
import { getBanners } from '@/api/marketing'

// 默认轮播图（API失败时使用）
const defaultCarouselItems = [
  {
    image: 'https://placehold.co/1200x400/3498db/ffffff?text=精选好物',
    title: '精选好物',
    desc: '品质生活，从这里开始'
  }
]

const carouselItems = ref([...defaultCarouselItems])
const router = useRouter()

const currentSlide = ref(0)
const products = ref([])
const loading = ref(true)
const error = ref(false)
const refreshKey = ref(0)
let carouselTimer = null

const countdown = reactive({ hours: '00', minutes: '00', seconds: '00' })
let countdownTimer = null

// TODO: 秒杀商品应从 marketing-service 的 /api/marketing/promotion?type=SECKILL 接口动态加载
// 当前硬编码为占位数据，实际上线前需替换为 API 调用
const seckillProducts = [
  { id: 101, name: '蓝牙耳机', price: 99, originalPrice: 299, image: 'https://placehold.co/200x200/2c3e50/ffffff?text=蓝牙耳机' },
  { id: 102, name: '智能手表', price: 199, originalPrice: 599, image: 'https://placehold.co/200x200/27ae60/ffffff?text=智能手表' },
  { id: 103, name: '充电宝', price: 49, originalPrice: 149, image: 'https://placehold.co/200x200/e67e22/ffffff?text=充电宝' },
  { id: 104, name: '机械键盘', price: 129, originalPrice: 399, image: 'https://placehold.co/200x200/8e44ad/ffffff?text=机械键盘' },
  { id: 105, name: '运动鞋', price: 159, originalPrice: 459, image: 'https://placehold.co/200x200/c0392b/ffffff?text=运动鞋' }
]

const productSections = computed(() => {
  const _k = refreshKey.value
  const list = products.value
  if (list.length === 0) return []
  const shuffled = [...list].sort(() => Math.random() - 0.5)
  return [
    { title: '猜你喜欢', category: 'recommend', products: shuffled.slice(0, 10) }
  ]
})

function padZero(n) { return String(n).padStart(2, '0') }

function updateCountdown() {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  const diff = Math.max(0, end - now)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  countdown.hours = padZero(h)
  countdown.minutes = padZero(m)
  countdown.seconds = padZero(s)
}

function prevSlide() {
  const len = carouselItems.value.length
  if (len <= 1) return
  currentSlide.value = currentSlide.value === 0 ? len - 1 : currentSlide.value - 1
}

function nextSlide() {
  const len = carouselItems.value.length
  if (len <= 1) return
  currentSlide.value = currentSlide.value === len - 1 ? 0 : currentSlide.value + 1
}

function goTo(path) {
  router.push(path)
}

function goToProduct(id) {
  router.push(`/product/${id}`)
}

function goToCategory(category) {
  router.push(`/search?keyword=${category}`)
}

function handleSearch(keyword) {
  router.push(`/search?keyword=${keyword}`)
}

function handleBannerClick(item) {
  if (item.linkUrl) {
    router.push(item.linkUrl)
  }
}

function refreshSection() {
  refreshKey.value++
}

async function loadProducts() {
  loading.value = true
  error.value = false
  try {
    const result = await getProductPage({ page: 1, size: 15 })
    products.value = result.records || result.list || []
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadBanners() {
  try {
    const result = await getBanners('home')
    if (Array.isArray(result) && result.length > 0) {
      carouselItems.value = result.map(item => ({
        image: item.image,
        title: item.title || '',
        desc: item.description || '',
        linkUrl: item.linkUrl
      }))
    }
  } catch (e) {
    console.warn('加载轮播图失败，使用默认数据:', e)
  }
}

onMounted(() => {
  loadProducts()
  loadBanners()
  carouselTimer = setInterval(() => { nextSlide() }, 5000)
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(carouselTimer)
  clearInterval(countdownTimer)
})
</script>

<style scoped>
.home-page {
  padding: 0;
}

.hero-section {
  display: flex;
  gap: 0;
  margin-bottom: var(--spacing-sm);
  height: 460px;
}

.hero-left {
  width: 200px;
  background: var(--bg-white);
  flex-shrink: 0;
  padding: 4px 0;
  overflow-y: auto;
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}

.cat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 16px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  transition: all var(--duration-fast);
  line-height: 1.6;
}

.cat-item:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.cat-arrow {
  color: var(--text-placeholder);
  font-size: 14px;
  font-weight: var(--font-weight-bold);
}

.hero-center {
  flex: 1;
  min-width: 0;
}

.hero-carousel {
  position: relative;
  width: 100%;
  height: 460px;
  overflow: hidden;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

.hero-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s var(--ease-in-out);
}

.hero-slide.active {
  opacity: 1;
}

.hero-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-indicators {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.75);
}

.indicator.active {
  width: 24px;
  border-radius: 5px;
  background: #fff;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40px;
  height: 72px;
  background: rgba(0, 0, 0, 0.08);
  color: #fff;
  border: none;
  font-size: 26px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--duration-fast);
  opacity: 0;
}

.hero-carousel:hover .carousel-btn {
  opacity: 1;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.3);
}

.carousel-btn.left {
  left: 0;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.carousel-btn.right {
  right: 0;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.quick-entries {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
}

.quick-entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 12px;
  transition: transform var(--duration-fast);
}

.quick-entry-item:hover {
  transform: translateY(-2px);
}

.quick-entry-icon {
  font-size: 28px;
  line-height: 1;
}

.quick-entry-name {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.seckill-section {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-sm);
  overflow: hidden;
}

.seckill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(90deg, var(--bg-hover), var(--bg-page));
}

.seckill-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.seckill-brand {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
}

.seckill-divider {
  color: var(--text-placeholder);
  font-size: var(--font-size-sm);
}

.seckill-timer-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.timer-block {
  background: #3c3c3c;
  color: #fff;
  padding: 2px 7px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  border-radius: 2px;
  min-width: 24px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.timer-colon {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: #3c3c3c;
}

.more-link {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  cursor: pointer;
  transition: color var(--duration-fast);
}

.more-link:hover {
  color: var(--primary-color);
}

.seckill-body {
  display: flex;
}

.seckill-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-md) var(--spacing-xs) 60px;
  cursor: pointer;
  border-right: 1px solid var(--border-light);
  transition: transform var(--duration-fast);
}

.seckill-item:last-child {
  border-right: none;
}

.seckill-item:hover {
  transform: translateY(-4px);
}

.seckill-img {
  width: 120px;
  height: 120px;
  margin: 0 auto 8px;
}

.seckill-img :deep(img) {
  object-fit: contain;
}

.seckill-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0;
  margin-bottom: 4px;
}

.seckill-symbol {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
}

.seckill-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  line-height: 1;
}

.seckill-original {
  font-size: 11px;
  color: var(--text-placeholder);
  text-decoration: line-through;
}

.product-section {
  margin-bottom: var(--spacing-sm);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  position: relative;
  padding-left: 14px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 2px;
}

.refresh-btn {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color var(--duration-fast);
}

.refresh-btn::before {
  content: '↻';
  font-size: 14px;
}

.refresh-btn:hover {
  color: var(--primary-color);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  background: var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

@media (max-width: 1200px) {
  .hero-section {
    height: 400px;
  }

  .hero-carousel {
    height: 400px;
  }
}

@media (max-width: 1024px) {
  .hero-left {
    display: none;
  }

  .hero-carousel {
    border-radius: var(--radius-lg);
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 240px;
  }

  .hero-carousel {
    height: 240px;
    border-radius: var(--radius-lg);
  }

  .carousel-btn {
    width: 32px;
    height: 48px;
    font-size: 20px;
  }

  .quick-entries {
    overflow-x: auto;
    justify-content: flex-start;
    gap: 4px;
    padding: var(--spacing-sm);
  }

  .quick-entry-item {
    flex-shrink: 0;
    padding: 4px 8px;
  }

  .quick-entry-icon {
    font-size: 22px;
  }

  .seckill-header {
    padding: var(--spacing-sm);
  }

  .seckill-body {
    flex-wrap: wrap;
  }

  .seckill-item {
    flex: none;
    width: 33.33%;
    border-bottom: 1px solid var(--border-light);
  }

  .seckill-img {
    width: 80px;
    height: 80px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-section {
    height: 180px;
  }

  .hero-carousel {
    height: 180px;
  }

  .seckill-item {
    width: 50%;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>