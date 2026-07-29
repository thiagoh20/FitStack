<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

function logout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="shell">
    <header class="top">
      <div>
        <div class="brand display">FitStack</div>
        <p class="muted">Hola, {{ auth.displayName }}</p>
      </div>
      <nav>
        <RouterLink to="/client">Mi plan</RouterLink>
        <RouterLink to="/client/progress">Progreso</RouterLink>
        <button class="btn btn-ghost" type="button" @click="logout">Salir</button>
      </nav>
    </header>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--line);
  background: rgba(15, 20, 18, 0.55);
}

.brand {
  font-size: 1.8rem;
}

.muted {
  margin: 0.15rem 0 0;
}

nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

nav a {
  color: var(--ink-muted);
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
}

nav a.router-link-active {
  background: var(--bg-soft);
  color: var(--ink);
}

.content {
  padding: 1.75rem;
  max-width: 960px;
  margin: 0 auto;
}

@media (max-width: 720px) {
  .top {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
