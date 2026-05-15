<template>
  <header class="header" @mouseleave="showCategoryDropdown = false">
    <div class="site-nav">
      <div class="container">
        <div class="site-nav-left">
          <span class="location" @click="handleLocation">
            <Location class="loc-icon" />
            <span>杭州</span>
          </span>
        </div>
        <div class="site-nav-right">
          <template v-if="!isLoggedIn">
            <span class="site-nav-link" @click="goTo('/login')">请登录</span>
            <span class="site-nav-link" @click="goTo('/register')">免费注册</span>
          </template>
          <template v-else>
            <span class="site-nav-link" @click="goTo('/user')">{{ userStore.userInfo?.nickname || userStore.userInfo?.username || '用户' }}</span>
            <span class="site-nav-link" @click="handleLogout">退出</span>
          </template>
          <span class="site-nav-link" @click="goTo('/order')">我的淘宝</span>
          <span class="site-nav-link" @click="goTo('/cart')">
            购物车
            <span v-if="cartCount > 0" class="site-nav-cart-count">{{ cartCount }}</span>
          </span>
          <span class="site-nav-link">收藏夹</span>
          <span class="site-nav-link">手机版</span>
          <span class="site-nav-link">淘宝网</span>
          <span class="site-nav-link">商家支持</span>
          <span class="site-nav-link">网站导航</span>
          <button class="theme-toggle" @click="themeStore.toggleTheme()" :aria-label="themeStore.currentTheme === 'light' ? '切换深色模式' : '切换浅色模式'">
            <Sunny v-if="themeStore.currentTheme === 'light'" />
            <Moon v-else />
          </button>
        </div>
      </div>
    </div>

    <div class="header-main">
      <div class="container">
        <div class="logo" @click="goTo('/home')">
          <span class="logo-text">小羊电商</span>
        </div>

        <div class="search-wrapper">
          <div class="search-box">
            <input
              v-model="searchText"
              type="text"
              placeholder="iPhone 15 Pro Max"
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              <Search class="search-icon" />
            </button>
          </div>
          <div class="search-hot">
            <span v-for="tag in hotSearchTags" :key="tag" class="hot-word" @click="handleHotSearch(tag)">{{ tag }}</span>
          </div>
        </div>

        <div class="cart-btn" @click="goTo('/cart')">
          <ShoppingCart class="cart-icon" />
          <span class="cart-text">购物车</span>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
        </div>

        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <Menu v-if="!showMobileMenu" />
          <Close v-else />
        </button>
      </div>
    </div>

    <nav class="nav-bar">
      <div class="container">
        <div
          class="category-trigger"
          @mouseenter="showCategoryDropdown = true"
        >
          <span>全部商品分类</span>
        </div>
        <div class="nav-items">
          <span
            v-for="item in navItems"
            :key="item.name"
            class="nav-item"
            @click="goTo(item.path)"
          >
            {{ item.name }}
          </span>
        </div>
      </div>
    </nav>

    <Transition name="category-drop">
      <div
        v-if="showCategoryDropdown"
        class="category-dropdown"
        @mouseenter="showCategoryDropdown = true"
        @mouseleave="showCategoryDropdown = false"
      >
        <div class="container">
          <div class="dropdown-inner">
            <div class="dropdown-left">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="cat-item"
                @click="goTo(`/home?category=${cat.name}`)"
              >
                <span>{{ cat.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="slide-down">
      <div v-if="showMobileMenu" class="mobile-overlay" @click.self="showMobileMenu = false">
        <div class="mobile-menu">
          <div class="mobile-search">
            <div class="search-box">
              <input
                v-model="searchText"
                type="text"
                placeholder="搜索商品"
                class="search-input"
                @keyup.enter="handleSearch; showMobileMenu = false"
              />
              <button class="search-btn" @click="handleSearch; showMobileMenu = false">
                <Search />
              </button>
            </div>
          </div>
          <div class="mobile-nav">
            <span
              v-for="item in navItems"
              :key="item.name"
              class="mobile-nav-item"
              @click="goTo(item.path); showMobileMenu = false"
            >
              {{ item.name }}
            </span>
          </div>
          <div class="mobile-actions">
            <template v-if="!isLoggedIn">
              <span class="mobile-action-item" @click="goTo('/login'); showMobileMenu = false">登录</span>
              <span class="mobile-action-item" @click="goTo('/register'); showMobileMenu = false">注册</span>
            </template>
            <template v-else>
              <span class="mobile-action-item" @click="goTo('/user'); showMobileMenu = false">个人中心</span>
              <span class="mobile-action-item" @click="goTo('/order'); showMobileMenu = false">我的订单</span>
            </template>
            <button class="theme-toggle mobile-theme" @click="themeStore.toggleTheme()">
              <Sunny v-if="themeStore.currentTheme === 'light'" />
              <Moon v-else />
              {{ themeStore.currentTheme === 'light' ? '深色模式' : '浅色模式' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, User, ShoppingCart, Menu, Close, Sunny, Moon, Location, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { getCartList } from '@/api/cart'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()
const searchText = ref('')
const cartCount = ref(0)
const showMobileMenu = ref(false)
const showCategoryDropdown = ref(false)

const isLoggedIn = computed(() => !!userStore.token)

const hotSearchTags = ['iPhone 15', 'MacBook', '索尼耳机', '戴森吸尘器', '茅台']

const navItems = [
  { name: '天猫', path: '/home?category=tmall' },
  { name: '聚划算', path: '/home?category=jhs' },
  { name: '天猫超市', path: '/home?category=supermarket' },
  { name: '淘抢购', path: '/home?category=flash' },
  { name: '司法拍卖', path: '/home?category=auction' },
  { name: '飞猪旅行', path: '/home?category=travel' }
]

const categories = [
  { id: 1, name: '手机通讯' },
  { id: 2, name: '电脑办公' },
  { id: 3, name: '数码影音' },
  { id: 4, name: '家用电器' },
  { id: 5, name: '家居家装' },
  { id: 6, name: '服饰鞋包' },
  { id: 7, name: '美妆个护' },
  { id: 8, name: '食品生鲜' },
  { id: 9, name: '母婴玩具' },
  { id: 10, name: '运动户外' },
  { id: 11, name: '图书文娱' },
  { id: 12, name: '医药健康' },
  { id: 13, name: '汽车用品' },
  { id: 14, name: '钟表珠宝' }
]

function goTo(path) {
  router.push(path)
}

function handleSearch() {
  const kw = searchText.value.trim()
  if (kw) {
    router.push(`/search?keyword=${kw}`)
    searchText.value = ''
  }
}

function handleHotSearch(tag) {
  router.push(`/search?keyword=${tag}`)
}

function handleLocation() {
  ElMessage.info('地址选择功能开发中')
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.clearToken()
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}

function toggleMobileMenu() {
  showMobileMenu.value = !showMobileMenu.value
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

watch(() => route.path, () => {
  showMobileMenu.value = false
})

onMounted(() => {
  loadCartCount()
})
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--bg-white);
}

.site-nav {
  background: #f5f5f5;
  height: 35px;
  line-height: 35px;
}

.site-nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 35px;
}

.site-nav-left {
  display: flex;
  align-items: center;
}

.location {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  font-size: 12px;
  color: #6c6c6c;
}

.location:hover {
  color: var(--primary-color);
}

.loc-icon {
  font-size: 14px;
  color: var(--primary-color);
}

.site-nav-right {
  display: flex;
  align-items: center;
}

.site-nav-link {
  font-size: 12px;
  color: #6c6c6c;
  cursor: pointer;
  padding: 0 10px;
  position: relative;
  white-space: nowrap;
  transition: color var(--duration-fast);
}

.site-nav-link + .site-nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 12px;
  background: #d0d0d0;
}

.site-nav-link:hover {
  color: var(--primary-color);
}

.site-nav-cart-count {
  color: var(--primary-color);
  font-weight: var(--font-weight-bold);
}

.theme-toggle {
  background: none;
  border: none;
  color: #6c6c6c;
  cursor: pointer;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  position: relative;
}

.theme-toggle::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 12px;
  background: #d0d0d0;
}

