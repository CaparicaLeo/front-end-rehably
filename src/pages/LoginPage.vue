<template>
  <div class="login-shell">
    <div class="login-bg">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
    </div>

    <div class="login-card">
      <div class="brand">
        <div class="brand-mark">
          <svg width="28" height="28" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="var(--teal)" stroke-width="1.5" fill="none"/>
            <path d="M11 7v8M7 9.5l4 2.5 4-2.5" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="brand-name">Reably</h1>
      </div>
      <p class="brand-tagline">Painel do Fisioterapeuta</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Senha</label>
          <div class="input-wrapper">
            <input v-model="form.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="••••••••" required />
            <button type="button" class="eye-btn" @click="showPwd = !showPwd">
              <svg v-if="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Entrando...' : 'Entrar' }}</span>
        </button>

        <p class="login-link">
          Não tem conta? <RouterLink to="/register">Criar conta</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const showPwd = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(form)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Credenciais inválidas.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-shell {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; background: var(--bg);
  padding: 20px;
}
.login-bg { position: absolute; inset: 0; pointer-events: none; }
.bg-orb {
  position: absolute; border-radius: 50%;
  filter: blur(80px); opacity: 0.15;
}
.orb-1 { width: 500px; height: 500px; background: var(--teal); top: -150px; left: -100px; }
.orb-2 { width: 400px; height: 400px; background: var(--blue); bottom: -100px; right: -100px; }

.login-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 40px 36px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
}

.brand { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
.brand-mark {
  width: 48px; height: 48px;
  background: var(--teal-dim);
  border: 1px solid rgba(14,230,192,0.25);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
}
.brand-name { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
.brand-tagline { color: var(--text-muted); font-size: 13px; margin-bottom: 32px; }

.login-form { display: flex; flex-direction: column; gap: 20px; }

.input-wrapper { position: relative; }
.input-wrapper .form-input { padding-right: 42px; }
.eye-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); display: flex;
  transition: color var(--transition);
}
.eye-btn:hover { color: var(--text); }

.error-msg {
  background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2);
  color: var(--red); border-radius: var(--radius-sm);
  padding: 10px 14px; font-size: 13px;
}
.login-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; }
.login-link { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 8px; }
.login-link a { color: var(--teal); text-decoration: none; }
.login-link a:hover { text-decoration: underline; }
</style>
