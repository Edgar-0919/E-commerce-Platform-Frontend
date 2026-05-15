<template>
  <!-- 商品卡片骨架 -->
  <div v-if="type === 'card'" class="skeleton-cards">
    <div v-for="i in count" :key="i" class="skeleton-card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="image" style="width:100%;padding-top:100%;border-radius:var(--radius-md)" />
          <div style="padding:var(--spacing-md)">
            <el-skeleton-item variant="text" style="width:60%;margin-top:var(--spacing-xs)" />
            <el-skeleton-item variant="text" style="width:40%" />
            <el-skeleton-item variant="text" style="width:35%;height:24px;margin-top:var(--spacing-xs)" />
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>

  <!-- 列表骨架 -->
  <div v-else-if="type === 'list'" class="skeleton-list">
    <div v-for="i in count" :key="i" class="skeleton-row">
      <el-skeleton animated>
        <template #template>
          <div style="display:flex;align-items:center;gap:var(--spacing-md);padding:var(--spacing-md)">
            <el-skeleton-item variant="image" style="width:100px;height:100px;border-radius:var(--radius-md);flex-shrink:0" />
            <div style="flex:1">
              <el-skeleton-item variant="text" style="width:70%" />
              <el-skeleton-item variant="text" style="width:40%" />
              <el-skeleton-item variant="text" style="width:25%;height:24px;margin-top:var(--spacing-xs)" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>

  <!-- 详情骨架 -->
  <div v-else-if="type === 'detail'" class="skeleton-detail">
    <el-skeleton animated>
      <template #template>
        <div style="display:flex;gap:var(--spacing-xxl);padding:var(--spacing-xl)">
          <el-skeleton-item variant="image" style="width:450px;height:450px;border-radius:var(--radius-lg);flex-shrink:0" />
          <div style="flex:1">
            <el-skeleton-item variant="text" style="width:80%;height:28px" />
            <el-skeleton-item variant="text" style="width:60%" />
            <el-skeleton-item variant="text" style="width:40%;height:36px;margin-top:var(--spacing-md)" />
            <el-skeleton-item variant="text" style="margin-top:var(--spacing-xl)" v-for="i in 5" :key="i" />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>

  <!-- 文本骨架 -->
  <div v-else class="skeleton-text">
    <el-skeleton :rows="count" animated />
  </div>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'text', validator: v => ['card', 'list', 'detail', 'text'].includes(v) },
  count: { type: Number, default: 4 }
})
</script>

<style scoped>
.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.skeleton-card {
  background: var(--bg-white);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.skeleton-row {
  background: var(--bg-white);
  border-radius: var(--radius-md);
}

@media (max-width: 1200px) {
  .skeleton-cards { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .skeleton-cards { grid-template-columns: repeat(2, 1fr); }
  .skeleton-detail :deep(div) { flex-direction: column; }
}

@media (max-width: 480px) {
  .skeleton-cards { grid-template-columns: 1fr; }
}
</style>
