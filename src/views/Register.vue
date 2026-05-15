<template>
  <div class="register-page">
    <div class="register-card">
      <h2 class="register-title">创建账号</h2>

      <form class="register-form" @submit.prevent="handleRegister">
        <div class="input-group" :class="{ error: errors.username }">
          <div class="input-pill">
            <User class="input-icon" />
            <input
              v-model="form.username"
              type="text"
              placeholder="用户名"
              class="pill-input"
              @blur="validateField('username')"
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
              placeholder="密码（至少6位）"
              class="pill-input"
              @input="validateField('password')"
            />
            <button type="button" class="toggle-pwd" @click="showPassword = !showPassword" :aria-label="showPassword ? '隐藏密码' : '显示密码'">
              <View v-if="!showPassword" />
              <Hide v-else />
            </button>
          </div>
          <div v-if="form.password" class="password-strength">
            <div class="strength-bar">
              <span :class="['strength-segment', passwordStrength !== 'weak' ? 'active' : '']"></span>
              <span :class="['strength-segment', passwordStrength === 'medium' || passwordStrength === 'strong' ? 'active' : '']"></span>
              <span :class="['strength-segment', passwordStrength === 'strong' ? 'active' : '']"></span>
            </div>
            <span class="strength-label" :class="passwordStrength">{{ strengthText }}</span>
          </div>
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div class="input-group" :class="{ error: errors.confirmPassword }">
          <div class="input-pill">
            <Lock class="input-icon" />
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="确认密码"
              class="pill-input"
              @input="validateField('confirmPassword')"
            />
            <button type="button" class="toggle-pwd" @click="showConfirmPassword = !showConfirmPassword" :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'">
              <View v-if="!showConfirmPassword" />
              <Hide v-else />
            </button>
          </div>
          <span v-if="form.confirmPassword && form.password === form.confirmPassword" class="match-ok">
            <CircleCheck /> 密码一致
          </span>
          <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
        </div>

        <div class="input-group">
          <div class="input-pill">
            <User class="input-icon" />
            <input
              v-model="form.nickname"
              type="text"
              placeholder="昵称（选填）"
              class="pill-input"
            />
          </div>
        </div>

        <div class="input-group" :class="{ error: errors.phone }">
          <div class="input-pill">
            <Phone class="input-icon" />
            <input
              v-model="form.phone"
              type="tel"
              placeholder="手机号（选填）"
              class="pill-input"
              @blur="validateField('phone')"
            />
          </div>
          <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
        </div>

        <label class="agree-terms">
          <input type="checkbox" v-model="form.agree" />
          <span>我已阅读并同意</span>
          <a href="#">《用户协议》</a>
          <span>和</span>
          <a href="#">《隐私政策》</a>
        </label>

        <button type="submit" class="register-btn-pill" :disabled="loading">
          <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
          <span v-else>注 册</span>
        </button>
      </form>

      <div class="register-footer">
        <span>已有账号?</span>
        <button type="button" class="login-link" @click="goToLogin">立即登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Phone, View, Hide, CircleCheck, Loading } from '@element-plus/icons-vue'
import { register } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  agree: false
})

const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd || pwd.length < 6) return 'weak'
  let score = 0
  if (pwd.length >= 8) score++
  if (/[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  if (score === 0) return 'weak'
  if (score === 1) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  const map = { weak: '弱', medium: '中', strong: '强' }
  return map[passwordStrength.value]
})

function validateField(field) {
  switch (field) {
    case 'username':
      errors.username = form.username.trim() ? '' : '请输入用户名'
      break
    case 'password':
      if (!form.password) errors.password = '请输入密码'
      else if (form.password.length < 6) errors.password = '密码长度不能少于6位'
      else errors.password = ''
      break
    case 'confirmPassword':
      if (!form.confirmPassword) errors.confirmPassword = ''
      else if (form.password !== form.confirmPassword) errors.confirmPassword = '两次输入的密码不一致'
      else errors.confirmPassword = ''
      break
    case 'phone':
      if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) errors.phone = '请输入正确的手机号'
      else errors.phone = ''
      break
  }
}

async function handleRegister() {
  validateField('username')
  validateField('password')
  validateField('confirmPassword')
  validateField('phone')

  if (!form.username.trim()) {
    ElMessage.error('请输入用户名')
    return
  }
  if (!form.password) {
    ElMessage.error('请输入密码')
    return
  }
  if (form.password.length < 6) {
    ElMessage.error('密码长度不能少于6位')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (!form.agree) {
    ElMessage.error('请先阅读并同意用户协议和隐私政策')
    return
  }

  loading.value = true
  try {
    await register({
      username: form.username,
      password: form.password,
      nickname: form.nickname,
      phone: form.phone
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e) {
    ElMessage.error('注册失败，用户名可能已存在')
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.register-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: 36px 36px 28px;
  width: 460px;
  box-shadow: var(--shadow-md);
}

.register-title {
  font-size: var(--font-size-xxl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 26px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.input-group.error .pill-input {
  border-color: var(--danger-color);
}

.error-text {
  font-size: var(--font-size-xs);
  color: var(--danger-color);
  padding-left: 8px;
  line-height: 1.6;
}

.match-ok {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--success-color);
  padding-left: 8px;
  line-height: 1.6;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px;
}

.strength-bar {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-segment {
  height: 3px;
  flex: 1;
  background: var(--border-color);
  border-radius: 2px;
  transition: background var(--duration-fast);
}

.strength-segment.active {
  background: var(--success-color);
}

.strength-label {
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.strength-label.weak { color: var(--danger-color); }
.strength-label.medium { color: var(--warning-color); }
.strength-label.strong { color: var(--success-color); }

.agree-terms {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
  color: var(--text-light);
  cursor: pointer;
  padding: 2px 4px 0;
}

.agree-terms input[type="checkbox"] {
  accent-color: var(--primary-color);
  width: 15px;
  height: 15px;
  margin: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.agree-terms a {
  color: var(--link-color);
  text-decoration: none;
}

.agree-terms a:hover {
  color: var(--primary-color);
}

.register-btn-pill {
  width: 100%;
  height: 44px;
  background: linear-gradient(90deg, #ff6a00, #ff5000);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity var(--duration-fast);
  letter-spacing: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.register-btn-pill:hover:not(:disabled) {
  opacity: 0.9;
}

.register-btn-pill:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.register-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.register-footer span {
  color: var(--text-light);
  font-size: var(--font-size-sm);
}

.login-link {
  color: var(--link-color);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: none;
  border: none;
  cursor: pointer;
}

.login-link:hover {
  color: var(--primary-color);
}

@media (max-width: 480px) {
  .register-page {
    padding: var(--spacing-md);
    align-items: flex-start;
    padding-top: 40px;
  }

  .register-card {
    width: 100%;
    padding: 24px 18px 20px;
  }
}
</style>