.theme-toggle:hover {
  color: var(--primary-color);
}

.header-main {
  background: var(--bg-white);
  padding: 24px 0;
}

.header-main .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 60px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 2px;
  user-select: none;
}

.search-wrapper {
  flex: 1;
  max-width: 630px;
  margin: 0 40px 0 0;
}

.search-box {
  display: flex;
  border: 2px solid var(--primary-color);
  border-radius: 20px;
  overflow: hidden;
  height: 36px;
}

.search-input {
  flex: 1;
  padding: 0 16px;
  border: none;
  outline: none;
  font-size: var(--font-size-sm);
  background: var(--bg-white);
  color: var(--text-primary);
  border-radius: 20px 0 0 20px;
}

.search-input::placeholder {
  color: var(--text-placeholder);
}

.search-btn {
  width: 72px;
  background: var(--primary-color);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
  border-radius: 0 18px 18px 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.search-icon {
  font-size: 20px;
}

.search-btn:hover {
  background: var(--primary-dark);
}

.search-hot {
  margin-top: 8px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hot-word {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  cursor: pointer;
  line-height: 16px;
  transition: color var(--duration-fast);
}

.hot-word:hover {
  color: var(--primary-color);
}

.cart-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  position: relative;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  flex-shrink: 0;
  transition: all var(--duration-fast);
}

.cart-btn:hover {
  border-color: var(--primary-color);
  background: var(--primary-bg);
  color: var(--primary-color);
}

.cart-icon {
  font-size: 18px;
}

.cart-text {
  font-size: var(--font-size-sm);
}

.cart-badge {
  position: absolute;
  top: -8px;
  left: 24px;
  background: var(--primary-color);
  color: #fff;
  font-size: 11px;
  padding: 0 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 16px;
  height: 16px;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 24px;
}

.nav-bar {
  background: var(--bg-white);
  border-bottom: 1px solid var(--border-color);
}

.nav-bar .container {
  display: flex;
  align-items: center;
}

.category-trigger {
  width: 200px;
  background: var(--primary-color);
  color: #fff;
  padding: 14px 16px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  flex-shrink: 0;
  text-align: center;
  line-height: 1;
}

.nav-items {
  display: flex;
  flex: 1;
  padding-left: 24px;
  gap: 4px;
}

.nav-item {
  padding: 14px 18px;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--duration-fast);
  line-height: 1;
}

