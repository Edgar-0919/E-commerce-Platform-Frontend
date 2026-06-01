<template>
  <header class="c-header">
    <div class="header-inner container">
      <!-- Logo -->
      <div class="logo-area" @click="goTo('/home')">
        <span class="logo-text">小羊电商</span>
      </div>

      <!-- Desktop Navigation -->
      <nav class="nav-area">
        <div class="nav-links">
          <a class="nav-link" :class="{ active: isActive('/home') }" @click="goTo('/home')">首页</a>
          <a class="nav-link" :class="{ active: isActive('/search') }" @click="goTo('/search')">探索</a>
          <a class="nav-link cat-trigger-link" @mouseenter="showCategoryDropdown = true">
            分类 <span class="arrow" :class="{ open: showCategoryDropdown }">▾</span>
          </a>
        </div>

        <!-- Category Dropdown -->
        <div v-if="showCategoryDropdown" class="category-dropdown" @mouseleave="showCategoryDropdown = false">
          <div class="cat-grid">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="cat-item"
              @click="goTo(`/search?categoryId=${cat.id}`)"
            >
              <span>{{ cat.name }}</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Search -->
      <div class="search-area">
        <div class="search-box" ref="searchBoxRef">
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索商品"
            class="search-input"
            @keyup.enter="handleSearch"
            @input="handleSuggestInput"
            @focus="handleSuggestInput"
            @blur="hideSuggestDelay"
          />
          <button class="search-btn" @click="handleSearch" aria-label="搜索">
            <svg class="icon icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
        <!-- 搜索建议下拉 -->
        <div v-if="showSuggestions && suggestions.length > 0" class="suggest-dropdown">
          <div
            v-for="(text, idx) in suggestions"
            :key="idx"
            class="suggest-item"
            @mousedown.prevent="selectSuggest(text)"
          >
            <svg class="icon icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span class="suggest-text">{{ text }}</span>
          </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="actions-area">
        <button class="icon-btn" @click="toggleTheme" :aria-label="themeStore.currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'">
          <svg v-if="themeStore.currentTheme === 'dark'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          <svg v-else class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="icon-btn" @click="goTo('/user')" v-if="userStore.token" :aria-label="'个人中心'">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button class="icon-btn" @click="handleLogout" v-if="userStore.token" :aria-label="'退出登录'">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        </button>
        <button class="icon-btn" @click="goTo('/login')" v-else :aria-label="'登录'">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        <button class="icon-btn cart-btn" @click="goTo('/cart')" :aria-label="'购物车'">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
        </button>
      </div>

      <!-- Mobile Toggle -->
      <button class="mobile-toggle" @click="showMobileMenu = !showMobileMenu" :aria-label="'菜单'">
        <svg class="icon icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <template v-if="!showMobileMenu">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </template>
            <template v-else>
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </template>
          </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="mobile-menu">
      <div class="mobile-search">
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索商品"
          class="mobile-search-input"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="mobile-cats">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="mobile-cat-item"
          @click="goTo(`/search?categoryId=${cat.id}`); showMobileMenu = false"
        >
          {{ cat.name }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useThemeStore } from '@/store/theme'
import { getCartList } from '@/api/cart'
import { getCategoryTree } from '@/api/product'
import { searchSuggest } from '@/api/search'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const searchText = ref('')
const cartCount = ref(0)
const showMobileMenu = ref(false)
const showCategoryDropdown = ref(false)
const categories = ref([])
// 搜索建议
const suggestions = ref([])
const showSuggestions = ref(false)
let suggestTimer = null

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function goTo(path) {
  showCategoryDropdown.value = false
  showMobileMenu.value = false
  router.push(path)
}

