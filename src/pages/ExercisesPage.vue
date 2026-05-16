<template>
  <div class="exercises-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Exercícios</h2>
        <p class="page-sub">Gerencie a biblioteca de exercícios para prescrever aos pacientes.</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Exercício
      </button>
    </div>

    <div class="filters-bar">
      <div class="search-wrapper">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" class="search-input" placeholder="Buscar por título..." />
      </div>
    </div>

    <div v-if="store.loading" class="exercises-grid">
      <div v-for="i in 6" :key="i" class="card exercise-card skeleton-card">
        <span class="skeleton" style="width:60%;height:18px"></span>
        <span class="skeleton" style="width:40%;height:13px;margin-top:8px"></span>
        <span class="skeleton" style="width:80px;height:22px;border-radius:99px;margin-top:16px"></span>
      </div>
    </div>

    <div v-else-if="!filtered.length" class="empty-state card">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
      <p>Nenhum exercício encontrado.</p>
      <button class="btn btn-primary" @click="openModal()">Criar exercício</button>
    </div>

    <div v-else class="exercises-grid">
      <div v-for="e in filtered" :key="e.id" class="card exercise-card">
        <div class="ec-header">
          <span class="category-badge">{{ e.category }}</span>
          <div class="ec-actions">
            <button class="icon-btn" @click="openModal(e)" title="Editar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-btn danger" @click="handleDelete(e)" title="Excluir">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
        <h3 class="ec-title">{{ e.title }}</h3>
        <p v-if="e.description" class="ec-desc">{{ e.description }}</p>
        <div v-if="e.video_url" class="ec-video-wrapper">
          <a v-if="isYoutubeUrl(e.video_url)" :href="e.video_url" target="_blank" class="ec-video" @click.stop>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Ver no YouTube
          </a>
          <a v-else :href="e.video_url" target="_blank" class="ec-video" @click.stop>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Ver vídeo
          </a>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>{{ editing ? 'Editar Exercício' : 'Novo Exercício' }}</h3>
              <button class="icon-btn" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="handleSubmit" class="modal-form" enctype="multipart/form-data">
              <div class="form-group">
                <label class="form-label">Título *</label>
                <input v-model="form.title" class="form-input" required placeholder="Ex: Agachamento" />
              </div>
              <div class="form-group">
                <label class="form-label">Categoria *</label>
                <select v-model="form.category" class="form-select" required>
                  <option value="" disabled>Selecione</option>
                  <option value="forca">Força</option>
                  <option value="alongamento">Alongamento</option>
                  <option value="equilibrio">Equilíbrio</option>
                  <option value="aerobico">Aeróbico</option>
                  <option value="funcional">Funcional</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea v-model="form.description" class="form-textarea" placeholder="Descrição do exercício..." rows="3"></textarea>
              </div>

              <div class="video-toggle">
                <button type="button" class="toggle-btn" :class="{ active: videoMode === 'url' }" @click="videoMode = 'url'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Link (YouTube)
                </button>
                <button type="button" class="toggle-btn" :class="{ active: videoMode === 'upload' }" @click="videoMode = 'upload'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
              </div>

              <div v-if="videoMode === 'url'" class="form-group">
                <label class="form-label">URL do Vídeo</label>
                <input v-model="form.video_url" class="form-input" placeholder="https://youtube.com/..." />
              </div>

              <div v-if="videoMode === 'upload'" class="form-group">
                <label class="form-label">Arquivo de vídeo</label>
                <div class="file-upload-area" @click="fileInput.click()" @dragover.prevent @drop.prevent="handleFileDrop">
                  <input ref="fileInput" type="file" accept="video/mp4,video/mov,video/avi,video/webm,video/mkv" class="file-input-hidden" @change="handleFileSelect" />
                  <template v-if="videoFile">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    <span class="file-name">{{ videoFile.name }}</span>
                    <span class="file-size">{{ formatFileSize(videoFile.size) }}</span>
                    <button type="button" class="btn btn-ghost btn-sm" @click.stop="removeFile">Remover</button>
                  </template>
                  <template v-else>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span class="upload-hint">Clique ou arraste um vídeo aqui</span>
                    <span class="upload-formats">MP4, MOV, AVI, WEBM, MKV — até 200MB</span>
                  </template>
                </div>
              </div>

              <div v-if="videoMode === 'upload' && editing && editing.video_url" class="current-video-info">
                <span class="current-video-label">Vídeo atual:</span>
                <a :href="editing.video_url" target="_blank" class="current-video-link">{{ editing.video_url }}</a>
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
import { useExercisesStore } from '../stores/exercises'
import api from '../api/client'
import { exercisesApi } from '../api/services'

const store = useExercisesStore()
onMounted(() => store.fetchAll())

