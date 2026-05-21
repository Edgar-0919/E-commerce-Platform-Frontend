<template>
  <div class="c-layout">
    <CHeader />
    <main class="main-content container">
      <router-view v-slot="{ Component, route }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <CFooter />
    <BackToTop />
  </div>
</template>

<script setup>
import CHeader from '@/components/CHeader.vue'
import CFooter from '@/components/CFooter.vue'
import BackToTop from '@/components/common/BackToTop.vue'
</script>

<style scoped>
.c-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.main-content {
  flex: 1;
  padding: var(--spacing-md) 0 var(--spacing-xxxl);
}
</style>