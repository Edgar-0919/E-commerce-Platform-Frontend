# B2C 微服务电商平台 — 前端

基于 Vue 3 + Vite + Element Plus + Pinia 的电商平台前端项目，npm workspace monorepo 架构，C 端用户系统与 B 端管理系统独立构建、共享通用组件和工具。

后端仓库：[E-Commerce-Platform-Backend](https://github.com/Edgar-0919/E-Commerce-Platform-Backend)

## 项目概述

B2C 微服务电商平台前端采用 npm workspace monorepo 架构，将 C 端用户系统与 B 端管理系统拆分为独立子包，同时抽取通用组件、样式和工具到 `@ecommerce/shared` 共享包中。

**核心特性：**

- C 端 + B 端双端独立构建，认证隔离
- `@ecommerce/shared` 共享包：6 个通用组件 + 样式令牌 + Axios 工厂 + 工具函数
- 统一响应拦截：`Result<T>` 格式自动解包，401 自动跳转登录
- 深色/浅色主题切换（C 端），支持跟随系统偏好
- 路由级懒加载 + vendor 分包，首屏优化
- 骨架屏、空状态、错误状态等完善的状态覆盖

## 技术栈

| 技术           | 版本    | 用途                  |
| ------------ | ----- | ------------------- |
| Vue 3        | ^3.4  | 渐进式框架               |
| Vite         | ^5.2  | 构建工具                |
| Element Plus | ^2.7  | UI 组件库              |
| Vue Router   | ^4.3  | 路由管理                |
| Pinia        | ^2.1  | 状态管理                |
| Axios        | ^1.7  | HTTP 请求             |
| ECharts      | ^6.0  | 图表（仅 B 端 Dashboard） |
| @vueuse/core | ^14.3 | 工具库（仅 C 端主题切换）      |

## 项目结构

```
frontend/
├── package.json                    # workspace 根配置
└── packages/
    ├── shared/                     # 共享包 @ecommerce/shared
    │   ├── index.js                # 统一导出入口
    │   ├── components/             # 通用组件（6 个）
    │   │   ├── BackToTop.vue       #   回到顶部
    │   │   ├── BreadcrumbNav.vue   #   面包屑导航
    │   │   ├── EmptyState.vue      #   空状态
    │   │   ├── ErrorState.vue      #   错误状态
    │   │   ├── LazyImage.vue       #   懒加载图片
    │   │   └── SkeletonLoader.vue  #   骨架屏
    │   ├── styles/                 # 共享样式
    │   │   ├── tokens.css          #   CSS 设计令牌
    │   │   └── element-override.css#   Element Plus 主题覆盖
    │   ├── utils/                  # 工具函数
    │   │   ├── request.js          #   Axios 实例工厂
    │   │   ├── format.js           #   格式化工具
    │   │   └── regionData.js       #   省市区数据
    │   └── composables/            # 组合式函数
    │       └── useAsyncData.js     #   异步数据加载管理
    ├── ecommerce-web/              # C 端用户系统（端口 5173）
    │   ├── index.html
    │   ├── vite.config.js
    │   └── src/
    │       ├── main.js             # 入口（注册全局组件、样式）
    │       ├── App.vue
    │       ├── api/                # 请求层
    │       │   ├── request.js      #   Axios 实例（tokenKey: ecommerce_web_token）
    │       │   ├── user.js         #   用户 API
    │       │   ├── product.js      #   商品 API
    │       │   ├── cart.js         #   购物车 API
    │       │   ├── order.js        #   订单 API
    │       │   ├── search.js       #   搜索 API
    │       │   ├── payment.js      #   支付 API
    │       │   └── marketing.js    #   营销 API
    │       ├── components/         # C 端业务组件
    │       │   ├── CHeader.vue     #   全局头部
    │       │   ├── CFooter.vue     #   全局底部
    │       │   └── ProductCard.vue #   商品卡片
    │       ├── layout/             # 布局
    │       │   └── WebLayout.vue
    │       ├── router/             # 路由配置（14 条）
    │       │   └── index.js
    │       ├── store/              # 状态管理
    │       │   ├── user.js         #   用户状态
    │       │   └── theme.js        #   主题状态
    │       ├── styles/             # C 端专属样式
    │       │   └── web.css
    │       └── views/              # 页面视图
    │           ├── Home/           #   首页
    │           ├── Goods/          #   商品详情、搜索结果
    │           ├── Order/          #   购物车、结算、订单列表、支付
    │           ├── User/           #   登录、注册、个人中心、地址、优惠券、商户申请
    │           └── NotFound.vue
    └── ecommerce-admin/            # B 端管理系统（端口 5174）
        ├── index.html
        ├── vite.config.js
        └── src/
            ├── main.js             # 入口（注册全局组件、样式）
            ├── App.vue
            ├── api/                # 请求层
            │   ├── request.js      #   Axios 实例（tokenKey: ecommerce_admin_token）
            │   ├── auth.js         #   认证 API
            │   ├── admin.js        #   管理 API（46 个端点）
            │   └── spec.js         #   规格 API
            ├── layout/             # 布局
            │   └── AdminLayout.vue
            ├── router/             # 路由配置（12 条）
            │   └── index.js
            ├── store/              # 状态管理
            │   └── admin.js
            ├── styles/             # B 端专属样式
            │   └── admin.css
            └── views/              # 页面视图
                ├── Dashboard/      #   仪表盘
                ├── GoodsManage/    #   商品管理、分类、品牌、规格、库存
                ├── OrderManage/    #   订单管理、退款管理
                ├── UserManage/     #   用户管理
                └── System/         #   登录、商户管理、优惠券管理
```

## 快速开始

### 环境要求

| 工具      | 最低版本 |
| ------- | ---- |
| Node.js | 18+  |
| npm     | 9+   |

### 1. 安装依赖

```bash
npm install
```

> 项目使用 npm workspace，根目录 `npm install` 即可安装所有子包依赖（包括 `@ecommerce/shared`）。

### 2. 启动开发服务器

```bash
# 启动 C 端（http://localhost:5173）
npm run dev:web

# 启动 B 端（http://localhost:5174）
npm run dev:admin
```

两个开发服务器已配置 API 代理，`/api` 路径请求自动转发到 `http://localhost:8080`（后端 Gateway）。

### 3. 构建生产版本

```bash
npm run build:web
npm run build:admin
```

### 4. 预览构建结果

```bash
npm run preview:web
npm run preview:admin
```

## 路由设计

### C 端路由（ecommerce-web）

| 路径                     | 页面                | 鉴权  |
| ---------------------- | ----------------- | --- |
| `/home`                | 首页                | 公开  |
| `/login`               | 登录                | 公开  |
| `/register`            | 注册（默认 ROLE\_USER） | 公开  |
| `/product/:id`         | 商品详情              | 公开  |
| `/search`              | 搜索结果              | 公开  |
| `/cart`                | 购物车               | 需登录 |
| `/order`               | 我的订单              | 需登录 |
| `/order/:id`           | 订单详情              | 需登录 |
| `/checkout`            | 确认订单              | 需登录 |
| `/payment/result`      | 支付结果              | 需登录 |
| `/user`                | 个人中心              | 需登录 |
| `/user/coupons`        | 我的优惠券             | 需登录 |
| `/user/merchant-apply` | 商户入驻申请            | 需登录 |
| `/:pathMatch(.*)*`     | 404               | 公开  |

### B 端路由（ecommerce-admin）

| 路径                         | 页面            | 角色              |
| -------------------------- | ------------- | --------------- |
| `/admin/login`             | 管理员登录         | 公开              |
| `/admin/dashboard`         | 仪表盘           | ADMIN, MERCHANT |
| `/admin/products`          | 商品列表          | ADMIN, MERCHANT |
| `/admin/products/create`   | 新增商品          | ADMIN, MERCHANT |
| `/admin/products/:id/edit` | 编辑商品          | ADMIN, MERCHANT |
| `/admin/brands`            | 品牌管理          | ADMIN, MERCHANT |
| `/admin/categories`        | 分类管理          | ADMIN, MERCHANT |
| `/admin/inventory`         | 库存管理          | ADMIN, MERCHANT |
| `/admin/orders`            | 订单管理          | ADMIN, MERCHANT |
| `/admin/refunds`           | 退款管理          | ADMIN, MERCHANT |
| `/admin/users`             | 用户管理          | ADMIN only      |
| `/admin/merchants`         | 商户管理（含入驻申请审核） | ADMIN only      |
| `/admin/coupons`           | 优惠券管理         | ADMIN, MERCHANT |

### 路由守卫

- C 端和 B 端使用独立的 localStorage token key，互不干扰：
  - C 端：`ecommerce_web_token`
  - B 端：`ecommerce_admin_token`
- 访问需认证页面时检查 token，无 token 跳转登录页
- 401 响应自动清除 token 并跳转到对应登录页
- 每次路由切换自动设置页面标题（格式：`{标题} - B2C 微服务电商平台`）
- 页面切换后自动滚动到顶部

## 功能特性

- **JWT 认证**：登录后 token 持久化到 localStorage，每次请求通过 `Authorization: Bearer` 头携带
- **Token 隔离**：B/C 端使用独立的 localStorage key，不会串号
- **深色/浅色主题**：C 端支持手动切换 + 跟随系统偏好，主题选择持久化，通过 CSS 变量切换
- **代码分割**：路由级懒加载 + vendor 分包（vue-vendor、element-plus、echarts），减少首屏体积
- **骨架屏**：`SkeletonLoader` 组件支持 card/list/detail/text 四种占位模式
- **懒加载图片**：`LazyImage` 组件基于 el-image 封装，占位图 + 失败重试
- **页面过渡**：路由切换时淡入淡出动画
- **空状态/错误状态**：统一样式的 `EmptyState` 和 `ErrorState` 组件
- **面包屑导航**：`BreadcrumbNav` 组件支持动态路径
- **回到顶部**：`BackToTop` 组件全局可用
- **移动端适配**：Header 含全屏移动端菜单
- **ECharts 图表**：B 端 Dashboard 支持统计图表（仅 ecommerce-admin 包依赖）