.nav-item:hover {
  color: var(--primary-color);
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-white);
  border: 1px solid var(--border-color);
  border-top: none;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.dropdown-inner {
  display: flex;
  padding: 8px 0;
}

.dropdown-left {
  width: 200px;
  border-right: 1px solid var(--border-light);
}

.cat-item {
  padding: 10px 16px;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.cat-item:hover {
  background: var(--primary-bg);
  color: var(--primary-color);
}

.category-drop-enter-active,
.category-drop-leave-active {
  transition: opacity 0.15s ease;
}

.category-drop-enter-from,
.category-drop-leave-to {
  opacity: 0;
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  z-index: var(--z-overlay);
}

.mobile-menu {
  background: var(--bg-white);
  padding: var(--spacing-lg);
  max-height: 70vh;
  overflow-y: auto;
}

.mobile-search {
  margin-bottom: var(--spacing-md);
}

.mobile-search .search-box {
  border-radius: var(--radius-xl);
}

.mobile-search .search-input {
  border-radius: var(--radius-xl) 0 0 var(--radius-xl);
}

.mobile-search .search-btn {
  border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
}

.mobile-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.mobile-nav-item {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
}

.mobile-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
}

.mobile-action-item {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
}

.mobile-theme {
  margin-left: auto;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xxs);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration-normal) var(--ease-out);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
}

.slide-down-enter-from .mobile-menu,
.slide-down-leave-to .mobile-menu {
  transform: translateY(-10px);
}

@media (max-width: 1200px) {
  .logo {
    margin-right: 30px;
  }

  .search-wrapper {
    max-width: 400px;
    margin-right: 16px;
  }

  .nav-item {
    padding: 14px 10px;
    font-size: var(--font-size-sm);
  }

  .search-hot {
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .site-nav {
    display: none;
  }

  .header-main {
    padding: 12px 0;
  }

  .logo-text {
    font-size: 22px;
  }

  .logo {
    margin-right: 16px;
  }

  .search-wrapper {
    display: none;
  }

  .cart-text {
    display: none;
  }

  .cart-btn {
    padding: 8px 14px;
    margin-right: 4px;
  }

  .category-trigger {
    display: none;
  }

  .nav-bar {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
  }
}
</style>