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
    <aside class="sidebar">
      <div class="brand display">FitStack</div>
      <p class="muted coach">{{ auth.displayName }}</p>
      <nav>
        <RouterLink to="/trainer">Dashboard</RouterLink>
        <RouterLink to="/trainer/clients">Clientes</RouterLink>
        <RouterLink to="/trainer/programs">Programas</RouterLink>
      </nav>
      <button class="btn btn-ghost logout" type="button" @click="logout">Salir</button>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.sidebar {
  padding: 1.75rem 1.25rem;
  border-right: 1px solid var(--line);
  background: rgba(15, 20, 18, 0.65);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.brand {
  font-size: 2rem;
}

.coach {
  margin: 0;
  font-size: 0.9rem;
}

nav {
  display: grid;
  gap: 0.35rem;
  margin-top: 1rem;
}

nav a {
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  color: var(--ink-muted);
}

nav a.router-link-active {
  background: var(--bg-soft);
  color: var(--ink);
}

.logout {
  margin-top: auto;
}

.content {
  padding: 2rem;
}

@media (max-width: 860px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
}
</style>
