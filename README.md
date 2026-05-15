# E-commerce Platform Frontend

基于 [Vue.js](https://vuejs.org/) 构建的电商平台前端项目（课设），涵盖商品浏览、购物车、下单支付、用户中心等常见电商功能，支持移动端适配与响应式设计。

## 特性

- 🛒 电商平台核心前端功能：商品展示、详情页面、购物车、订单管理等
- 🎨 使用 Vue + JavaScript 实现高效开发与组件复用
- 📱 响应式布局，兼容主流端设备
- 💡 易于二次开发和定制
- 💻 CSS 美化风格，支持主题扩展

## 技术栈

- **主框架**：Vue.js（80.2%）
- **脚本语言**：JavaScript（13.1%）
- **样式**：CSS（6.2%）
- **结构**：HTML（0.5%）

## 本地开发和运行

1. **克隆代码仓库**
   ```bash
   git clone https://github.com/Edgar-0919/E-commerce-Platform-Frontend.git
   cd E-commerce-Platform-Frontend
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npm run serve
   # 或
   yarn serve
   ```

4. 打开浏览器访问 [http://localhost:8080](http://localhost:8080) 查看项目页面。

## 目录结构示例

```shell
├── public/             # 静态资源
├── src/
│   ├── assets/         # 图片等静态资源
│   ├── components/     # 公共组件
│   ├── views/          # 页面模块
│   ├── router/         # 路由配置
│   ├── store/          # Vuex 状态管理
│   ├── App.vue
│   └── main.js
├── package.json
└── README.md
```

## 自定义配置

- 配置相关内容请查看 `vue.config.js` 文件
- 环境变量可通过 `.env` 文件自定义

---

> 本仓库为电商平台前端参考项目，欢迎学习和交流。
