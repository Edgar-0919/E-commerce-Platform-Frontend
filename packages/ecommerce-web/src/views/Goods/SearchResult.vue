<template>
  <div class="search-page">
    <!-- 头部：关键词 + 排序 -->
    <div class="search-header">
      <div class="keyword-row">
        <span class="keyword-prefix">搜索</span>
        <span v-if="keyword" class="keyword-value">"{{ keyword }}"</span>
        <span v-else class="keyword-value">全部商品</span>
      </div>
      <div class="sort-row">
        <div class="sort-bar">
          <span
            v-for="opt in sortOptions"
            :key="opt.key"
            class="sort-item"
            :class="{ active: sortBy === opt.key }"
            @click="sortBy = opt.key; doSearch()"
          >
            {{ opt.label }}
            <template v-if="sortBy === 'price_asc' && opt.key === 'price_asc'">↑</template>
            <template v-if="sortBy === 'price_desc' && opt.key === 'price_desc'">↓</template>
          </span>
        </div>
        <span v-if="total > 0" class="results-count">共 {{ total }} 件商品</span>
      </div>
    </div>

    <div class="search-body">
      <!-- 筛选侧栏 -->
      <aside class="filter-sidebar">
        <div class="filter-section">
          <h4 class="filter-title">商品分类</h4>
          <div
            v-for="cat in filterCategories"
            :key="cat.id"
            class="filter-item"
            :class="{ active: selectedCategoryId === String(cat.id) }"
            @click="toggleCategory(cat.id)"
          >
            <span class="filter-label">类别 {{ cat.id }}</span>
            <span class="filter-count">({{ cat.count }})</span>
          </div>
          <div v-if="filterCategories.length === 0" class="filter-empty">暂无分类</div>
        </div>

        <div class="filter-section">
          <h4 class="filter-title">品牌</h4>
          <div
            v-for="brand in filterBrands"
            :key="brand.id"
            class="filter-item"
            :class="{ active: selectedBrandId === String(brand.id) }"
            @click="toggleBrand(brand.id)"
          >
            <span class="filter-label">品牌 {{ brand.id }}</span>
            <span class="filter-count">({{ brand.count }})</span>
          </div>
          <div v-if="filterBrands.length === 0" class="filter-empty">暂无品牌</div>
        </div>

        <div class="filter-section">
          <h4 class="filter-title">价格区间</h4>
          <div class="price-range">
            <input
              v-model="priceMin"
              type="number"
              placeholder="最低价"
              class="price-input"
              @change="doSearch"
            />
            <span class="price-sep">-</span>
            <input
              v-model="priceMax"
              type="number"
              placeholder="最高价"
              class="price-input"
              @change="doSearch"
            />
          </div>
        </div>

        <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">清除筛选</button>
      </aside>

      <!-- 结果区 -->
      <div class="search-main">
        <SkeletonLoader v-if="loading" type="card" :count="8" />

        <ErrorState v-else-if="error" @retry="doSearch" />

        <EmptyState
          v-else-if="results.length === 0"
          description="未找到相关商品"
          actionText="返回首页"
          @action="$router.push('/home')"
        />

        <template v-else>
          <div class="product-grid">
            <ProductCard v-for="product in results" :key="product.id" :product="product" />
          </div>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="page-btn"
              :disabled="page === 1"
              @click="page--; doSearch()"
            >上一页</button>
            <span
              v-for="p in visiblePages"
              :key="p"
              class="page-num"
              :class="{ active: p === page }"
              @click="page = p; doSearch()"
            >{{ p }}</span>
            <button
              class="page-btn"
              :disabled="page >= totalPages"
              @click="page++; doSearch()"
            >下一页</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchProducts, searchFilters } from '@/api/search'
import { getProductPage } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const route = useRoute()

const keyword = ref('')
const results = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref(false)
const sortBy = ref('default')
const page = ref(1)
const size = 20

// 筛选条件
const selectedCategoryId = ref(null)
const selectedBrandId = ref(null)
const priceMin = ref('')
const priceMax = ref('')
const filterCategories = ref([])
const filterBrands = ref([])

const sortOptions = [
  { key: 'default', label: '综合排序' },
  { key: 'sales', label: '销量优先' },
  { key: 'price_asc', label: '价格升序' },
  { key: 'price_desc', label: '价格降序' }
]

const totalPages = computed(() => Math.ceil(total.value / size))
const hasActiveFilters = computed(() =>
  selectedCategoryId.value || selectedBrandId.value || priceMin.value || priceMax.value
)

