import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import './styles/tokens.css'
import './styles/element-override.css'
import './styles/web.css'
import App from './App.vue'
import router from './router'
import { useThemeStore } from '@/store/theme'

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