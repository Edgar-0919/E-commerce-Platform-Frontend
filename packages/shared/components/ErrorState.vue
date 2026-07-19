<template>
  <div class="error-state">
    <el-result icon="error" :title="title" :sub-title="subTitle">
      <template v-if="showRetry" #extra>
        <el-button type="primary" @click="$emit('retry')">重新加载</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '加载失败' },
  subTitle: { type: String, default: '请检查网络连接后重试' },
  showRetry: { type: Boolean, default: true }
})

defineEmits(['retry'])
</script>

<style scoped>
.error-state {
  padding: var(--spacing-xxxl) 0;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
}
</style>