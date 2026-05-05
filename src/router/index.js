import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', name: 'login', component: () => import('../pages/LoginPage.vue'), meta: { public: true } },
  { path: '/register', name: 'register', component: () => import('../pages/RegisterPage.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard', component: () => import('../pages/DashboardPage.vue') },
      { path: 'treatments', name: 'treatments', component: () => import('../pages/TreatmentsPage.vue') },
      { path: 'treatments/:id', name: 'treatment-detail', component: () => import('../pages/TreatmentDetailPage.vue') },
      { path: 'patients', name: 'patients', component: () => import('../pages/PatientsPage.vue') },
      { path: 'profile', name: 'profile', component: () => import('../pages/ProfilePage.vue') },
      { path: 'patients/:id', name: 'patient-detail', component: () => import('../pages/PatientDetailPage.vue') },
    ]
  },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) return '/login'
  if ((to.path === '/login' || to.path === '/register') && auth.isAuthenticated) return '/dashboard'
  if (auth.isAuthenticated && !auth.user) await auth.fetchUser()
})

export default router
