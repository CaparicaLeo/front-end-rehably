<template>
  <div class="patients-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Pacientes</h2>
        <p class="page-sub">Gerencie os pacientes vinculados à sua conta.</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Paciente
      </button>
    </div>

    <!-- Search -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="search-input" placeholder="Buscar por nome..." />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="patients-grid">
      <div v-for="i in 6" :key="i" class="card patient-card skeleton-card">
        <div class="skeleton" style="width:48px;height:48px;border-radius:50%"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <span class="skeleton" style="width:60%;height:16px"></span>
          <span class="skeleton" style="width:40%;height:13px"></span>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="empty-state card">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
        <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
        <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
      <p>Nenhum paciente encontrado.</p>
      <button class="btn btn-primary" @click="openModal()">Cadastrar paciente</button>
    </div>

    <!-- Grid -->
    <div v-else class="patients-grid">
      <RouterLink
        v-for="p in filtered" :key="p.id"
        :to="`/patients/${p.id}`"
        class="card patient-card"
      >
        <div class="patient-avatar">{{ initial(p.user?.name) }}</div>
        <div class="patient-info">
          <div class="patient-name">{{ p.user?.name }}</div>
          <div class="patient-meta">{{ p.user?.email }}</div>
          <div class="patient-meta" v-if="p.birth_date">{{ age(p.birth_date) }} anos</div>
        </div>
        <div class="patient-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </RouterLink>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>Novo Paciente</h3>
              <button class="icon-btn" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleSubmit" class="modal-form">
              <div class="form-section-title">Dados de acesso</div>
              <div class="form-group">
                <label class="form-label">Nome completo *</label>
                <input v-model="form.name" class="form-input" required placeholder="Ex: Maria da Silva" />
              </div>
              <div class="form-group">
                <label class="form-label">E-mail *</label>
                <input v-model="form.email" type="email" class="form-input" required placeholder="paciente@email.com" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Senha *</label>
                  <input v-model="form.password" type="password" class="form-input" required placeholder="••••••••" />
                </div>
                <div class="form-group">
                  <label class="form-label">Confirmar senha *</label>
                  <input v-model="form.password_confirmation" type="password" class="form-input" required placeholder="••••••••" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input v-model="form.phone_number" class="form-input" placeholder="(42) 99999-9999" />
              </div>

              <div class="divider"></div>
              <div class="form-section-title">Dados clínicos</div>

              <div class="form-group">
                <label class="form-label">Data de nascimento *</label>
                <input v-model="form.birth_date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Condição clínica</label>
                <textarea v-model="form.clinical_condition" class="form-textarea" placeholder="Descreva a condição clínica do paciente..."></textarea>
              </div>

              <div v-if="error" class="error-msg">{{ error }}</div>
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner"></span>
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { usePatientsStore } from '../stores/patients'
import { useAuthStore } from '../stores/auth'

const store = usePatientsStore()
const auth = useAuthStore()
onMounted(() => store.fetchAll())

const search = ref('')
const showModal = ref(false)
const submitting = ref(false)
const error = ref('')
const form = reactive({
  name: '', email: '', password: '', password_confirmation: '',
  phone_number: '', birth_date: '', clinical_condition: ''
})

const filtered = computed(() =>
  store.patients.filter(p =>
    !search.value || p.user?.name?.toLowerCase().includes(search.value.toLowerCase())
  )
)

function initial(name) {
  return name?.[0]?.toUpperCase() || '?'
}

function age(birthDate) {
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function openModal() {
  Object.assign(form, {
    name: '', email: '', password: '', password_confirmation: '',
    phone_number: '', birth_date: '', clinical_condition: ''
  })
  error.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await store.create({
      ...form,
      doctor_id: auth.user.doctor.id
    })
    closeModal()
  } catch (e) {
    console.error(e)
    const msg = e.response?.data?.message || e.message || 'Erro ao cadastrar paciente.'
    error.value = msg
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.patients-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.page-sub { color: var(--text-muted); font-size: 13px; }

.filters-bar { display: flex; gap: 12px; }
.search-wrapper {
  display: flex; align-items: center; gap: 10px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 0 14px;
  color: var(--text-muted); flex: 1; max-width: 360px;
}
.search-wrapper:focus-within { border-color: var(--teal); }
.search-input {
  background: none; border: none; outline: none;
  color: var(--text); font-family: var(--font-body); font-size: 14px;
  padding: 10px 0; flex: 1;
}

.patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.patient-card {
  display: flex; align-items: center; gap: 14px;
  transition: border-color var(--transition), transform var(--transition);
  cursor: pointer;
}
.patient-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
.skeleton-card { cursor: default; }
.skeleton-card:hover { transform: none; }

.patient-avatar {
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  background: var(--teal-dim); border: 1px solid rgba(14,230,192,0.2);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--teal);
}
.patient-info { flex: 1; min-width: 0; }
.patient-name { font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.patient-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.patient-arrow { color: var(--text-muted); flex-shrink: 0; }

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; color: var(--text-muted); padding: 60px; }

.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 1; }
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); font-weight: 600; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.error-msg { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; }

.icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; border-radius: 6px; display: flex; transition: all var(--transition); }
.icon-btn:hover { background: var(--surface-2); color: var(--text); }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }
</style>
