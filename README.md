# 小羊电商 — 前端

基于 Vue 3 + Vite + Element Plus + Pinia 的电商平台前端项目。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.4 | 渐进式框架 |
| Vite | ^5.2 | 构建工具 |
| Element Plus | ^2.7 | UI 组件库 |
| Vue Router | ^4.3 | 路由管理 |
| Pinia | ^2.1 | 状态管理 |
| Axios | ^1.7 | HTTP 请求 |

## 目录结构

```
frontend/
├── index.html                    # 入口HTML，含主题防闪烁脚本
├── vite.config.js                # Vite配置（别名、代理、分包）
├── dist/                         # 构建产物
└── src/
    ├── main.js                   # 应用入口（Pinia/Router/ElementPlus/图标注册）
    ├── App.vue                   # 根组件（Header/Footer/路由视图/页面过渡）
    ├── api/                      # Axios接口封装
    │   ├── request.js            # 统一请求（JWT注入、响应拦截、错误处理）
    │   ├── user.js               # 用户API（登录、注册、信息、地址）
    │   ├── product.js            # 商品API（列表、详情、分类、SKU）
    │   ├── cart.js               # 购物车API（增删改查）
    │   ├── order.js              # 订单API（创建、列表、详情、取消）
    │   └── search.js             # 搜索API
    ├── router/
    │   └── index.js              # 路由配置（路由守卫、标题注入、滚动恢复、404）
    ├── stores/
    │   ├── user.js               # 用户状态（JWT持久化、用户信息）
    │   └── theme.js              # 主题状态（浅色/深色切换）
    ├── views/                    # 9个页面组件
    │   ├── Home.vue              # 首页
    │   ├── Login.vue             # 登录页
    │   ├── Register.vue          # 注册页
    │   ├── ProductDetail.vue     # 商品详情页
    │   ├── Cart.vue              # 购物车页（需登录）
    │   ├── OrderList.vue         # 我的订单页（需登录）
    │   ├── UserCenter.vue        # 个人中心页（需登录）
    │   ├── SearchResult.vue      # 搜索结果页
    │   └── NotFound.vue          # 404页面
    ├── components/               # 9个通用组件
    │   ├── Header.vue            # 顶部导航（主题切换、移动端菜单）
    │   ├── Footer.vue            # 页脚
    │   ├── ProductCard.vue       # 商品卡片（悬停加购）
    │   ├── LazyImage.vue         # 懒加载图片（el-image封装）
    │   ├── SkeletonLoader.vue    # 骨架屏（card/list/detail/text）
    │   ├── EmptyState.vue        # 空状态
    │   ├── ErrorState.vue        # 错误状态
    │   ├── BackToTop.vue         # 回到顶部
    │   └── BreadcrumbNav.vue     # 面包屑导航
    ├── mock/                     # Mock数据（联调前占位）
    │   ├── home.js
    │   ├── cart.js
    │   ├── order.js
    │   └── product.js
    └── styles/
        ├── variables.css         # 设计Token（浅色/深色双主题、间距、圆角）
        ├── global.css            # 全局重置、工具类、页面过渡动画
        └── element-overrides.css # Element Plus品牌化覆盖
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:5173）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器已配置 API 代理，`/api` 路径请求自动转发到 `http://localhost:8080`（后端 Gateway）。

## 路由

| 路径 | 页面 | 认证要求 | 说明 |
|------|------|----------|------|
| `/home` | 首页 | 否 | 默认路径 |
| `/login` | 登录 | 否 | 无Header/Footer |
| `/register` | 注册 | 否 | 无Header/Footer |
| `/product/:id` | 商品详情 | 否 | |
| `/cart` | 购物车 | 是 | |
| `/order` | 我的订单 | 是 | |
| `/user` | 个人中心 | 是 | |
| `/search` | 搜索结果 | 否 | |
| `/:pathMatch(.*)*` | 404 | 否 | 未匹配路由 |

### 路由守卫

- 访问需认证页面时，检查 localStorage 中的 JWT token，无 token 则跳转 `/login`
- 每次路由切换自动设置页面标题（格式：`{标题} - 小羊电商`）
- 页面切换后自动滚动到顶部

## 功能特性

- **JWT 认证**：登录后 token 持久化到 localStorage，每次请求通过 Authorization 头携带；401 自动跳转登录页
- **深色/浅色主题**：支持手动切换 + 跟随系统偏好，主题选择持久化，通过 CSS 变量切换
- **代码分割**：路由级懒加载 + vendor 分包（vue-vendor、element-plus），减少首屏体积
- **骨架屏**：SkeletonLoader 组件支持 card/list/detail/text 四种占位模式
- **懒加载图片**：LazyImage 组件基于 el-image 封装
- **页面过渡**：路由切换时淡入淡出动画
- **空状态/错误状态**：统一样式的 EmptyState 和 ErrorState 组件
- **面包屑导航**：BreadcrumbNav 组件支持动态路径
- **回到顶部**：BackToTop 组件全局可用
- **移动端适配**：Header 含全屏移动端菜单

## API 层设计

所有请求通过 `src/api/request.js` 统一处理：

1. **请求拦截**：自动从 localStorage 读取 token，添加 `Authorization: Bearer xxx` 请求头
2. **响应拦截**：`code=200` 时直接返回 `data`；`code=401` 时清除 token 跳转登录；其他错误码自动弹出错误提示
3. **超时**：15 秒请求超时
4. **统一响应格式**：后端返回 `{ code, message, data, timestamp }`，前端自动解包

## 设计 Token

品牌色为淘宝风格橙色 `#ff5000`。所有间距、圆角、阴影、字号等样式通过 CSS 变量统一管理（`src/styles/variables.css`），支持浅色/深色双主题无缝切换。

## 构建优化

Vite 配置了手动分包策略：

| Chunk | 包含 |
|-------|------|
| `vue-vendor` | vue、vue-router、pinia |
| `element-plus` | element-plus、@element-plus/icons-vue |
