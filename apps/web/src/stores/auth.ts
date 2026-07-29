import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api } from '@/lib/api';

export type Role = 'TRAINER' | 'CLIENT';

type Me = {
  id: string;
  email: string;
  role: Role;
  trainerProfile: { id: string; displayName: string; specialty: string | null } | null;
  clientProfile: { id: string; fullName: string; trainerId: string } | null;
};

const ACCESS_KEY = 'fitstack.access';
const REFRESH_KEY = 'fitstack.refresh';
const ROLE_KEY = 'fitstack.role';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem(ACCESS_KEY));
  const refreshToken = ref<string | null>(localStorage.getItem(REFRESH_KEY));
  const role = ref<Role | null>((localStorage.getItem(ROLE_KEY) as Role | null) ?? null);
  const me = ref<Me | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const displayName = computed(() => {
    if (!me.value) return '';
    return me.value.trainerProfile?.displayName ?? me.value.clientProfile?.fullName ?? me.value.email;
  });

  function persist(tokens: { accessToken: string; refreshToken: string; role: Role }) {
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;
    role.value = tokens.role;
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(ROLE_KEY, tokens.role);
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    role.value = null;
    me.value = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(ROLE_KEY);
  }

  async function registerTrainer(input: {
    email: string;
    password: string;
    displayName: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const tokens = await api<{ accessToken: string; refreshToken: string; role: Role }>(
        '/auth/register-trainer',
        { method: 'POST', body: JSON.stringify(input) },
      );
      persist(tokens);
      await fetchMe();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al registrar';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function login(input: { email: string; password: string }) {
    loading.value = true;
    error.value = null;
    try {
      const tokens = await api<{ accessToken: string; refreshToken: string; role: Role }>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify(input) },
      );
      persist(tokens);
      await fetchMe();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al iniciar sesión';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function registerClient(input: {
    email: string;
    password: string;
    clientProfileId: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const tokens = await api<{ accessToken: string; refreshToken: string; role: Role }>(
        '/auth/register-client',
        { method: 'POST', body: JSON.stringify(input) },
      );
      persist(tokens);
      await fetchMe();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error al registrar cliente';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!accessToken.value) return null;
    me.value = await api<Me>('/auth/me', { token: accessToken.value });
    role.value = me.value.role;
    localStorage.setItem(ROLE_KEY, me.value.role);
    return me.value;
  }

  return {
    accessToken,
    refreshToken,
    role,
    me,
    loading,
    error,
    isAuthenticated,
    displayName,
    registerTrainer,
    login,
    registerClient,
    fetchMe,
    logout,
  };
});
