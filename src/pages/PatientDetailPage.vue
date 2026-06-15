<template>
  <div class="patient-detail-page">
    <div class="page-header">
      <RouterLink to="/patients" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Voltar
      </RouterLink>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" @click="downloadReport" :disabled="reportLoading">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Relatório PDF
        </button>
        <button class="btn btn-ghost btn-sm" @click="toggleActive" :disabled="toggling">
          <template v-if="patient?.active !== false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Inativar
          </template>
          <template v-else>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Ativar
          </template>
        </button>
        <button class="btn btn-primary" @click="openEditModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar
        </button>
      </div>
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
        <div class="patient-name-row">
          <h1 class="patient-name">{{ patient.user?.name }}</h1>
          <span v-if="patient.active === false" class="badge badge-cancelled">Inativo</span>
        </div>
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
            <div class="treatment-meta">{{ t.start_date ? formatDate(t.start_date) : 'Sem data' }}</div>
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

    <!-- Diário de Sessões -->
    <div class="card">
      <div class="section-header">
        <h3 class="section-title">Diário de Sessões</h3>
        <div class="diary-tabs">
          <button class="btn btn-ghost btn-sm" :class="{ active: diaryPeriod === 7 }" @click="diaryPeriod = 7; loadDiary()">7 dias</button>
          <button class="btn btn-ghost btn-sm" :class="{ active: diaryPeriod === 30 }" @click="diaryPeriod = 30; loadDiary()">30 dias</button>
          <button class="btn btn-ghost btn-sm" :class="{ active: diaryPeriod === 90 }" @click="diaryPeriod = 90; loadDiary()">90 dias</button>
        </div>
      </div>
      <div v-if="diaryLoading" class="skeleton-list">
        <div v-for="i in 3" :key="i" class="skeleton" style="height:40px;margin-bottom:4px"></div>
      </div>
      <div v-else-if="!diarySessions.length" class="empty-state-sm">
        <p>Nenhuma sessão registrada neste período.</p>
      </div>
      <div v-else class="diary-list">
        <div v-for="s in diarySessions" :key="s.id" class="diary-row">
          <div class="diary-date">{{ formatDate(s.session_date) }}</div>
          <div class="diary-exercise">{{ s.treatment_item?.exercise?.title || 'Exercício' }}</div>
          <div v-if="s.completed" class="diary-levels">
            <span v-if="s.pain_level" class="diary-level" :class="levelClass(s.pain_level)">Dor {{ s.pain_level }}</span>
            <span v-if="s.fatigue_level" class="diary-level" :class="levelClass(s.fatigue_level)">Fadiga {{ s.fatigue_level }}</span>
            <span v-if="s.difficulty_level" class="diary-level" :class="levelClass(s.difficulty_level)">Dificuldade {{ s.difficulty_level }}</span>
          </div>
          <div v-else class="diary-incomplete">Não concluída</div>
        </div>
      </div>
      <div v-if="diaryPagination.lastPage > 1" class="pagination">
        <button class="btn btn-ghost btn-sm" :disabled="diaryPage === 1" @click="diaryPage--; loadDiary()">Anterior</button>
        <span class="page-info">{{ diaryPage }} / {{ diaryPagination.lastPage }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="diaryPage === diaryPagination.lastPage" @click="diaryPage++; loadDiary()">Próxima</button>
      </div>
    </div>

    <!-- Stats do Diário -->
    <div v-if="diaryStats" class="card">
      <h3 class="section-title">Resumo do Período</h3>
      <div class="diary-stats-grid">
        <div class="diary-stat">
          <div class="stat-num">{{ diaryStats.total_sessions }}</div>
          <div class="stat-desc">Sessões</div>
        </div>
        <div class="diary-stat">
          <div class="stat-num">{{ diaryStats.completed_sessions }}</div>
          <div class="stat-desc">Concluídas</div>
        </div>
        <div class="diary-stat">
          <div class="stat-num">{{ diaryStats.adherence_rate }}%</div>
          <div class="stat-desc">Adesão</div>
        </div>
        <div class="diary-stat" v-if="diaryStats.avg_pain">
          <div class="stat-num">{{ diaryStats.avg_pain }}</div>
          <div class="stat-desc">Média Dor</div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
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
              <div class="form-section-desc">Dados do paciente que podem ser alterados.</div>
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
                <label class="form-label">Data de início *</label>
                <input v-model="treatmentForm.start_date" type="date" class="form-input" required />
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
import { diaryApi } from '../api/services'

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
  birth_date: '', clinical_condition: ''
})

