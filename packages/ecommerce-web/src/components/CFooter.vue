<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col brand-col">
            <span class="brand-text">小羊电商</span>
            <p class="brand-desc">咩咩咩-咩咩咩-咩咩</p>
          </div>
          <div class="footer-col" v-for="col in linkColumns" :key="col.title">
            <h4>{{ col.title }}</h4>
            <ul>
              <li v-for="link in col.links" :key="link"><a href="#">{{ link }}</a></li>
            </ul>
          </div>
          <div class="footer-col contact-col">
            <h4>客服热线</h4>
            <div class="contact-phone">xxx-xxx-xxxx</div>
            <div class="contact-time">周一至周日 9:00 - 22:00</div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <div class="bottom-bar">
          <div class="bottom-links">
            <a href="#">关于我们</a>
            <span class="sep">·</span>
            <a href="#">隐私政策</a>
            <span class="sep">·</span>
            <a href="#">服务条款</a>
            <span class="sep">·</span>
            <a href="#">商家入驻</a>
          </div>
          <p class="copyright">&copy; {{ currentYear }} MIEMIE. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()

const linkColumns = [
  {
    title: '购物指南',
    links: [ '会员介绍', '常见问题', '联系客服']
  },
  {
    title: '配送方式',
    links: ['配送服务查询', '配送费收取标准', '门店自提']
  },
  {
    title: '售后服务',
    links: ['售后政策', '退款说明', '返修/退换货', '取消订单']
  }
]
</script>

<style scoped>
.footer {
  margin-top: var(--spacing-xxl);
}

.footer-main {
  background: #F0EFEB;
  padding: 48px 0 36px;
}

[data-theme="dark"] .footer-main {
  background: #222;
}

.footer-grid {
  display: flex;
  gap: var(--spacing-xl);
}

.brand-col {
  flex: 1.2;
}

.brand-text {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--text-primary);
  text-transform: uppercase;
}

.brand-desc {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  margin-top: 8px;
}

.footer-col {
  flex: 1;
}

.footer-col h4 {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  margin-bottom: 16px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col li {
  margin-bottom: 10px;
}

.footer-col a {
  color: var(--text-light);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--duration-fast);
}

.footer-col a:hover {
  color: var(--text-primary);
}

.contact-phone {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: 6px;
}

.contact-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.footer-bottom {
  background: var(--bg-page);
  padding: 20px 0;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottom-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.bottom-links a {
  color: var(--text-light);
  font-size: var(--font-size-xs);
  text-decoration: none;
}

.bottom-links a:hover {
  color: var(--text-primary);
}

.sep {
  color: var(--text-placeholder);
  font-size: var(--font-size-xs);
}

.copyright {
  color: var(--text-placeholder);
  font-size: var(--font-size-xs);
}

@media (max-width: 768px) {
  .footer-grid {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .brand-col {
    flex: none;
    width: 100%;
    text-align: center;
  }

  .footer-col {
    flex: none;
    width: calc(50% - var(--spacing-lg));
  }

  .contact-col {
    width: 100%;
  }

  .bottom-bar {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>