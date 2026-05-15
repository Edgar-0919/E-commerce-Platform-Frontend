<template>
  <footer class="footer">
    <div class="footer-service">
      <div class="container">
        <div class="service-list">
          <div class="service-item" v-for="svc in services" :key="svc.title">
            <span class="svc-icon-circle">{{ svc.icon }}</span>
            <span class="svc-title">{{ svc.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-links">
      <div class="container">
        <div class="link-column" v-for="col in linkColumns" :key="col.title">
          <h4>{{ col.title }}</h4>
          <ul>
            <li v-for="link in col.links" :key="link"><a href="#">{{ link }}</a></li>
          </ul>
        </div>
        <div class="link-column contact-column">
          <h4>客户服务</h4>
          <div class="contact-phone">400-123-4567</div>
          <div class="contact-time">7x24小时为您服务</div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <div class="bottom-links">
          <a href="#">关于我们</a><span>|</span>
          <a href="#">联系我们</a><span>|</span>
          <a href="#">人才招聘</a><span>|</span>
          <a href="#">商家入驻</a><span>|</span>
          <a href="#">广告服务</a><span>|</span>
          <a href="#">友情链接</a>
        </div>
        <p class="copyright">Copyright &copy; {{ currentYear }} 小羊电商平台 版权所有</p>
        <p class="icp">ICP备12345678号-1 | 京公网安备 11010802026228号</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()

const services = [
  { icon: '✓', title: '正品保障' },
  { icon: '⚡', title: '极速物流' },
  { icon: '↻', title: '7天退换' },
  { icon: '✆', title: '客服支持' }
]

const linkColumns = [
  {
    title: '购物指南',
    links: ['购物流程', '会员介绍', '生活旅行', '常见问题', '联系客服']
  },
  {
    title: '配送方式',
    links: ['上门自提', '211限时达', '配送服务查询', '配送费收取标准', '海外配送']
  },
  {
    title: '支付方式',
    links: ['货到付款', '在线支付', '分期付款', '邮局汇款', '公司转账']
  },
  {
    title: '售后服务',
    links: ['售后政策', '价格保护', '退款说明', '返修/退换货', '取消订单']
  }
]
</script>

<style scoped>
.footer {
  background: var(--bg-page);
  margin-top: var(--spacing-xxl);
}

.footer-service {
  background: linear-gradient(90deg, #ff6a00, #ff5000, #ff4400);
  padding: 24px 0;
}

.service-list {
  display: flex;
  justify-content: space-around;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.svc-icon-circle {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.svc-title {
  font-size: var(--font-size-md);
  color: #fff;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
}

.footer-links {
  padding: 32px 0 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-page);
}

.footer-links .container {
  display: flex;
}

.link-column {
  flex: 1;
}

.link-column h4 {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin-bottom: 14px;
  font-weight: var(--font-weight-semibold);
}

.link-column ul {
  list-style: none;
  padding: 0;
}

.link-column li {
  margin-bottom: 8px;
}

.link-column a {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  transition: color var(--duration-fast);
  text-decoration: none;
}

.link-column a:hover {
  color: var(--primary-color);
}

.contact-column {
  text-align: center;
}

.contact-phone {
  font-size: 26px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.contact-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.footer-bottom {
  padding: 18px 0 22px;
  text-align: center;
  background: var(--bg-page);
}

.bottom-links {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.bottom-links a {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  padding: 0 6px;
  text-decoration: none;
}

.bottom-links a:hover {
  color: var(--primary-color);
}

.bottom-links span {
  color: var(--text-placeholder);
  font-size: var(--font-size-xs);
}

.copyright {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  margin-bottom: 4px;
}

.icp {
  color: var(--text-placeholder);
  font-size: var(--font-size-xs);
}

@media (max-width: 1200px) {
  .footer-links .container {
    flex-wrap: wrap;
    gap: 20px;
  }

  .link-column {
    flex: none;
    width: calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .service-list {
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }

  .link-column {
    width: calc(50% - 10px);
  }

  .contact-column {
    width: 100%;
    text-align: left;
  }
}

@media (max-width: 480px) {
  .link-column {
    width: 100%;
  }

  .bottom-links a {
    padding: 0 4px;
  }

  .service-item {
    flex-direction: column;
    gap: 6px;
  }
}
</style>