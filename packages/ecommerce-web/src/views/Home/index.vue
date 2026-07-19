<template>
  <div class="home-page">
    <!-- 分类和轮播图并排 -->
    <section class="main-section">
      <!-- 左侧分类 -->
      <div class="category-sidebar">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item-wrapper"
        >
          <div
            class="category-item"
            :class="{ active: activeCategory === cat.id }"
            @mouseenter="selectCategory(cat)"
            @mouseleave="handleCategoryLeave(cat)"
            @click="goToCategory(cat.id)"
          >
            <span>{{ cat.name }}</span>
          </div>
          <!-- 子分类横向展开，从主分类右侧引出 -->
          <div 
            v-if="activeCategory === cat.id && cat.children && cat.children.length > 0" 
            class="sub-category-dropdown"
            @mouseenter="keepCategory(cat)"
            @mouseleave="clearCategory"
          >
            <div
              v-for="subCat in cat.children"
              :key="subCat.id"
              class="sub-category-item"
              @click.stop="goToCategory(subCat.id)"
            >
              {{ subCat.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧轮播图 -->
      <div class="main-content">
        <!-- 轮播图 -->
        <div class="carousel-wrapper">
          <div
            v-for="(item, index) in carouselItems"
            :key="index"
            class="carousel-slide"
            :class="{ active: currentSlide === index }"
            @click="handleBannerClick(item)"
          >
            <img :src="item.image" :alt="item.title" />
          </div>
          <div class="carousel-indicators">
            <span
              v-for="(_, index) in carouselItems"
              :key="index"
              class="dot"
              :class="{ active: currentSlide === index }"
              @click="currentSlide = index"
            ></span>
          </div>
          <button class="carousel-btn prev" @click="prevSlide">‹</button>
          <button class="carousel-btn next" @click="nextSlide">›</button>
        </div>
      </div>
    </section>

    <!-- 商品展示 -->
    <section class="product-section">
      <div class="section-header">
        <h2 class="section-title">精选好物</h2>
        <button class="refresh-btn" @click="refreshProducts">换一批</button>
      </div>

      <SkeletonLoader v-if="loading" type="card" :count="5" />

      <EmptyState
        v-else-if="error"
        description="加载失败"
      >
        <button class="retry-btn" @click="loadProducts">重新加载</button>
      </EmptyState>

      <EmptyState
        v-else-if="products.length === 0"
        description="暂无商品"
      />

      <div v-else class="product-grid">
        <ProductCard
          v-for="product in displayProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import { SkeletonLoader } from '@ecommerce/shared'
import { EmptyState } from '@ecommerce/shared'
import { getProductPage, getCategoryTree } from '@/api/product'
import { getBanners } from '@/api/marketing'

const router = useRouter()

const currentSlide = ref(0)
const products = ref([])
const loading = ref(true)
const error = ref(false)
const refreshKey = ref(0)
const categories = ref([])
const activeCategory = ref(null)
let carouselTimer = null

// 默认轮播图（API 失败时使用）
const defaultCarouselItems = [
  {
    image: 'https://placehold.co/1200x400/2c3e50/ffffff?text=%E7%B2%BE%E9%80%89%E5%A5%BD%E7%89%A9',
    title: '精选好物',
    desc: '品质生活，从这里开始'
  }
]

const carouselItems = ref([...defaultCarouselItems])

// 随机打乱商品列表，每次刷新变化
const displayProducts = computed(() => {
  const _k = refreshKey.value
  return [...products.value].sort(() => Math.random() - 0.5).slice(0, 10)
})

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

function handleBannerClick(item) {
  if (item.linkUrl) {
    router.push(item.linkUrl)
  }
}

function refreshProducts() {
  refreshKey.value++
}

async function loadProducts() {
  loading.value = true
  error.value = false
  try {
    const result = await getProductPage({ page: 1, size: 20 })
    products.value = result.records || result.list || []
  } catch {
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
  } catch {
    // 使用默认轮播图
  }
}

async function loadCategories() {
  try {
    categories.value = await getCategoryTree()
  } catch {
    categories.value = []
  }
}

function goToCategory(categoryId) {
  router.push(`/search?categoryId=${categoryId}`)
}

function selectCategory(cat) {
  activeCategory.value = cat.id
}

function keepCategory(cat) {
  activeCategory.value = cat.id
}

function handleCategoryLeave() {
}

function clearCategory() {
  activeCategory.value = null
}

onMounted(() => {
  loadProducts()
  loadBanners()
  loadCategories()
  carouselTimer = setInterval(() => { nextSlide() }, 5000)
})

onUnmounted(() => {
  clearInterval(carouselTimer)
})
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* ===== 轮播图 ===== */
.carousel-section {
  margin-bottom: var(--spacing-lg);
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--bg-hover);
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease;
  cursor: pointer;
}

.carousel-slide.active {
  opacity: 1;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: #fff;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  width: 40px;
  height: 72px;
  border: none;
  background: rgba(0, 0, 0, 0.15);
  color: #fff;
  font-size: 28px;
  cursor: pointer;
  transition: opacity 0.2s;
  opacity: 0;
}

.carousel-wrapper:hover .carousel-btn {
  opacity: 1;
}

.carousel-btn:hover {
  background: rgba(0, 0, 0, 0.35);
}

.carousel-btn.prev {
  left: 0;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.carousel-btn.next {
  right: 0;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

/* ===== 主区域布局 ===== */
.main-section {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  align-items: stretch;
}

/* ===== 左侧分类 ===== */
.category-sidebar {
  width: 140px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item-wrapper {
  position: relative;
}

.category-sidebar .category-item {
  padding: 8px var(--spacing-sm);
  text-align: left;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  font-weight: 400;
}

.category-sidebar .category-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.category-sidebar .category-item.active {
  background: var(--bg-hover);
  color: var(--text-primary);
  font-weight: 500;
}

/* ===== 子分类横向展开（从主分类右侧引出）===== */
.sub-category-dropdown {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 8px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-sm);
  z-index: 1000;
  display: flex;
  flex-wrap: nowrap;
  gap: var(--spacing-xs);
  white-space: nowrap;
  pointer-events: auto;
  min-width: max-content;
  border: 1px solid var(--border-light);
}

.sub-category-dropdown .sub-category-item {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  transition: all var(--duration-fast);
  white-space: nowrap;
  pointer-events: auto;
}

.sub-category-dropdown .sub-category-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* ===== 右侧内容 ===== */
.main-content {
  flex: 1;
}

/* ===== 商品展示 ===== */
.product-section {
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.refresh-btn {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-md);
}

.retry-btn {
  padding: 8px 24px;
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-md);
  background: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.retry-btn:hover {
  background: var(--primary-color);
  color: #fff;
}

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 900px) {
  .carousel-wrapper {
    height: 300px;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .carousel-wrapper {
    height: 220px;
    border-radius: var(--radius-md);
  }

  .carousel-btn {
    width: 32px;
    height: 48px;
    font-size: 20px;
  }

  .section-title {
    font-size: 18px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .home-page {
    padding: 0 var(--spacing-sm);
  }
}
</style>