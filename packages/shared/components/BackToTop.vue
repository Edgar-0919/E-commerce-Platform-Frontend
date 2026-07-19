<template>
  <el-backtop :right="40" :bottom="60" :visibility-height="300">
    <div v-if="variant === 'styled'" class="backtop-btn">
      <svg class="backtop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </div>
  </el-backtop>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'styled', validator: v => ['styled', 'bare'].includes(v) }
})
</script>

<style scoped>
.backtop-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-fast);
}

.backtop-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.backtop-icon {
  width: 20px;
  height: 20px;
}

[data-theme="dark"] .backtop-btn {
  background: var(--accent-color);
}

[data-theme="dark"] .backtop-btn:hover {
  background: var(--accent-dark);
}
</style>