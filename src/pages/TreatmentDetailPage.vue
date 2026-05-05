<template>
  <div class="detail-page" v-if="treatment">
    <div class="detail-header">
      <RouterLink to="/treatments" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Tratamentos
      </RouterLink>
      <div class="header-row">
        <div>
          <div class="header-badges">
            <span class="badge" :class="`badge-${treatment.status}`">{{ statusLabel[treatment.status] }}</span>
          </div>
          <h2 class="detail-title">{{ treatment.title }}</h2>
          <p class="detail-meta">
            Início: {{ formatDate(treatment.start_date) }}
            <template v-if="treatment.end_date"> · Fim: {{ formatDate(treatment.end_date) }}</template>
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-danger btn-sm" @click="handleDelete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Excluir
          </button>
        </div>
      </div>
    </div>

    <div class="detail-body">
      <!-- Items list -->
      <div class="card items-card">
        <div class="section-header">
          <h3 class="section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Exercícios do Plano
          </h3>
          <button class="btn btn-primary btn-sm" @click="openItemModal()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar
          </button>
        </div>

        <div v-if="loadingItems" class="items-list">
          <div v-for="i in 3" :key="i" class="item-row">
            <span class="skeleton" style="width:50%;height:15px"></span>
            <span class="skeleton" style="width:30%;height:13px"></span>
          </div>
        </div>

        <div v-else-if="!store.items.length" class="items-empty">
          <p>Nenhum exercício prescrito ainda.</p>
          <button class="btn btn-ghost btn-sm" @click="openItemModal()">Adicionar primeiro exercício</button>
        </div>

        <div v-else class="items-list">
          <div v-for="item in store.items" :key="item.id" class="item-row">
            <div class="item-chips">
              <span v-if="item.sets" class="item-chip chip-blue">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ item.sets }} séries
              </span>
              <span v-if="item.repetitions" class="item-chip chip-teal">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                {{ item.repetitions }} reps
              </span>
              <span v-if="item.duration_seconds" class="item-chip chip-amber">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ formatDuration(item.duration_seconds) }}
              </span>
            </div>
            <div class="item-freq" v-if="item.frequency_text">{{ item.frequency_text }}</div>
            <div class="item-actions">
              <button class="icon-btn" @click="openItemModal(item)" title="Editar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="icon-btn danger" @click="deleteItem(item.id)" title="Excluir">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showItemModal" class="modal-overlay" @click.self="closeItemModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>{{ editingItem ? 'Editar Exercício' : 'Novo Exercício' }}</h3>
              <button class="icon-btn" @click="closeItemModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleItemSubmit" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Séries</label>
                  <input v-model.number="itemForm.sets" type="number" min="1" class="form-input" placeholder="3" />
                </div>
                <div class="form-group">
                  <label class="form-label">Repetições</label>
                  <input v-model.number="itemForm.repetitions" type="number" min="1" class="form-input" placeholder="12" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Duração (segundos)</label>
                <input v-model.number="itemForm.duration_seconds" type="number" min="1" class="form-input" placeholder="30" />
              </div>
              <div class="form-group">
                <label class="form-label">Frequência</label>
                <textarea v-model="itemForm.frequency_text" class="form-textarea" placeholder="Ex: 3x por semana, dias alternados..." rows="2"></textarea>
              </div>
              <div v-if="itemError" class="error-msg">{{ itemError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeItemModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="itemSubmitting">
                  <span v-if="itemSubmitting" class="spinner"></span>
                  {{ editingItem ? 'Salvar' : 'Adicionar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>

  <div v-else class="loading-state">
    <div class="spinner"></div>
    <p>Carregando tratamento...</p>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useTreatmentsStore } from '../stores/treatments'

const store = useTreatmentsStore()
const route = useRoute()
const router = useRouter()

const treatment = ref(null)
const loadingItems = ref(false)
const showItemModal = ref(false)
const editingItem = ref(null)
const itemSubmitting = ref(false)
const itemError = ref('')
const itemForm = reactive({ sets: null, repetitions: null, duration_seconds: null, frequency_text: '' })

const statusLabel = { ongoing: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado' }

onMounted(async () => {
  treatment.value = await store.fetchOne(route.params.id)
  loadingItems.value = true
  await store.fetchItems(route.params.id)
  loadingItems.value = false
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDuration(s) {
  if (s >= 60) return `${Math.floor(s / 60)}min${s % 60 ? ` ${s % 60}s` : ''}`
  return `${s}s`
}

async function handleDelete() {
  if (!confirm('Excluir este tratamento?')) return
  await store.remove(treatment.value.id)
  router.push('/treatments')
}

function openItemModal(item = null) {
  editingItem.value = item
  if (item) {
    itemForm.sets = item.sets; itemForm.repetitions = item.repetitions
    itemForm.duration_seconds = item.duration_seconds; itemForm.frequency_text = item.frequency_text || ''
  } else {
    itemForm.sets = null; itemForm.repetitions = null; itemForm.duration_seconds = null; itemForm.frequency_text = ''
  }
  itemError.value = ''; showItemModal.value = true
}

function closeItemModal() { showItemModal.value = false; editingItem.value = null }

async function handleItemSubmit() {
  itemError.value = ''; itemSubmitting.value = true
  const data = {}
  if (itemForm.sets) data.sets = itemForm.sets
  if (itemForm.repetitions) data.repetitions = itemForm.repetitions
  if (itemForm.duration_seconds) data.duration_seconds = itemForm.duration_seconds
  if (itemForm.frequency_text) data.frequency_text = itemForm.frequency_text
  try {
    if (editingItem.value) await store.updateItem(editingItem.value.id, data)
    else await store.createItem(treatment.value.id, data)
    closeItemModal()
  } catch (e) {
    itemError.value = e.response?.data?.message || 'Erro ao salvar exercício.'
  } finally { itemSubmitting.value = false }
}

async function deleteItem(id) {
  if (!confirm('Remover este exercício?')) return
  await store.removeItem(id)
}
</script>

<style scoped>
.detail-page { display: flex; flex-direction: column; gap: 24px; }
.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-muted);
  margin-bottom: 8px; transition: color var(--transition);
}
.back-link:hover { color: var(--teal); }
.header-badges { margin-bottom: 8px; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.detail-title { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
.detail-meta { color: var(--text-muted); font-size: 13px; }
.header-actions { display: flex; gap: 10px; }

.items-card { display: flex; flex-direction: column; gap: 16px; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; }

.items-list { display: flex; flex-direction: column; gap: 2px; }
.item-row {
  display: flex; align-items: center; gap: 12px;
  padding: 14px; border-radius: var(--radius-sm);
  background: var(--surface-2); transition: background var(--transition);
}
.item-row:hover { background: var(--bg); }
.item-chips { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
.item-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 500;
}
.chip-blue { background: var(--blue-dim); color: var(--blue); }
.chip-teal { background: var(--teal-dim); color: var(--teal); }
.chip-amber { background: rgba(245,158,11,0.12); color: var(--amber); }
.item-freq { font-size: 12px; color: var(--text-muted); max-width: 200px; }
.item-actions { display: flex; gap: 4px; margin-left: auto; flex-shrink: 0; }
.icon-btn.danger:hover { background: var(--red-dim); color: var(--red); }

.items-empty {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  text-align: center; color: var(--text-muted); padding: 40px;
}

.loading-state {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 80px; color: var(--text-muted);
}

/* Modal shared */
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 420px; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.error-msg { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; }
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }

.icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; border-radius: 6px; display: flex; transition: all var(--transition); }
.icon-btn:hover { background: var(--surface-2); color: var(--text); }
</style>
