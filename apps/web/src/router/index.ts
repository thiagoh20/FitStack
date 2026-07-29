import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterTrainerView.vue'),
      meta: { guest: true },
    },
    {
      path: '/client/join',
      name: 'client-join',
      component: () => import('@/views/ClientJoinView.vue'),
      meta: { guest: true },
    },
    {
      path: '/trainer',
      component: () => import('@/layouts/TrainerLayout.vue'),
      meta: { requiresAuth: true, role: 'TRAINER' },
      children: [
        {
          path: '',
          name: 'trainer-dashboard',
          component: () => import('@/views/trainer/DashboardView.vue'),
        },
        {
          path: 'clients',
          name: 'trainer-clients',
          component: () => import('@/views/trainer/ClientsView.vue'),
        },
        {
          path: 'programs',
          name: 'trainer-programs',
          component: () => import('@/views/trainer/ProgramsView.vue'),
        },
      ],
    },
    {
      path: '/client',
      component: () => import('@/layouts/ClientLayout.vue'),
      meta: { requiresAuth: true, role: 'CLIENT' },
      children: [
        {
          path: '',
          name: 'client-home',
          component: () => import('@/views/client/HomeView.vue'),
        },
        {
          path: 'progress',
          name: 'client-progress',
          component: () => import('@/views/client/ProgressView.vue'),
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.isAuthenticated && !auth.me) {
    try {
      await auth.fetchMe();
    } catch {
      auth.logout();
    }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return auth.role === 'CLIENT' ? { name: 'client-home' } : { name: 'trainer-dashboard' };
  }

  if (to.meta.role && auth.role && to.meta.role !== auth.role) {
    return auth.role === 'CLIENT' ? { name: 'client-home' } : { name: 'trainer-dashboard' };
  }

  return true;
});
