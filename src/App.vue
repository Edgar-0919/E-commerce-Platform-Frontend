<template>
  <div class="app">
    <Header v-if="showHeader" />
    <main class="main-content container">
      <router-view v-slot="{ Component, route }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </main>
    <Footer v-if="showFooter" />
    <BackToTop />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import BackToTop from '@/components/BackToTop.vue'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const themeStore = useThemeStore()

const showHeader = computed(() => route.meta.showHeader !== false)
const showFooter = computed(() => route.meta.showFooter !== false)
</script>

<style scoped>
.app {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--spacing-md) 0 var(--spacing-xxxl);
}
</style>
