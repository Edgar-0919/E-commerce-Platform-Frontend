<template>
  <el-image
    :src="src"
    :alt="alt"
    :fit="fit"
    :lazy="lazy"
    :style="{ width: width, height: height }"
    class="lazy-image"
  >
    <template #placeholder>
      <div class="image-placeholder"></div>
    </template>
    <template #error>
      <div class="image-error">
        <Picture class="error-icon" />
      </div>
    </template>
  </el-image>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'

defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  fit: { type: String, default: 'cover' },
  lazy: { type: Boolean, default: true },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' }
})
</script>

<style scoped>
.lazy-image {
  width: 100%;
  height: 100%;
}

.lazy-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: v-bind(fit);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: var(--skeleton-bg);
}

.image-error {
  width: 100%;
  height: 100%;
  background: var(--bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon {
  font-size: 32px;
  color: var(--text-placeholder);
}
</style>
