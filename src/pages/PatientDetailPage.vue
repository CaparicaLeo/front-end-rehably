<template>
  <div class="patient-detail-page">
    <div class="page-header">
      <RouterLink to="/patients" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Voltar
      </RouterLink>
      <button class="btn btn-primary" @click="openEditModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Editar
      </button>
    </div>

    <div v-if="loading" class="patient-header-card card skeleton-card">
      <div class="skeleton" style="width:80px;height:80px;border-radius:50%"></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:10px">
        <span class="skeleton" style="width:40%;height:24px"></span>
        <span class="skeleton" style="width:25%;height:16px"></span>
      </div>
    </div>

    <div v-else-if="patient" class="patient-header-card card">
      <div class="patient-avatar-lg">{{ initial(patient.user?.name) }}</div>
      <div class="patient-header-info">
        <h1 class="patient-name">{{ patient.user?.name }}</h1>
        <div class="patient-meta-row">
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{{ patient.email }}</span>
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>{{ patient.phone_number || '—' }}</span>
          <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{{ patient.birth_date ? age(patient.birth_date) + ' anos' : '—' }}</span>
        </div>
      </div>
    </div>

    <div v-if="patient?.clinical_condition" class="card clinical-card">
      <h3 class="section-title">Condição Clínica</h3>
      <p class="clinical-text">{{ patient.clinical_condition }}</p>
    </div>

    <div class="card">
      <div class="section-header">
        <h3 class="section-title">Tratamentos</h3>
        <button class="btn btn-ghost btn-sm" @click="openTreatmentModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo
        </button>
      </div>
      <div v-if="!treatments.length" class="empty-state-sm">
        <p>Nenhum tratamento encontrado.</p>
      </div>
      <div v-else class="treatments-list">
        <RouterLink
          v-for="t in treatments" :key="t.id"
          :to="`/treatments/${t.id}`"
          class="treatment-item"
        >
          <div class="treatment-info">
            <div class="treatment-name">{{ t.title }}</div>
            <div class="treatment-meta">{{ t.date ? formatDate(t.date) : 'Sem data' }}</div>
          </div>
          <div class="treatment-status" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</div>
          <div class="treatment-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- Edit Patient Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>Editar Paciente</h3>
              <button class="icon-btn" @click="closeEditModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleEditSubmit" class="modal-form">
              <div class="form-group">
                <label class="form-label">Nome completo *</label>
                <input v-model="editForm.name" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">E-mail *</label>
                <input v-model="editForm.email" type="email" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input v-model="editForm.phone_number" class="form-input" placeholder="(42) 99999-9999" />
              </div>
              <div class="form-group">
                <label class="form-label">Data de nascimento *</label>
                <input v-model="editForm.birth_date" type="date" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Condição clínica</label>
                <textarea v-model="editForm.clinical_condition" class="form-textarea" placeholder="Descreva a condição clínica..."></textarea>
              </div>
              <div v-if="error" class="error-msg">{{ error }}</div>
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeEditModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner"></span>
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- New Treatment Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showTreatmentModal" class="modal-overlay" @click.self="closeTreatmentModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>Novo Tratamento</h3>
              <button class="icon-btn" @click="closeTreatmentModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleTreatmentSubmit" class="modal-form">
              <div class="form-group">
                <label class="form-label">Título *</label>
                <input v-model="treatmentForm.title" class="form-input" required placeholder="Ex: Fisioterapia Motora" />
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea v-model="treatmentForm.description" class="form-textarea" placeholder="Descrição do tratamento..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Data de início</label>
                <input v-model="treatmentForm.date" type="date" class="form-input" />
              </div>
              <div v-if="treatmentError" class="error-msg">{{ treatmentError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeTreatmentModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="treatmentSubmitting">
                  <span v-if="treatmentSubmitting" class="spinner"></span>
                  Criar
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePatientsStore } from '../stores/patients'

const route = useRoute()
const patientsStore = usePatientsStore()

const loading = ref(true)
const patient = ref(null)
const treatments = ref([])

const showEditModal = ref(false)
const showTreatmentModal = ref(false)
const submitting = ref(false)
const treatmentSubmitting = ref(false)
const error = ref('')
const treatmentError = ref('')

const editForm = reactive({
  name: '', email: '', phone_number: '', birth_date: '', clinical_condition: ''
})

const treatmentForm = reactive({
  title: '', description: '', date: ''
})

function initial(name) {
  return name?.[0]?.toUpperCase() || '?'
}

function age(birthDate) {
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR')
}

function statusClass(status) {
  const map = { active: 'status-active', completed: 'status-completed', cancelled: 'status-cancelled' }
  return map[status] || ''
}

function statusLabel(status) {
  const map = { active: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado' }
  return map[status] || status
}

async function loadPatient() {
  loading.value = true
  try {
    patient.value = await patientsStore.fetchOne(route.params.id)
    console.log('Patient data:', patient.value)
    if (patient.value) {
      Object.assign(editForm, {
        name: patient.value.user?.name || patient.value.name || '',
        email: patient.value.email || patient.value.user?.email || '',
        phone_number: patient.value.phone_number || patient.value.user?.phone_number || '',
        birth_date: patient.value.birth_date || '',
        clinical_condition: patient.value.clinical_condition || ''
      })
    }
    treatments.value = await patientsStore.fetchTreatments(route.params.id)
  } finally {
    loading.value = false
  }
}

function openEditModal() {
  error.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

async function handleEditSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await patientsStore.update(route.params.id, editForm)
    await loadPatient()
    closeEditModal()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erro ao atualizar paciente.'
  } finally {
    submitting.value = false
  }
}

function openTreatmentModal() {
  Object.assign(treatmentForm, { title: '', description: '', date: '' })
  treatmentError.value = ''
  showTreatmentModal.value = true
}

function closeTreatmentModal() {
  showTreatmentModal.value = false
}

async function handleTreatmentSubmit() {
  treatmentError.value = ''
  treatmentSubmitting.value = true
  try {
    await patientsStore.createTreatment(route.params.id, treatmentForm)
    treatments.value = await patientsStore.fetchTreatments(route.params.id)
    closeTreatmentModal()
  } catch (e) {
    treatmentError.value = e.response?.data?.message || 'Erro ao criar tratamento.'
  } finally {
    treatmentSubmitting.value = false
  }
}

onMounted(() => loadPatient())
</script>

<style scoped>
.patient-detail-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.back-link { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 14px; transition: color var(--transition); text-decoration: none; }
.back-link:hover { color: var(--text); }

.patient-header-card { display: flex; align-items: center; gap: 20px; padding: 24px; }
.patient-avatar-lg {
  width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0;
  background: var(--teal-dim); border: 2px solid rgba(14,230,192,0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--teal);
}
.patient-header-info { flex: 1; }
.patient-name { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
.patient-meta-row { display: flex; flex-wrap: wrap; gap: 16px; color: var(--text-muted); font-size: 14px; }
.patient-meta-row span { display: flex; align-items: center; gap: 6px; }

.clinical-card { padding: 20px; }
.section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 12px; }
.clinical-text { color: var(--text-muted); line-height: 1.6; white-space: pre-wrap; }

.section-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 16px; }
.section-header .section-title { margin-bottom: 0; }

.treatments-list { display: flex; flex-direction: column; }
.treatment-item {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; border-top: 1px solid var(--border);
  transition: background var(--transition); text-decoration: none; color: inherit;
}
.treatment-item:first-child { border-top: none; }
.treatment-item:hover { background: var(--surface-2); }
.treatment-info { flex: 1; }
.treatment-name { font-size: 15px; font-weight: 600; }
.treatment-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.treatment-status { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
.status-active { background: rgba(14,230,192,0.15); color: var(--teal); }
.status-completed { background: rgba(34,197,94,0.15); color: var(--green); }
.status-cancelled { background: rgba(239,68,68,0.15); color: var(--red); }
.treatment-arrow { color: var(--text-muted); }

.empty-state-sm { padding: 40px; text-align: center; color: var(--text-muted); font-size: 14px; }

.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 1; }
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.error-msg { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; }

.icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; border-radius: 6px; display: flex; transition: all var(--transition); }
.icon-btn:hover { background: var(--surface-2); color: var(--text); }

.btn-sm { padding: 6px 12px; font-size: 13px; }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }
</style>