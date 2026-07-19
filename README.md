# 小羊电商 — 前端

基于 Vue 3 + Vite + Element Plus + Pinia 的电商平台前端项目，npm workspace monorepo 架构。
后端仓库：[backend](https://github.com/Edgar-0919/E-commerce-Platform-Backend)

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 (Composition API) | ^3.4 | 渐进式框架 |
| Vite | ^5.2 | 构建工具 |
| Element Plus | ^2.7 | UI 组件库 |
| Vue Router | ^4.3 | 路由管理 |
| Pinia | ^2.1 | 状态管理 |
| Axios | ^1.7 | HTTP 请求 |
| ECharts | ^6.0 | 图表（仅 B端 Dashboard） |
| @vueuse/core | ^14.3 | 工具库（仅 C端主题切换） |

## 目录结构

```
frontend/
├── package.json                    # workspace 根配置
├── _archive/                       # 拆分前的旧单项目代码（归档参考）
└── packages/
    ├── ecommerce-web/              # C端用户系统（端口 5173）
    │   ├── index.html
    │   ├── vite.config.js
    │   └── src/
    │       ├── main.js             # 入口
    │       ├── App.vue
    │       ├── api/                # request.js + user/product/cart/order/search/payment/marketing
    │       ├── components/         # common/ (6个通用组件) + CHeader/CFooter/ProductCard
    │       ├── layout/             # WebLayout.vue
    │       ├── router/             # 独立路由 + 鉴权（14条）
    │       ├── store/              # user.js + theme.js
    │       ├── styles/             # tokens.css + element-override.css + web.css
    │       ├── utils/           # format.js
    │       └── views/           # Home/Goods/Order/User/NotFound/MerchantApply
    └── ecommerce-admin/            # B端管理系统（端口 5174）
        ├── index.html
        ├── vite.config.js
        └── src/
            ├── main.js             # 入口
            ├── App.vue
            ├── api/                # request.js + admin.js (46个端点) + auth.js
            ├── components/         # common/ (6个通用组件)
            ├── layout/             # AdminLayout.vue
            ├── router/             # 独立路由 + 鉴权（12条）
            ├── store/              # admin.js（独立实现）
            ├── styles/             # tokens.css + element-override.css + admin.css
            ├── utils/              # format.js
            └── views/              # Dashboard/GoodsManage/OrderManage/UserManage/System
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动 C端开发服务器（http://localhost:5173）
npm run dev:web

# 启动 B端开发服务器（http://localhost:5174）
npm run dev:admin

# 构建生产版本
npm run build:web
npm run build:admin

# 预览构建结果
npm run preview:web
npm run preview:admin
```

开发服务器已配置 API 代理，`/api` 路径请求自动转发到 `http://localhost:8080`（后端 Gateway）。

## 路由

### C端路由（ecommerce-web）

| 路径 | 页面 | 鉴权 |
|------|------|------|
| `/home` | 首页 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/product/:id` | 商品详情 | 公开 |
| `/search` | 搜索结果 | 公开 |
| `/cart` | 购物车 | 需登录 |
| `/order` | 我的订单 | 需登录 |
| `/order/:id` | 订单详情 | 需登录 |
| `/checkout` | 确认订单 | 需登录 |
| `/payment/result` | 支付结果 | 需登录 |
| `/user` | 个人中心 | 需登录 |
| `/user/coupons` | 我的优惠券 | 需登录 |
| `/user/merchant-apply` | 商户入驻申请 | 需登录 |
| `/:pathMatch(.*)*` | 404 | 公开 |

> 注册页面已移除角色选择，默认注册为普通用户（ROLE_USER）

### B端路由（ecommerce-admin）

| 路径 | 页面 | 角色 |
|------|------|------|
| `/admin/login` | 管理员登录 | 公开 |
| `/admin/dashboard` | 仪表盘 | ADMIN, MERCHANT |
| `/admin/products` | 商品列表 | ADMIN, MERCHANT |
| `/admin/products/create` | 新增商品 | ADMIN, MERCHANT |
| `/admin/products/:id/edit` | 编辑商品 | ADMIN, MERCHANT |
| `/admin/brands` | 品牌管理 | ADMIN, MERCHANT |
| `/admin/categories` | 分类管理 | ADMIN, MERCHANT |
| `/admin/inventory` | 库存管理 | ADMIN, MERCHANT |
| `/admin/orders` | 订单管理 | ADMIN, MERCHANT |
| `/admin/refunds` | 退款管理 | ADMIN, MERCHANT |
| `/admin/users` | 用户管理 | ADMIN only |
| `/admin/merchants` | 商户管理（含入驻申请审核） | ADMIN only |
| `/admin/coupons` | 优惠券管理 | ADMIN, MERCHANT |

### 路由守卫

- 访问需认证页面时，检查 localStorage 中的 JWT token，无 token 则跳转登录页
- C端 token key: `ecommerce_web_token`，B端 token key: `ecommerce_admin_token`，两端互不干扰
- 401 响应自动清除 token 并跳转到对应登录页（C端 `/login`，B端 `/admin/login`）
- 每次路由切换自动设置页面标题（格式：`{标题} - 小羊电商`）
- 页面切换后自动滚动到顶部

## 功能特性

- **JWT 认证**：登录后 token 持久化到 localStorage，每次请求通过 Authorization 头携带；401 自动跳转登录页
- **Token 隔离**：B/C端使用独立的 localStorage key，不会串号
- **深色/浅色主题**：支持手动切换 + 跟随系统偏好，主题选择持久化，通过 CSS 变量切换（仅 C端）
- **代码分割**：路由级懒加载 + vendor 分包（vue-vendor、element-plus），减少首屏体积
- **骨架屏**：SkeletonLoader 组件支持 card/list/detail/text 四种占位模式
- **懒加载图片**：LazyImage 组件基于 el-image 封装
- **页面过渡**：路由切换时淡入淡出动画
- **空状态/错误状态**：统一样式的 EmptyState 和 ErrorState 组件
- **面包屑导航**：BreadcrumbNav 组件支持动态路径
- **回到顶部**：BackToTop 组件全局可用
- **移动端适配**：Header 含全屏移动端菜单
- **ECharts 图表**：B端 Dashboard 支持统计图表（仅 admin 包依赖）

## API 层设计

B端和C端各自维护独立的 Axios 实例，参数硬编码，无需工厂函数：

### C端（ecommerce-web）

```js
// src/api/request.js
const TOKEN_KEY = 'ecommerce_web_token'

// 统一响应格式：{ code, message, data, timestamp }
// code=200 直接返回 data；code=401 清除 token 跳转 /login
// baseURL: /api，timeout: 15000ms
```

**商户申请API：**
- `POST /api/user/merchant-application` - 提交商户入驻申请
- `GET /api/user/merchant-application` - 获取当前用户申请状态

**用户信息扩展字段：**
- `merchantApplicationStatus` - 商户申请状态（0待审核 1已通过 2已拒绝）
- `merchantApplicationStatusText` - 状态文本描述

### B端（ecommerce-admin）

```js
// src/api/request.js
const TOKEN_KEY = 'ecommerce_admin_token'

// 统一响应格式：{ code, message, data, timestamp }
// code=200 直接返回 data；code=401 清除 token 跳转 /admin/login
// baseURL: /api，timeout: 15000ms
```

## 设计 Token

品牌色为淘宝风格橙色 `#ff5000`。所有间距、圆角、阴影、字号等样式通过 CSS 变量统一管理（`src/styles/tokens.css`），支持浅色/深色双主题无缝切换。两端各自持有 tokens.css 副本，可独立演进。

## 构建优化

Vite 配置了手动分包策略：

| Chunk | 包含 | 归属 |
|-------|------|------|
| `vue-vendor` | vue、vue-router、pinia | 两端 |
| `element-plus` | element-plus、@element-plus/icons-vue | 两端 |
| `echarts` | echarts | 仅 B端 |