/**
 * 应用入口文件
 * 初始化Vue应用：
 * 1. 创建Vue实例
 * 2. 配置Pinia状态管理
 * 3. 配置Vue Router
 * 4. 配置Element Plus组件库（中文语言）
 * 5. 注册Element Plus图标
 * 6. 挂载到DOM
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import './styles/variables.css'
import './styles/global.css'
import './styles/element-overrides.css'
import App from './App.vue'
import router from './router'
import { useThemeStore } from '@/stores/theme'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