const search = ref('')
const showModal = ref(false)
const editing = ref(null)
const submitting = ref(false)
const modalError = ref('')
const form = reactive({ title: '', category: '', description: '', video_url: '' })
const videoMode = ref('url')
const videoFile = ref(null)
const fileInput = ref(null)

const filtered = computed(() => {
  return store.exercises.filter(e =>
    !search.value || e.title.toLowerCase().includes(search.value.toLowerCase())
  )
})

function isYoutubeUrl(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'))
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) videoFile.value = file
}

function handleFileDrop(e) {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) videoFile.value = file
}

function removeFile() {
  videoFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function openModal(exercise = null) {
  editing.value = exercise
  videoMode.value = 'url'
  videoFile.value = null
  if (exercise) {
    form.title = exercise.title
    form.category = exercise.category
    form.description = exercise.description || ''
    form.video_url = exercise.video_url || ''
  } else {
    form.title = ''
    form.category = ''
    form.description = ''
    form.video_url = ''
  }
  modalError.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false; editing.value = null; videoFile.value = null }

async function handleSubmit() {
  modalError.value = ''; submitting.value = true
  try {
    if (videoFile.value instanceof File) {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('category', form.category)
      if (form.description) fd.append('description', form.description)
      fd.append('video', videoFile.value)

      let res
      if (editing.value) {
        fd.append('_method', 'PUT')
        res = await api.post(`/exercises/${editing.value.id}`, fd)
      } else {
        res = await api.post('/exercises', fd)
      }
      const updated = res.data.data || res.data
      if (editing.value) {
        const idx = store.exercises.findIndex(e => e.id === editing.value.id)
        if (idx !== -1) store.exercises[idx] = updated
      } else {
        store.exercises.unshift(updated)
      }
    } else {
      const data = { title: form.title, category: form.category }
      if (form.description) data.description = form.description
      if (form.video_url) data.video_url = form.video_url
      await (editing.value ? store.update(editing.value.id, data) : store.create(data))
    }
    closeModal()
  } catch (e) {
    const errs = e.response?.data?.errors
    const msg = e.response?.data?.message
    modalError.value = errs ? Object.values(errs).flat().join(', ') : (msg || 'Erro ao salvar exercício.')
  } finally { submitting.value = false }
}

async function handleDelete(exercise) {
  if (!confirm(`Excluir "${exercise.title}"?`)) return
  await store.remove(exercise.id)
}
</script>

<style scoped>
.exercises-page { display: flex; flex-direction: column; gap: 20px; }
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

.exercises-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.exercise-card {
  display: flex; flex-direction: column; gap: 10px;
  transition: border-color var(--transition), transform var(--transition);
}
.exercise-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
.skeleton-card { cursor: default; }
.skeleton-card:hover { transform: none; }

.ec-header { display: flex; align-items: center; justify-content: space-between; }
.ec-actions { display: flex; gap: 4px; }
.category-badge {
  font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 3px 10px; border-radius: 99px;
  background: var(--teal-dim); color: var(--teal);
}
.ec-title { font-size: 16px; font-weight: 600; line-height: 1.3; }
.ec-desc { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
.ec-video-wrapper { margin-top: auto; }
.ec-video {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--blue);
}
.ec-video:hover { text-decoration: underline; }

.icon-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 4px; border-radius: 6px;
  display: flex; transition: all var(--transition);
}
.icon-btn:hover { background: var(--surface-2); color: var(--text); }
.icon-btn.danger:hover { background: var(--red-dim); color: var(--red); }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  text-align: center; color: var(--text-muted); padding: 60px;
}

.video-toggle {
  display: flex; gap: 8px;
}
.toggle-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--text-muted); font-size: 13px;
  cursor: pointer; transition: all var(--transition);
}
.toggle-btn:hover { border-color: var(--border-light); color: var(--text); }
.toggle-btn.active { border-color: var(--teal); background: var(--teal-dim); color: var(--teal); }

.file-input-hidden { display: none; }
.file-upload-area {
  border: 2px dashed var(--border); border-radius: var(--radius-sm);
  padding: 24px 16px; text-align: center; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  transition: all var(--transition);
}
.file-upload-area:hover { border-color: var(--teal); background: var(--teal-dim); }
.file-name { font-size: 14px; font-weight: 500; color: var(--text); }
.file-size { font-size: 12px; color: var(--text-muted); }
.upload-hint { font-size: 14px; color: var(--text-muted); }
.upload-formats { font-size: 11px; color: var(--text-muted); }

.current-video-info {
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 14px; background: var(--surface-2); border-radius: var(--radius-sm);
}
.current-video-label { font-size: 12px; color: var(--text-muted); }
.current-video-link { font-size: 12px; color: var(--blue); word-break: break-all; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); width: 100%; max-width: 500px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border);
}
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.error-msg { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }
</style>
