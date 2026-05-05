<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-logo">
        <div class="logo-mark">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2L3 7v8l8 5 8-5V7L11 2z" stroke="var(--teal)" stroke-width="1.5" fill="none"/>
            <path d="M11 7v8M7 9.5l4 2.5 4-2.5" stroke="var(--teal)" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <span class="logo-text">Reably</span>
      </div>

      <nav class="sidebar-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-item" @click="sidebarOpen = false">
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-info">
            <div class="user-name">{{ auth.user?.name }}</div>
            <div class="user-role">Fisioterapeuta</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm logout-btn" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div class="overlay" :class="{ active: sidebarOpen }" @click="sidebarOpen = false"></div>

    <!-- Main content -->
    <div class="main-wrapper">
      <header class="topbar">
        <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="topbar-title">{{ currentTitle }}</div>
        <div class="topbar-actions">
          <div class="status-dot"></div>
          <span class="status-text">Online</span>
        </div>
      </header>

      <main class="page-content">
        <Transition name="fade" mode="out-in">
          <RouterView :key="$route.path" />
        </Transition>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)

const userInitial = computed(() => auth.user?.name?.[0]?.toUpperCase() || 'U')

const navItems = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
  },
  {
    to: '/treatments', label: 'Tratamentos',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12h6M12 9v6"/><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`
  },
  {
    to: '/patients', label: 'Pacientes',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87"/></svg>`
  },
  {
    to: '/profile', label: 'Perfil',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>`
  },
]

const titles = { dashboard: 'Dashboard', treatments: 'Tratamentos', patients: 'Pacientes', profile: 'Perfil' }
const currentTitle = computed(() => {
  const name = route.name
  if (name === 'treatment-detail') return 'Plano de Exercícios'
  return titles[name] || 'Reably'
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-shell {
  display: flex; height: 100vh; overflow: hidden;
}

.sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 100;
}

.sidebar-logo {
  display: flex; align-items: center; gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border);
}
.logo-mark {
  width: 36px; height: 36px;
  background: var(--teal-dim);
  border: 1px solid rgba(14,230,192,0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.logo-text {
  font-family: var(--font-display);
  font-weight: 700; font-size: 16px;
  letter-spacing: -0.03em;
}

.sidebar-nav {
  flex: 1; padding: 16px 12px;
  display: flex; flex-direction: column; gap: 2px;
  overflow-y: auto;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  color: var(--text-muted); font-size: 14px; font-weight: 500;
  transition: all var(--transition);
}
.nav-item:hover { color: var(--text); background: var(--surface-2); }
.nav-item.router-link-active {
  color: var(--teal);
  background: var(--teal-dim);
}
.nav-item.router-link-active .nav-icon { color: var(--teal); }
.nav-icon { flex-shrink: 0; display: flex; }

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px;
}
.user-chip { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--teal-dim); border: 1px solid rgba(14,230,192,0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--teal);
  flex-shrink: 0;
}
.user-info { min-width: 0; }
.user-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role { font-size: 11px; color: var(--text-muted); }
.logout-btn { padding: 7px !important; }

.main-wrapper {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
}
.topbar {
  height: 60px; display: flex; align-items: center; gap: 16px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  flex-shrink: 0;
}
.menu-toggle {
  display: none; background: none; border: none;
  color: var(--text-muted); cursor: pointer; padding: 4px;
}
.topbar-title {
  font-family: var(--font-display); font-weight: 600; font-size: 16px;
  flex: 1;
}
.topbar-actions { display: flex; align-items: center; gap: 8px; }
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
.status-text { font-size: 12px; color: var(--text-muted); }

.page-content {
  flex: 1; overflow-y: auto; padding: 28px 24px;
}

.overlay { display: none; }

@media (max-width: 768px) {
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
  }
  .sidebar.open { transform: translateX(0); }
  .menu-toggle { display: flex; }
  .overlay {
    display: block; position: fixed; inset: 0;
    background: rgba(0,0,0,0.5); z-index: 90;
    opacity: 0; pointer-events: none; transition: opacity 0.3s;
  }
  .overlay.active { opacity: 1; pointer-events: all; }
}
</style>
