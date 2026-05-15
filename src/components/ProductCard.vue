<template>
  <div class="product-card" @click="goToDetail">
    <div class="product-image-wrap">
      <LazyImage
        :src="product.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=product%20photo%20white%20background&image_size=square'"
        :alt="product.name"
        class="product-image"
      />
      <div v-if="product.discount" class="discount-tag">{{ product.discount }}折</div>
    </div>
    <div class="product-info">
      <div class="product-tags">
        <span v-if="product.tag" class="tag">{{ product.tag }}</span>
      </div>
      <h3 class="product-name">{{ product.name }}</h3>
      <div class="product-price-row">
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ product.price }}</span>
        </div>
        <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
      </div>
      <div class="product-footer">
        <span class="sales">{{ product.sales || 0 }}+人好评</span>
        <span class="shop-tag" v-if="product.tag">自营</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { addToCart } from '@/api/cart'
import { ElMessage } from 'element-plus'
import LazyImage from '@/components/LazyImage.vue'

const router = useRouter()
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
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
  transition: transform var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out);
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--shadow-lg);
  z-index: 2;
}

.product-image-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #fff;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 12px;
}

.product-image :deep(img) {
  object-fit: cover;
}

.discount-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  background: var(--price-color);
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-sm);
  line-height: 1.5;
}

.product-info {
  padding: 10px;
}

.product-tags {
  margin-bottom: 4px;
}

.tag {
  display: inline-block;
  font-size: 10px;
  color: var(--price-color);
  border: 1px solid var(--price-color);
  padding: 0 4px;
  margin-right: 4px;
  border-radius: 2px;
}

.product-name {
  font-size: 14px;
  font-weight: var(--font-weight-normal);
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 39px;
}

.product-price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
}

.price-value {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  color: var(--price-color);
  line-height: 1;
  font-family: Arial, sans-serif;
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
  font-size: 12px;
  color: var(--text-light);
}

.shop-tag {
  font-size: 10px;
  color: var(--price-color);
  border: 1px solid var(--price-color);
  padding: 0 4px;
  border-radius: 2px;
}
</style>