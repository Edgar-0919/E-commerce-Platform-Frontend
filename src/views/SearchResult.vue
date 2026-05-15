<template>
  <div class="search-page">
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
            @click="sortBy = opt.key; search()"
          >
            {{ opt.label }}
            <template v-if="opt.key === 'price_asc' && sortBy === 'price_asc'">↑</template>
            <template v-if="opt.key === 'price_desc' && sortBy === 'price_desc'">↓</template>
          </span>
        </div>
        <span v-if="results.length" class="results-count">共 {{ results.length }} 件商品</span>
      </div>
    </div>

    <SkeletonLoader v-if="loading" type="card" :count="8" />

    <ErrorState v-else-if="error" @retry="search" />

    <EmptyState
      v-else-if="results.length === 0"
      description="未找到相关商品"
      actionText="返回首页"
      @action="goHome"
    />

    <div v-else class="search-results">
      <div class="product-grid">
        <ProductCard v-for="product in results" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchProducts } from '@/api/search'
import { getProductPage } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'
import { mockProducts } from '@/mock/home'

const route = useRoute()
const router = useRouter()

const keyword = ref('')
const results = ref([])
const loading = ref(true)
const error = ref(false)
const sortBy = ref('default')

const sortOptions = [
  { key: 'default', label: '综合排序' },
  { key: 'sales', label: '销量优先' },
  { key: 'price_asc', label: '价格升序' },
  { key: 'price_desc', label: '价格降序' }
]

async function search() {
  loading.value = true
  error.value = false
  keyword.value = route.query.keyword || ''
  try {
    const params = { keyword: keyword.value, page: 1, size: 20 }
    if (sortBy.value !== 'default') {
      params.sort = sortBy.value
    }
    const result = await searchProducts(params)
    results.value = result.list || []
  } catch (e) {
    try {
      const result = await getProductPage({ pageNum: 1, pageSize: 20, keyword: keyword.value })
      results.value = result.list || mockProducts
    } catch {
      results.value = mockProducts
    }
  } finally {
    loading.value = false
  }
}

function goHome() {
  router.push('/home')
}

watch(() => route.query.keyword, () => {
  search()
})

onMounted(() => {
  search()
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

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .search-header {
    padding: 12px;
    border-radius: 0;
    margin-bottom: 0;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
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