function handleSearch() {
  showSuggestions.value = false
  const keyword = searchText.value.trim()
  if (keyword) {
    showMobileMenu.value = false
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`)
  }
}

// 搜索建议输入处理（防抖）
function handleSuggestInput() {
  clearTimeout(suggestTimer)
  const kw = searchText.value.trim()
  if (kw.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  suggestTimer = setTimeout(async () => {
    try {
      const result = await searchSuggest(kw)
      suggestions.value = Array.isArray(result) ? result : []
      showSuggestions.value = suggestions.value.length > 0
    } catch {
      suggestions.value = []
      showSuggestions.value = false
    }
  }, 300)
}

// 点击建议项
function selectSuggest(text) {
  searchText.value = text
  showSuggestions.value = false
  router.push(`/search?keyword=${encodeURIComponent(text)}`)
}

// 延迟隐藏建议（给点击建议项留时间）
function hideSuggestDelay() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

function toggleTheme() {
  themeStore.toggleTheme()
}

function handleLogout() {
  userStore.clearToken()
  cartCount.value = 0
  router.push('/home')
}

async function loadCartCount() {
  if (userStore.token) {
    try {
      const cartList = await getCartList()
      cartCount.value = cartList.reduce((sum, item) => sum + item.quantity, 0)
    } catch (e) {
      cartCount.value = 0
    }
  }
}

async function loadCategories() {
  try {
    categories.value = await getCategoryTree()
  } catch (e) {
    categories.value = []
  }
}

watch(() => route.path, () => {
  showMobileMenu.value = false
})

onMounted(() => {
  loadCartCount()
  loadCategories()
})
</script>

<style scoped>
/* ===== SVG 图标尺寸规范 ===== */
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.icon-sm { width: 14px; height: 14px; }
.icon-lg { width: 24px; height: 24px; }
.icon-search { width: 18px; height: 18px; }

.c-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(12px);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: var(--spacing-lg);
}

/* Logo */
.logo-area {
  cursor: pointer;
  flex-shrink: 0;
}

.logo-text {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  text-transform: uppercase;
}

/* Nav */
.nav-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  position: relative;
}

.cat-trigger-link {
  display: flex;
  align-items: center;
  gap: 2px;
}

.arrow {
  font-size: 10px;
  transition: transform var(--duration-fast);
}

.arrow.open {
  transform: rotate(180deg);
}

.nav-links {
  display: flex;
  gap: var(--spacing-md);
}

.nav-link {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px 0;
  transition: color var(--duration-fast);
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent-color);
  transition: width var(--duration-normal) var(--ease-out);
}

.nav-link.active::after {
  width: 100%;
}

/* Category Dropdown */
.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-md);
  min-width: 320px;
  z-index: var(--z-dropdown);
  margin-top: 8px;
  border: 1px solid var(--border-light);
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.cat-item {
  padding: 10px 12px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast);
  text-align: center;
}

.cat-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Search */
.search-area {
  flex: 1;
  max-width: 420px;
  position: relative;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-hover);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  overflow: hidden;
  transition: all var(--duration-fast);
}

.search-box:focus-within {
  background: var(--bg-white);
  border-color: var(--text-primary);
}

.search-input {
  flex: 1;
  height: 40px;
  padding: 0 var(--spacing-md);
  border: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-placeholder);
}

.search-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color var(--duration-fast);
}

.search-btn:hover {
  color: var(--text-primary);
}

/* 搜索建议下拉 */
.suggest-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  margin-top: 4px;
  z-index: var(--z-dropdown);
  max-height: 320px;
  overflow-y: auto;
}

.suggest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.suggest-item:hover {
  background: var(--bg-hover);
}

.suggest-icon {
  color: var(--text-placeholder);
  flex-shrink: 0;
}

.suggest-text {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

/* Actions */
.actions-area {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast);
  position: relative;
}

.icon-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.cart-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--accent-color);
  color: #fff;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  min-width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* Mobile */
.mobile-toggle {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--text-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.mobile-menu {
  display: none;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-light);
  background: var(--bg-card);
}

.mobile-search {
  margin-bottom: var(--spacing-md);
}

.mobile-search-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  background: var(--bg-hover);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  outline: none;
}

.mobile-cats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.mobile-cat-item {
  padding: 12px 8px;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.mobile-cat-item:hover {
  background: var(--bg-hover);
}

@media (max-width: 768px) {
  .nav-links,
  .search-area,
  .icon-btn {
    display: none;
  }

  .mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-menu {
    display: block;
  }

  .header-inner {
    height: 56px;
    gap: var(--spacing-sm);
  }
}
</style>