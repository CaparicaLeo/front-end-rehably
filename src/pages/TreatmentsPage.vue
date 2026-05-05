<template>
  <div class="treatments-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Tratamentos</h2>
        <p class="page-sub">Gerencie os planos de exercícios dos seus pacientes.</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Tratamento
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="search-input" placeholder="Buscar por título..." />
      </div>
      <div class="filter-tabs">
        <button
          v-for="f in filters" :key="f.value"
          class="filter-tab" :class="{ active: statusFilter === f.value }"
          @click="statusFilter = f.value"
        >{{ f.label }}</button>
      </div>
    </div>

    <!-- List -->
    <div v-if="store.loading" class="treatments-grid">
      <div v-for="i in 6" :key="i" class="card treatment-card skeleton-card">
        <span class="skeleton" style="width:60%;height:18px"></span>
        <span class="skeleton" style="width:40%;height:13px;margin-top:8px"></span>
        <span class="skeleton" style="width:80px;height:22px;border-radius:99px;margin-top:16px"></span>
      </div>
    </div>

    <div v-else-if="!filtered.length" class="empty-state card">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
        <path d="M9 12h6M12 9v6"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      </svg>
      <p>Nenhum tratamento encontrado.</p>
      <button class="btn btn-primary" @click="openModal()">Criar tratamento</button>
    </div>

    <div v-else class="treatments-grid">
      <RouterLink
        v-for="t in filtered" :key="t.id"
        :to="`/treatments/${t.id}`"
        class="card treatment-card"
      >
        <div class="tc-header">
          <span class="badge" :class="`badge-${t.status}`">{{ statusLabel[t.status] }}</span>
          <button class="icon-btn" @click.prevent="openModal(t)" title="Editar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
        <h3 class="tc-title">{{ t.title }}</h3>
        <div class="tc-meta">
          <span>Início: {{ formatDate(t.start_date) }}</span>
          <span v-if="t.end_date">Fim: {{ formatDate(t.end_date) }}</span>
        </div>
      </RouterLink>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>{{ editing ? 'Editar Tratamento' : 'Novo Tratamento' }}</h3>
              <button class="icon-btn" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleSubmit" class="modal-form">
              <div class="form-group">
                <label class="form-label">Título *</label>
                <input v-model="form.title" class="form-input" required placeholder="Ex: Reabilitação pós-cirúrgica" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Data de Início *</label>
                  <input v-model="form.start_date" type="date" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Data de Fim</label>
                  <input v-model="form.end_date" type="date" class="form-input" />
                </div>
              </div>
              <div class="form-group" v-if="editing">
                <label class="form-label">Status</label>
                <select v-model="form.status" class="form-select">
                  <option value="ongoing">Em andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div v-if="modalError" class="error-msg">{{ modalError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner"></span>
                  {{ editing ? 'Salvar' : 'Criar' }}
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
import { useTreatmentsStore } from '../stores/treatments'

const store = useTreatmentsStore()
onMounted(() => store.fetchAll())

const search = ref('')
const statusFilter = ref('all')
const showModal = ref(false)
const editing = ref(null)
const submitting = ref(false)
const modalError = ref('')
const form = reactive({ title: '', start_date: '', end_date: '', status: 'ongoing' })

const statusLabel = { ongoing: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado' }
const filters = [
  { label: 'Todos', value: 'all' },
  { label: 'Em andamento', value: 'ongoing' },
  { label: 'Concluídos', value: 'completed' },
  { label: 'Cancelados', value: 'cancelled' },
]

const filtered = computed(() => {
  return store.treatments.filter(t => {
    const matchSearch = !search.value || t.title.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = statusFilter.value === 'all' || t.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

function openModal(t = null) {
  editing.value = t
  if (t) {
    form.title = t.title; form.start_date = t.start_date; form.end_date = t.end_date || ''; form.status = t.status
  } else {
    form.title = ''; form.start_date = new Date().toISOString().slice(0, 10); form.end_date = ''; form.status = 'ongoing'
  }
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false; editing.value = null }

async function handleSubmit() {
  modalError.value = ''; submitting.value = true
  try {
    const data = { ...form }
    if (!data.end_date) delete data.end_date
    if (editing.value) await store.update(editing.value.id, data)
    else await store.create(data)
    closeModal()
  } catch (e) {
    modalError.value = e.response?.data?.message || 'Erro ao salvar.'
  } finally { submitting.value = false }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.treatments-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.page-sub { color: var(--text-muted); font-size: 13px; }

.filters-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.search-wrapper {
  display: flex; align-items: center; gap: 10px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 0 14px;
  color: var(--text-muted); flex: 1; min-width: 200px;
}
.search-wrapper:focus-within { border-color: var(--teal); }
.search-input {
  background: none; border: none; outline: none;
  color: var(--text); font-family: var(--font-body); font-size: 14px;
  padding: 10px 0; flex: 1;
}
.filter-tabs { display: flex; gap: 4px; }
.filter-tab {
  padding: 8px 14px; border-radius: var(--radius-sm);
  background: none; border: 1px solid var(--border);
  color: var(--text-muted); font-size: 13px; cursor: pointer;
  transition: all var(--transition); white-space: nowrap;
}
.filter-tab:hover, .filter-tab.active { background: var(--surface-2); color: var(--text); border-color: var(--border-light); }
.filter-tab.active { color: var(--teal); border-color: rgba(14,230,192,0.3); }

.treatments-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.treatment-card {
  display: flex; flex-direction: column; gap: 10px;
  transition: border-color var(--transition), transform var(--transition);
  cursor: pointer;
}
.treatment-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
.skeleton-card { cursor: default; }
.skeleton-card:hover { transform: none; }
.tc-header { display: flex; align-items: center; justify-content: space-between; }
.tc-title { font-size: 15px; font-weight: 600; line-height: 1.4; }
.tc-meta { display: flex; flex-direction: column; gap: 2px; font-size: 12px; color: var(--text-muted); margin-top: auto; }

.icon-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 4px; border-radius: 6px;
  display: flex; transition: all var(--transition);
}
.icon-btn:hover { background: var(--surface-2); color: var(--text); }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  text-align: center; color: var(--text-muted); padding: 60px;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); width: 100%; max-width: 460px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.error-msg { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }
</style>
