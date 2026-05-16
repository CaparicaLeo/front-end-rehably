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
      <p class="brand-tagline">Nova senha</p>

      <form class="login-form" @submit.prevent="handleReset">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>
        <div class="form-group">
          <label class="form-label">Nova senha</label>
          <input v-model="form.password" type="password" class="form-input" placeholder="••••••••" required />
        </div>
        <div class="form-group">
          <label class="form-label">Confirmar nova senha</label>
          <input v-model="form.password_confirmation" type="password" class="form-input" placeholder="••••••••" required />
        </div>

        <div v-if="success" class="success-msg">{{ success }}</div>
        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Redefinindo...' : 'Redefinir senha' }}</span>
        </button>

        <p class="login-link">
          <RouterLink to="/login">Voltar ao login</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { authApi } from '../api/services'

const route = useRoute()
const router = useRouter()
const form = reactive({
  email: '',
  password: '',
  password_confirmation: '',
  token: route.query.token || ''
})
const loading = ref(false)
const error = ref('')
const success = ref('')

async function handleReset() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await authApi.resetPassword({ ...form })
    success.value = 'Senha redefinida com sucesso!'
    setTimeout(() => router.push('/login'), 2000)
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao redefinir senha.'
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

.success-msg {
  background: var(--green-dim); border: 1px solid rgba(34,197,94,0.2);
  color: var(--green); border-radius: var(--radius-sm);
  padding: 10px 14px; font-size: 13px;
}
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
