<template>
  <div class="search-page">
    <!-- 头部：关键词 + 排序 + 价格筛选 -->
    <div class="search-header">
      <div class="keyword-row">
        <span class="keyword-prefix">搜索</span>
        <template v-if="keyword">
          <span class="keyword-value">"{{ keyword }}"</span>
        </template>
        <template v-else-if="selectedCategoryName">
          <span class="keyword-value">{{ selectedCategoryName }}</span>
        </template>
        <template v-else>
          <span class="keyword-value">全部商品</span>
        </template>
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
        <div class="price-filter">
          <input
            v-model="priceMin"
            type="number"
            placeholder="最低价"
            class="price-input"
            @keyup.enter="doSearch"
          />
          <span class="price-sep">-</span>
          <input
            v-model="priceMax"
            type="number"
            placeholder="最高价"
            class="price-input"
            @keyup.enter="doSearch"
          />
          <button class="price-submit" @click="doSearch">筛选</button>
        </div>
        <span v-if="total > 0" class="results-count">共 {{ total }} 件商品</span>
      </div>
    </div>

    <div class="search-body">
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
import { searchProducts } from '@/api/search'
import { getCategoryTree } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import { SkeletonLoader } from '@ecommerce/shared'
import { ErrorState } from '@ecommerce/shared'
import { EmptyState } from '@ecommerce/shared'

const route = useRoute()

const keyword = ref('')
const results = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref(false)
const sortBy = ref('default')
const page = ref(1)
const size = 20

const selectedCategoryId = ref(null)
const priceMin = ref('')
const priceMax = ref('')
const categoryTree = ref([])
const categoryMap = ref({})

const sortOptions = [
  { key: 'default', label: '综合排序' },
  { key: 'sales', label: '销量优先' },
  { key: 'price_asc', label: '价格升序' },
  { key: 'price_desc', label: '价格降序' }
]

const totalPages = computed(() => Math.ceil(total.value / size))

const selectedCategoryName = computed(() => {
  if (!selectedCategoryId.value) return ''
  return categoryMap.value[selectedCategoryId.value] || ''
})

function buildCategoryMap(categories) {
  const map = {}
  function traverse(cats) {
    cats.forEach(cat => {
      map[cat.id] = cat.name
      if (cat.children) traverse(cat.children)
    })
  }
  traverse(categories)
  return map
}

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

async function doSearch() {
  loading.value = true
  error.value = false
  keyword.value = route.query.keyword || ''

  if (route.query.categoryId && !selectedCategoryId.value) {
    selectedCategoryId.value = route.query.categoryId
  }

  try {
    const params = {
      keyword: keyword.value,
      page: page.value,
      size: size,
      sortBy: sortBy.value === 'default' ? undefined : sortBy.value
    }
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value
    }
    if (priceMin.value) {
      params.minPrice = priceMin.value
    }
    if (priceMax.value) {
      params.maxPrice = priceMax.value
    }

    const result = await searchProducts(params)
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
  } catch (e) {
    error.value = true
    results.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function loadCategoryTree() {
  try {
    categoryTree.value = await getCategoryTree()
    categoryMap.value = buildCategoryMap(categoryTree.value)
  } catch {
    // 分类树加载失败不影响主流程
  }
}

watch(() => [route.query.keyword, route.query.categoryId], () => {
  page.value = 1
  selectedCategoryId.value = route.query.categoryId || null
  doSearch()
})

onMounted(async () => {
  await loadCategoryTree()
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
  gap: 16px;
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

.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 80px;
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

.price-submit {
  padding: 6px 16px;
  border: none;
  background: var(--price-color);
  color: #fff;
  font-size: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.price-submit:hover {
  opacity: 0.9;
}

.results-count {
  font-size: 12px;
  color: var(--text-light);
}

.search-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

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