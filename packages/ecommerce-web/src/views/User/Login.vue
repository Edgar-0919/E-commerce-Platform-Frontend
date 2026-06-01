<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-tabs">
        <span class="tab-item active">密码登录</span>
        <span class="tab-item">短信登录</span>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="input-group" :class="{ error: errors.username }">
          <div class="input-pill">
            <User class="input-icon" />
            <input
              v-model="form.username"
              type="text"
              placeholder="用户名"
              class="pill-input"
              @input="errors.username = ''"
            />
          </div>
          <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
        </div>

        <div class="input-group" :class="{ error: errors.password }">
          <div class="input-pill">
            <Lock class="input-icon" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="密码"
              class="pill-input"
              @input="errors.password = ''"
            />
            <button type="button" class="toggle-pwd" @click="showPassword = !showPassword" :aria-label="showPassword ? '隐藏密码' : '显示密码'">
              <View v-if="!showPassword" />
              <Hide v-else />
            </button>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="form-row">
          <label class="remember-row">
            <input type="checkbox" v-model="form.remember" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-link">忘记密码</a>
        </div>

        <button type="submit" class="login-btn-pill" :disabled="loading">
          <span v-if="loading">登录中...</span>
          <span v-else>登 录</span>
        </button>
      </form>

      <div class="login-footer">
        <a href="#" class="register-link" @click.prevent="goToRegister">免费注册</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { login } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const showPassword = ref(false)
const errors = reactive({
  username: '',
  password: ''
})

const form = reactive({
  username: '',
  password: '',
  remember: false
})

async function handleLogin() {
  errors.username = ''
  errors.password = ''

  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    return
  }
  if (!form.password) {
    errors.password = '请输入密码'
    return
  }

  loading.value = true
  try {
    const result = await login({
      username: form.username,
      password: form.password
    })
    if (result.token) {
      userStore.setToken(result.token)
      await userStore.fetchUserInfo()
      ElMessage.success('登录成功')
      // 存在 redirect 参数则回跳，否则去首页
      const redirect = route.query.redirect || '/home'
      router.push(redirect)
    }
  } catch (e) {
    errors.password = '用户名或密码错误'
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.login-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: 40px 36px 32px;
  width: 420px;
  box-shadow: var(--shadow-md);
}

.login-tabs {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 28px;
}

.tab-item {
  font-size: var(--font-size-lg);
  color: var(--text-light);
  cursor: pointer;
  padding-bottom: 8px;
  border-bottom: 2px solid transparent;
  transition: all var(--duration-fast);
  font-weight: var(--font-weight-medium);
}

.tab-item.active {
  color: var(--text-primary);
  border-bottom-color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-pill {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-placeholder);
  z-index: 1;
  font-size: 16px;
  width: 16px;
  height: 16px;
  pointer-events: none;
}

.toggle-pwd {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-placeholder);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  z-index: 1;
}

.toggle-pwd:hover {
  color: var(--text-secondary);
}

.pill-input {
  width: 100%;
  height: 44px;
  padding: 0 44px 0 42px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  background: var(--bg-white);
  color: var(--text-primary);
  outline: none;
  transition: border-color var(--duration-fast);
  box-sizing: border-box;
}

.pill-input:focus {
  border-color: var(--primary-color);
}

.pill-input::placeholder {
  color: var(--text-placeholder);
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--text-light);
  cursor: pointer;
}

.remember-row input[type="checkbox"] {
  accent-color: var(--primary-color);
  width: 15px;
  height: 15px;
  margin: 0;
  cursor: pointer;
}

.forgot-link {
  font-size: var(--font-size-sm);
  color: var(--link-color);
  text-decoration: none;
}

.forgot-link:hover {
  color: var(--primary-color);
}

.login-btn-pill {
  width: 100%;
  height: 44px;
  background: var(--primary-color);;
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--duration-fast);
  letter-spacing: 4px;
}

.login-btn-pill:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn-pill:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.error-text {
  font-size: var(--font-size-xs);
  color: var(--danger-color);
  padding-left: 8px;
  line-height: 1.6;
}

.input-group.error .pill-input {
  border-color: var(--danger-color);
}

.login-footer {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.register-link {
  font-size: var(--font-size-sm);
  color: var(--link-color);
  text-decoration: none;
}

.register-link:hover {
  color: var(--primary-color);
}

@media (max-width: 480px) {
  .login-page {
    padding: var(--spacing-md);
    align-items: flex-start;
    padding-top: 80px;
  }

  .login-card {
    width: 100%;
    padding: 28px 20px 24px;
  }
}
</style>