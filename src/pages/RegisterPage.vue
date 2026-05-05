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
      <p class="brand-tagline">Crie sua conta</p>

      <form class="login-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Tipo de conta</label>
          <div class="role-selector">
            <button type="button" class="role-btn" :class="{ active: form.role === 'doctor' }" @click="form.role = 'doctor'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Fisioterapeuta
            </button>
            <button type="button" class="role-btn" :class="{ active: form.role === 'patient' }" @click="form.role = 'patient'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>
              Paciente
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nome completo</label>
          <input v-model="form.name" type="text" class="form-input" placeholder="Seu nome completo" required />
        </div>

        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input v-model="form.email" type="email" class="form-input" placeholder="seu@email.com" required />
        </div>

        <div class="form-group">
          <label class="form-label">Telefone</label>
          <input v-model="form.phone_number" type="tel" class="form-input" placeholder="(42) 99999-9999" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input v-model="form.password" type="password" class="form-input" placeholder="••••••••" required />
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar senha</label>
            <input v-model="form.password_confirmation" type="password" class="form-input" placeholder="••••••••" required />
          </div>
        </div>

        <template v-if="form.role === 'doctor'">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">CREFITO *</label>
              <input v-model="form.crefito" type="text" class="form-input" placeholder="Ex: 123456-F" required />
            </div>
            <div class="form-group">
              <label class="form-label">Especialidade *</label>
              <input v-model="form.specialty" type="text" class="form-input" placeholder="Ex: Fisioterapia Motora" required />
            </div>
          </div>
        </template>

        <template v-if="form.role === 'patient'">
          <div class="form-group">
            <label class="form-label">Data de nascimento</label>
            <input v-model="form.birth_date" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Condição clínica</label>
            <textarea v-model="form.clinical_condition" class="form-textarea" placeholder="Descreva sua condição clínica..."></textarea>
          </div>
        </template>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span>{{ loading ? 'Criando conta...' : 'Criar conta' }}</span>
        </button>

        <p class="login-link">
          Já tem conta? <RouterLink to="/login">Entrar</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/services'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const form = reactive({
  role: 'doctor',
  name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirmation: '',
 crefito: '',
  specialty: '',
  birth_date: '',
  clinical_condition: ''
})
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    const data = {
      role: form.role,
      name: form.name,
      email: form.email,
      phone_number: form.phone_number || null,
      password: form.password,
      password_confirmation: form.password_confirmation,
    }
    
    if (form.role === 'doctor') {
      data.crefito = form.crefito
      data.specialty = form.specialty
    } else {
      if (form.birth_date) data.birth_date = form.birth_date
      if (form.clinical_condition) data.clinical_condition = form.clinical_condition
    }
    
    await authApi.register(data)
    await auth.login({ email: form.email, password: form.password })
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(', ') : 'Erro ao criar conta.'
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
  width: 100%; max-width: 440px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 28px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.4);
  max-height: 90vh; overflow-y: auto;
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
.brand-tagline { color: var(--text-muted); font-size: 13px; margin-bottom: 24px; }

.login-form { display: flex; flex-direction: column; gap: 16px; }

.role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.role-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--text-muted); font-size: 13px;
  transition: all var(--transition);
}
.role-btn:hover { border-color: var(--border-light); }
.role-btn.active {
  border-color: var(--teal); background: var(--teal-dim); color: var(--teal);
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.error-msg {
  background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2);
  color: var(--red); border-radius: var(--radius-sm);
  padding: 10px 14px; font-size: 13px;
}
.login-btn { width: 100%; justify-content: center; padding: 12px; font-size: 15px; }
.login-link { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 4px; }
.login-link a { color: var(--teal); text-decoration: none; }
.login-link a:hover { text-decoration: underline; }
</style>