import DashboardPage from '@/views/DashboardPage.vue'
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

// Auth guard function
const requireAuth = (to: any, from: any, next: any) => {
  // Replace this with your actual auth check
  const isAuthenticated = localStorage.getItem('user-token') // or your auth token
  
  if (!isAuthenticated) {
    next({ path: '/login' })
  } else {
    next()
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  // Auth routes
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/auth/ForgotPasswordPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPasswordPage.vue'),
    meta: { requiresGuest: true }
  },
  // Protected routes
  {
    path: '/dashboard',
    component: DashboardPage,
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        redirect: '/dashboard/my-jobs'
      },
      {
        path: 'my-jobs',
        component: () => import('@/views/tabs/MyJobsTab.vue')
      },
      {
        path: 'ppm-tasks',
        component: () => import('@/views/tabs/PPMTasksTab.vue')
      },
      {
        path: 'reactive-tasks',
        component: () => import('@/views/tabs/ReactiveTasksTab.vue')
      }
    ]
  },
  {
    path: '/calendar',
    component: () => import('@/views/CalendarPage.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/assets',
    component: () => import('@/views/AssetsPage.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/buildings',
    component: () => import('@/views/buildings/BuildingsPage.vue'),
    beforeEnter: requireAuth
  },
  {
    path: '/locations',
    name: 'locations',
    component: () => import('@/views/locations/LocationsPage.vue'),
    beforeEnter: requireAuth
  },
  // Catch all route (404)
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes
})

// Global navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('user-token') // or your auth token
  
  // Redirect to dashboard if authenticated user tries to access auth pages
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ path: '/dashboard/my-jobs' })
    return
  }

  next()
})

export default router
