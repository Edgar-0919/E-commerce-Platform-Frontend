<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image-wrap">
      <LazyImage
        :src="productImage"
        :alt="product.name"
        class="product-image"
      />
      <div v-if="productDiscount" class="discount-tag">{{ productDiscount }}折</div>
    </div>
    <div class="product-info">
      <div class="product-tags">
        <span v-if="product.categoryName" class="tag">{{ product.categoryName }}</span>
      </div>
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price-row">
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ displayPrice }}</span>
        </div>
        <span v-if="displayMarketPrice" class="original-price">¥{{ displayMarketPrice }}</span>
      </div>
      <div class="product-footer">
        <span v-if="product.description" class="sales">{{ product.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { LazyImage } from '@ecommerce/shared'

const router = useRouter()
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const productImage = computed(() => {
  return props.product.mainImage || (props.product.images && props.product.images[0]) || ''
})

const displayPrice = computed(() => {
  if (props.product.skus && props.product.skus.length > 0) {
    const prices = props.product.skus.map(s => s.price)
    return Math.min(...prices)
  }
  return props.product.price || 0
})

const displayMarketPrice = computed(() => {
  if (props.product.skus && props.product.skus.length > 0) {
    const marketPrices = props.product.skus.filter(s => s.marketPrice).map(s => s.marketPrice)
    if (marketPrices.length > 0) return Math.min(...marketPrices)
  }
  return props.product.originalPrice || null
})

const productDiscount = computed(() => {
  if (props.product.skus && props.product.skus.length > 0 && displayMarketPrice.value) {
    const discount = Math.round(displayPrice.value / displayMarketPrice.value * 10)
    return discount < 10 ? discount : null
  }
  return props.product.discount || null
})

function goToDetail() {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped>
.product-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.product-image-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: var(--bg-hover);
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 16px;
}

.product-image :deep(img) {
  object-fit: cover;
}

.discount-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: var(--accent-color);
  color: #fff;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
  letter-spacing: 0.02em;
}

.product-info {
  padding: 12px 14px 16px;
}

.product-tags {
  margin-bottom: 6px;
}

.tag {
  display: inline-block;
  font-size: 10px;
  color: var(--text-light);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  margin-right: 4px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.product-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 36px;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 8px;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  color: var(--accent-color);
}

.price-value {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--accent-color);
  line-height: 1;
}

.original-price {
  font-size: 12px;
  color: var(--text-placeholder);
  text-decoration: line-through;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sales {
  font-size: 11px;
  color: var(--text-light);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.shop-tag {
  font-size: 10px;
  color: var(--text-light);
  background: var(--bg-hover);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.03em;
}
</style>