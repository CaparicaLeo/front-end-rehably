<template>
  <div class="profile-page">
    <div class="page-header">
      <h2 class="page-title">Meu Perfil</h2>
      <p class="page-sub">Informações da conta e endereço.</p>
    </div>

    <div class="profile-grid">
      <!-- User info -->
      <div class="card profile-card">
        <div class="avatar-section">
          <div class="big-avatar">{{ userInitial }}</div>
          <div>
            <h3 class="profile-name">{{ auth.user?.name }}</h3>
            <p class="profile-email">{{ auth.user?.email }}</p>
            <p class="profile-phone">{{ auth.user?.phone_number }}</p>
          </div>
        </div>
        <div class="divider" style="margin:20px 0"></div>
        <div v-if="auth.user?.doctor" class="doctor-info">
          <h4 class="info-title">Dados Profissionais</h4>
          <div class="info-rows">
            <div class="info-row">
              <span class="info-label">CREFITO</span>
              <span class="info-value">{{ auth.user.doctor.crefito }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Especialidade</span>
              <span class="info-value">{{ auth.user.doctor.specialty }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Addresses -->
      <div class="card address-card">
        <div class="section-header" style="margin-bottom:16px">
          <h3 class="section-title">Endereços</h3>
          <button class="btn btn-primary btn-sm" @click="openAddrModal()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar
          </button>
        </div>

        <div v-if="loadingAddresses" class="addr-list">
          <div v-for="i in 2" :key="i" class="addr-row">
            <span class="skeleton" style="width:70%;height:16px"></span>
            <span class="skeleton" style="width:50%;height:13px;margin-top:6px"></span>
          </div>
        </div>
        <div v-else-if="!addresses.length" class="items-empty">
          <p>Nenhum endereço cadastrado.</p>
        </div>
        <div v-else class="addr-list">
          <div v-for="addr in addresses" :key="addr.id" class="addr-row">
            <div class="addr-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="1.8">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="addr-info">
              <div class="addr-street">{{ addr.street }}, {{ addr.number }}<span v-if="addr.complement"> — {{ addr.complement }}</span></div>
              <div class="addr-city">{{ addr.neighborhood }}, {{ addr.city }} / {{ addr.state }} · {{ addr.postal_code }}</div>
            </div>
            <button class="icon-btn danger" @click="deleteAddress(addr.id)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Address Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddrModal" class="modal-overlay" @click.self="closeAddrModal">
          <div class="modal-box">
            <div class="modal-header">
              <h3>Novo Endereço</h3>
              <button class="icon-btn" @click="closeAddrModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form @submit.prevent="handleAddrSubmit" class="modal-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">CEP *</label>
                  <input v-model="addrForm.postal_code" class="form-input" required placeholder="00000-000" @blur="fetchCep" />
                </div>
                <div class="form-group">
                  <label class="form-label">Número *</label>
                  <input v-model="addrForm.number" class="form-input" required placeholder="123" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Rua</label>
                <input v-model="addrForm.street" class="form-input" placeholder="Preenchido pelo CEP" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Bairro</label>
                  <input v-model="addrForm.neighborhood" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Cidade</label>
                  <input v-model="addrForm.city" class="form-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Estado (UF)</label>
                  <input v-model="addrForm.state" class="form-input" maxlength="2" placeholder="SP" />
                </div>
                <div class="form-group">
                  <label class="form-label">Complemento</label>
                  <input v-model="addrForm.complement" class="form-input" placeholder="Apto, bloco..." />
                </div>
              </div>
              <div v-if="addrError" class="error-msg">{{ addrError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeAddrModal">Cancelar</button>
                <button type="submit" class="btn btn-primary" :disabled="addrSubmitting">
                  <span v-if="addrSubmitting" class="spinner"></span>
                  Salvar
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { addressApi } from '../api/services'

const auth = useAuthStore()
const addresses = ref([])
const loadingAddresses = ref(false)
const showAddrModal = ref(false)
const addrSubmitting = ref(false)
const addrError = ref('')
const addrForm = reactive({ postal_code: '', number: '', street: '', neighborhood: '', city: '', state: '', complement: '' })

const userInitial = computed(() => auth.user?.name?.[0]?.toUpperCase() || 'U')

onMounted(async () => {
  loadingAddresses.value = true
  try {
    const res = await addressApi.list()
    addresses.value = res.data
  } finally { loadingAddresses.value = false }
})

async function fetchCep() {
  const cep = addrForm.postal_code.replace(/\D/g, '')
  if (cep.length !== 8) return
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await res.json()
    if (!data.erro) {
      addrForm.street = data.logradouro
      addrForm.neighborhood = data.bairro
      addrForm.city = data.localidade
      addrForm.state = data.uf
    }
  } catch {}
}

function openAddrModal() { Object.assign(addrForm, { postal_code: '', number: '', street: '', neighborhood: '', city: '', state: '', complement: '' }); addrError.value = ''; showAddrModal.value = true }
function closeAddrModal() { showAddrModal.value = false }

async function handleAddrSubmit() {
  addrError.value = ''; addrSubmitting.value = true
  try {
    const res = await addressApi.create({ ...addrForm, user_id: auth.user.id })
    addresses.value.push(res.data)
    closeAddrModal()
  } catch (e) {
    addrError.value = e.response?.data?.message || 'Erro ao salvar endereço.'
  } finally { addrSubmitting.value = false }
}

async function deleteAddress(id) {
  if (!confirm('Remover este endereço?')) return
  await addressApi.delete(id)
  addresses.value = addresses.value.filter(a => a.id !== id)
}
</script>

<style scoped>
.profile-page { display: flex; flex-direction: column; gap: 20px; }
.page-header { margin-bottom: 4px; }
.page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.page-sub { color: var(--text-muted); font-size: 13px; }
.profile-grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
@media (max-width: 800px) { .profile-grid { grid-template-columns: 1fr; } }
.avatar-section { display: flex; gap: 16px; align-items: center; }
.big-avatar {
  width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0;
  background: var(--teal-dim); border: 2px solid rgba(14,230,192,0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--teal);
}
.profile-name { font-size: 17px; font-weight: 700; margin-bottom: 3px; }
.profile-email { font-size: 13px; color: var(--text-muted); }
.profile-phone { font-size: 13px; color: var(--text-muted); }
.info-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 12px; }
.info-rows { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; align-items: center; }
.info-label { font-size: 13px; color: var(--text-muted); }
.info-value { font-size: 14px; font-weight: 500; }

.section-header { display: flex; align-items: center; justify-content: space-between; }
.section-title { font-size: 15px; font-weight: 600; }
.addr-list { display: flex; flex-direction: column; gap: 4px; }
.addr-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border-radius: var(--radius-sm); background: var(--surface-2); }
.addr-icon { flex-shrink: 0; width: 32px; height: 32px; background: var(--teal-dim); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
.addr-info { flex: 1; }
.addr-street { font-size: 14px; font-weight: 500; }
.addr-city { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.items-empty { text-align: center; color: var(--text-muted); padding: 32px; font-size: 14px; }

.icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 6px; border-radius: 6px; display: flex; transition: all var(--transition); }
.icon-btn:hover { background: var(--surface); color: var(--text); }
.icon-btn.danger:hover { background: var(--red-dim); color: var(--red); }

.modal-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 480px; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.modal-header h3 { font-size: 16px; font-weight: 600; }
.modal-form { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }
.error-msg { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; }
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.95) translateY(10px); }
</style>
