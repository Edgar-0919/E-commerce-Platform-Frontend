<template>
  <div class="empty-state">
    <el-empty :description="description" :image-size="120">
      <template v-if="actionText" #default>
        <el-button type="primary" @click="$emit('action')">{{ actionText }}</el-button>
      </template>
    </el-empty>
  </div>
</template>

<script setup>
defineProps({
  description: { type: String, default: '暂无数据' },
  actionText: { type: String, default: '' }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  padding: var(--spacing-xxxl) 0;
  background: var(--bg-white);
  border-radius: var(--radius-lg);
}
</style>