// 显示页码（最多7个）
const visiblePages = computed(() => {
  const tp = totalPages.value
  if (tp <= 7) return Array.from({ length: tp }, (_, i) => i + 1)
  const pages = []
  if (page.value <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...')
    pages.push(tp)
  } else if (page.value >= tp - 3) {
    pages.push(1)
    pages.push('...')
    for (let i = tp - 4; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('...')
    pages.push(page.value - 1)
    pages.push(page.value)
    pages.push(page.value + 1)
    pages.push('...')
    pages.push(tp)
  }
  return pages
})

function toggleCategory(id) {
  selectedCategoryId.value = selectedCategoryId.value === String(id) ? null : String(id)
  page.value = 1
  doSearch()
}

function toggleBrand(id) {
  selectedBrandId.value = selectedBrandId.value === String(id) ? null : String(id)
  page.value = 1
  doSearch()
}

function clearFilters() {
  selectedCategoryId.value = null
  selectedBrandId.value = null
  priceMin.value = ''
  priceMax.value = ''
  page.value = 1
  doSearch()
}

async function doSearch() {
  loading.value = true
  error.value = false
  keyword.value = route.query.keyword || ''

  // 处理从 header 分类导航传来的 categoryId
  if (route.query.categoryId && !selectedCategoryId.value) {
    selectedCategoryId.value = route.query.categoryId
  }

  try {
    const params = {
      keyword: keyword.value,
      page: page.value,
      size: size
    }
    // 排序参数：传给后端的 sortField 使用复合格式
    if (sortBy.value !== 'default') {
      params.sortField = sortBy.value
    }
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value
    }
    if (selectedBrandId.value) {
      params.brandId = selectedBrandId.value
    }
    if (priceMin.value) {
      params.minPrice = priceMin.value
    }
    if (priceMax.value) {
      params.maxPrice = priceMax.value
    }

    const result = await searchProducts(params)
    // 后端返回 { records: [...], total: N }
    if (result && result.records) {
      results.value = result.records
      total.value = result.total || result.records.length
    } else if (Array.isArray(result)) {
      results.value = result
      total.value = result.length
    } else {
      results.value = []
      total.value = 0
    }

    // 加载筛选聚合数据
    loadFilters()
  } catch (e) {
    // ES 不可用时降级到商品列表接口
    try {
      const fallback = await getProductPage({ page: page.value, size: size, keyword: keyword.value })
      results.value = fallback.records || fallback.list || []
      total.value = fallback.total || results.value.length
    } catch {
      results.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}

async function loadFilters() {
  try {
    const filters = await searchFilters(keyword.value)
    if (filters) {
      filterCategories.value = filters.categories || []
      filterBrands.value = filters.brands || []
    }
  } catch {
    // 筛选条件加载失败不影响主流程
  }
}

// 监听路由 query 变化重新搜索
watch(() => [route.query.keyword, route.query.categoryId], () => {
  page.value = 1
  selectedCategoryId.value = route.query.categoryId || null
  doSearch()
})

onMounted(() => {
  doSearch()
})
</script>

<style scoped>
.search-page {
  padding: 0;
}

.search-header {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 16px;
}

.keyword-row {
  margin-bottom: 12px;
}

.keyword-prefix {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  margin-right: 4px;
}

.keyword-value {
  font-size: 16px;
  color: var(--price-color);
  font-weight: var(--font-weight-bold);
}

.sort-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-bar {
  display: flex;
  gap: 0;
}

.sort-item {
  padding: 6px 16px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
  user-select: none;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.sort-item:hover {
  color: var(--price-color);
  background: var(--price-bg);
}

.sort-item.active {
  color: #fff;
  background: var(--price-color);
  font-weight: var(--font-weight-semibold);
}

.results-count {
  font-size: 12px;
  color: var(--text-light);
}

/* 主体：侧栏 + 结果 */
.search-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* 筛选侧栏 */
.filter-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  position: sticky;
  top: 80px;
}

.filter-section {
  margin-bottom: 20px;
}

.filter-title {
  font-size: 14px;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
}

.filter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast);
}

.filter-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.filter-item.active {
  color: var(--price-color);
  background: var(--price-bg);
  font-weight: var(--font-weight-medium);
}

.filter-count {
  font-size: 11px;
  color: var(--text-placeholder);
}

.filter-empty {
  font-size: 12px;
  color: var(--text-placeholder);
  padding: 4px 8px;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  flex: 1;
  width: 0;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-primary);
  background: var(--bg-page);
  outline: none;
}

.price-input:focus {
  border-color: var(--text-primary);
}

.price-sep {
  color: var(--text-placeholder);
  font-size: 12px;
}

.clear-filters-btn {
  width: 100%;
  padding: 8px 0;
  border: 1px solid var(--border-color);
  background: var(--bg-page);
  color: var(--text-secondary);
  font-size: 13px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.clear-filters-btn:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

/* 搜索结果区 */
.search-main {
  flex: 1;
  min-width: 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px 0;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: all var(--duration-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--text-primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-num {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
  transition: all var(--duration-fast);
}

.page-num:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.page-num.active {
  background: var(--text-primary);
  color: #fff;
  border-color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .filter-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .search-header {
    padding: 12px;
    border-radius: 0;
    margin-bottom: 8px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .sort-item {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .keyword-prefix,
  .keyword-value {
    font-size: 14px;
  }
}
</style>