const treatmentForm = reactive({
  title: '', start_date: ''
})

const toggling = ref(false)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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
  const map = { ongoing: 'status-active', completed: 'status-completed', cancelled: 'status-cancelled' }
  return map[status] || ''
}

function statusLabel(status) {
  const map = { ongoing: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado' }
  return map[status] || status
}

async function loadPatient() {
  loading.value = true
  try {
    patient.value = await patientsStore.fetchOne(route.params.id)
    if (patient.value) {
      Object.assign(editForm, {
        birth_date: patient.value.birth_date || '',
        clinical_condition: patient.value.clinical_condition || ''
      })
    }
    treatments.value = await patientsStore.fetchTreatments(route.params.id)
  } finally {
    loading.value = false
  }
}

// Diary
const diarySessions = ref([])
const diaryLoading = ref(false)
const diaryPeriod = ref(7)
const diaryPage = ref(1)
const diaryPagination = reactive({ lastPage: 1 })
const diaryStats = ref(null)

async function loadDiary() {
  if (!patient.value) return
  diaryLoading.value = true
  diaryPage.value = 1
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - diaryPeriod.value)

    const [sessionsRes, statsRes] = await Promise.all([
      diaryApi.list({
        patient_id: patient.value.id,
        per_page: 10,
        page: diaryPage.value,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10),
      }),
      diaryApi.stats({
        patient_id: patient.value.id,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10),
      }),
    ])

    const data = sessionsRes.data
    if (data.data) {
      diarySessions.value = data.data
      diaryPagination.lastPage = data.last_page || 1
    } else {
      diarySessions.value = data
    }
    diaryStats.value = statsRes.data
  } catch (e) {
    console.error('Erro ao carregar diário:', e)
  } finally {
    diaryLoading.value = false
  }
}

function levelClass(level) {
  if (level <= 2) return 'level-low'
  if (level <= 3) return 'level-mid'
  return 'level-high'
}

// Toggle active
async function toggleActive() {
  toggling.value = true
  try {
    await patientsStore.toggleActive(route.params.id)
    patient.value.active = !patient.value.active
  } catch (e) {
    console.error('Erro ao alterar status:', e)
  } finally {
    toggling.value = false
  }
}

// Report download
const reportLoading = ref(false)

async function downloadReport() {
  reportLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const url = `${API_URL}/patients/${route.params.id}/report?token=${token}`
    window.open(url, '_blank')
  } finally {
    reportLoading.value = false
  }
}

// Modal actions
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
  Object.assign(treatmentForm, { title: '', start_date: new Date().toISOString().slice(0, 10) })
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
.page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.header-actions { display: flex; align-items: center; gap: 8px; }
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
.patient-name-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.patient-name { font-size: 24px; font-weight: 700; }
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

/* Diary */
.diary-tabs { display: flex; gap: 4px; }
.diary-tabs .btn.active { border-color: var(--teal); color: var(--teal); }
.diary-list { display: flex; flex-direction: column; }
.diary-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; border-top: 1px solid var(--border);
  font-size: 13px;
}
.diary-row:first-child { border-top: none; }
.diary-date { width: 90px; font-weight: 600; flex-shrink: 0; }
.diary-exercise { flex: 1; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.diary-levels { display: flex; gap: 8px; }
.diary-level { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 500; }
.level-low { background: var(--green-dim); color: var(--green); }
.level-mid { background: var(--amber); color: #0a0f1e; }
.level-high { background: var(--red-dim); color: var(--red); }
.diary-incomplete { color: var(--text-muted); font-style: italic; }

.diary-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 16px; }
.diary-stat { text-align: center; padding: 16px; }
.stat-num { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--teal); }
.stat-desc { font-size: 11px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; }
.page-info { font-size: 13px; color: var(--text-muted); }
.skeleton-list { padding: 12px 20px; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 1; }
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-section-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.error-msg { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; }

.icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; border-radius: 6px; display: flex; transition: all var(--transition); }
.icon-btn:hover { background: var(--surface-2); color: var(--text); }

.btn-sm { padding: 6px 12px; font-size: 13px; }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }
</style>
