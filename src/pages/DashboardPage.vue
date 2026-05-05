<template>
  <div class="dashboard">
    <div class="dash-header">
      <div>
        <h2 class="page-title">Bom dia, {{ firstName }} 👋</h2>
        <p class="page-sub">Aqui está um resumo da sua prática hoje.</p>
      </div>
      <RouterLink to="/treatments" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Novo Tratamento
      </RouterLink>
    </div>

    <!-- Stats grid -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.dimColor, color: stat.color }">
          <span v-html="stat.icon"></span>
        </div>
        <div class="stat-body">
          <div class="stat-value">
            <template v-if="store.loading"><span class="skeleton" style="width:40px;height:28px;display:inline-block"></span></template>
            <template v-else>{{ stat.value }}</template>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-trend" :style="{ color: stat.color }">{{ stat.trend }}</div>
      </div>
    </div>

    <div class="dash-cols">
      <!-- Recent treatments -->
      <div class="card recent-treatments">
        <div class="section-header">
          <h3 class="section-title">Tratamentos Recentes</h3>
          <RouterLink to="/treatments" class="see-all">Ver todos →</RouterLink>
        </div>
        <div v-if="store.loading" class="treatment-list">
          <div v-for="i in 4" :key="i" class="treatment-row skeleton-row">
            <span class="skeleton" style="width:60%;height:16px"></span>
            <span class="skeleton" style="width:80px;height:20px;border-radius:99px"></span>
          </div>
        </div>
        <div v-else-if="!store.treatments.length" class="empty-state">
          <p>Nenhum tratamento encontrado.</p>
          <RouterLink to="/treatments" class="btn btn-ghost btn-sm">Criar primeiro</RouterLink>
        </div>
        <div v-else class="treatment-list">
          <RouterLink
            v-for="t in recentTreatments" :key="t.id"
            :to="`/treatments/${t.id}`"
            class="treatment-row"
          >
            <div class="treatment-info">
              <span class="treatment-title">{{ t.title }}</span>
              <span class="treatment-date">{{ formatDate(t.start_date) }}</span>
            </div>
            <span class="badge" :class="`badge-${t.status}`">{{ statusLabel[t.status] }}</span>
          </RouterLink>
        </div>
      </div>

      <!-- Activity panel -->
      <div class="card activity-panel">
        <div class="section-header">
          <h3 class="section-title">Distribuição por Status</h3>
        </div>
        <div class="donut-wrapper">
          <svg class="donut-svg" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="var(--surface-2)" stroke-width="16"/>
            <circle
              v-for="seg in segments" :key="seg.status"
              cx="60" cy="60" r="48" fill="none"
              :stroke="seg.color" stroke-width="16"
              stroke-dasharray="301.59"
              :stroke-dashoffset="seg.offset"
              :transform="`rotate(${seg.startAngle} 60 60)`"
              stroke-linecap="butt"
            />
          </svg>
          <div class="donut-center">
            <div class="donut-total">{{ store.treatments.length }}</div>
            <div class="donut-label">total</div>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item" v-for="item in legendItems" :key="item.label">
            <span class="legend-dot" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-count">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTreatmentsStore } from '../stores/treatments'

const auth = useAuthStore()
const store = useTreatmentsStore()

onMounted(() => store.fetchAll())

const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'Doutor')
const statusLabel = { ongoing: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado' }

const statusCounts = computed(() => ({
  ongoing: store.treatments.filter(t => t.status === 'ongoing').length,
  completed: store.treatments.filter(t => t.status === 'completed').length,
  cancelled: store.treatments.filter(t => t.status === 'cancelled').length,
}))

const stats = computed(() => [
  {
    label: 'Total de Tratamentos', value: store.treatments.length,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12h6M12 9v6"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    color: 'var(--teal)', dimColor: 'var(--teal-dim)', trend: '↑'
  },
  {
    label: 'Em Andamento', value: statusCounts.value.ongoing,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    color: 'var(--blue)', dimColor: 'var(--blue-dim)', trend: '→'
  },
  {
    label: 'Concluídos', value: statusCounts.value.completed,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>`,
    color: 'var(--green)', dimColor: 'var(--green-dim)', trend: '✓'
  },
  {
    label: 'Cancelados', value: statusCounts.value.cancelled,
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    color: 'var(--red)', dimColor: 'var(--red-dim)', trend: '↓'
  },
])

const recentTreatments = computed(() => store.treatments.slice(0, 6))

const circumference = 2 * Math.PI * 48

const segments = computed(() => {
  const total = store.treatments.length || 1
  const colors = { ongoing: 'var(--blue)', completed: 'var(--green)', cancelled: 'var(--red)' }
  const statuses = ['ongoing', 'completed', 'cancelled']
  let startAngle = -90
  return statuses.map(status => {
    const count = statusCounts.value[status]
    const fraction = count / total
    const dash = fraction * circumference
    const offset = circumference - dash
    const angle = startAngle
    startAngle += fraction * 360
    return { status, color: colors[status], offset, startAngle: angle, dash }
  })
})

const legendItems = computed(() => [
  { label: 'Em andamento', color: 'var(--blue)', count: statusCounts.value.ongoing },
  { label: 'Concluídos', color: 'var(--green)', count: statusCounts.value.completed },
  { label: 'Cancelados', color: 'var(--red)', count: statusCounts.value.cancelled },
])

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }
.dash-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.page-title { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
.page-sub { color: var(--text-muted); font-size: 14px; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px;
  display: flex; align-items: center; gap: 16px;
  transition: border-color var(--transition);
}
.stat-card:hover { border-color: var(--border-light); }
.stat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-body { flex: 1; }
.stat-value { font-family: var(--font-display); font-size: 26px; font-weight: 700; line-height: 1; }
.stat-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.stat-trend { font-size: 18px; font-weight: 700; }

.dash-cols { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
@media (max-width: 900px) { .dash-cols { grid-template-columns: 1fr; } }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.section-title { font-size: 15px; font-weight: 600; }
.see-all { font-size: 13px; color: var(--teal); }
.see-all:hover { text-decoration: underline; }

.treatment-list { display: flex; flex-direction: column; gap: 4px; }
.treatment-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px; border-radius: var(--radius-sm);
  transition: background var(--transition);
  cursor: pointer; gap: 12px;
}
.treatment-row:hover { background: var(--surface-2); }
.skeleton-row { cursor: default; }
.skeleton-row:hover { background: transparent; }
.treatment-info { display: flex; flex-direction: column; gap: 2px; }
.treatment-title { font-size: 14px; font-weight: 500; }
.treatment-date { font-size: 12px; color: var(--text-muted); }

.empty-state { text-align: center; padding: 40px 20px; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px; }

.donut-wrapper { position: relative; width: 140px; margin: 0 auto 20px; }
.donut-svg { width: 140px; height: 140px; }
.donut-center {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.donut-total { font-family: var(--font-display); font-size: 28px; font-weight: 700; line-height: 1; }
.donut-label { font-size: 11px; color: var(--text-muted); }

.legend { display: flex; flex-direction: column; gap: 10px; }
.legend-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { flex: 1; color: var(--text-dim); }
.legend-count { font-weight: 600; font-family: var(--font-display); }
</style>
