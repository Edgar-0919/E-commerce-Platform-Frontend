<template>
  <el-breadcrumb v-if="items.length" separator="/" class="breadcrumb-nav">
    <el-breadcrumb-item v-for="(item, index) in items" :key="index">
      <router-link v-if="item.path && index < items.length - 1" :to="item.path">
        {{ item.name }}
      </router-link>
      <span v-else class="current">{{ item.name }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
    // [{ name: '首页', path: '/home' }, { name: '当前页' }]
  }
})
</script>

<style scoped>
.breadcrumb-nav {
  padding: var(--spacing-sm) 0;
  font-size: var(--font-size-sm);
}

.current {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}
</style>
