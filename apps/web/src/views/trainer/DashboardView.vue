<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

type Client = {
  id: string;
  fullName: string;
  goals: string | null;
  status: string;
};

const auth = useAuthStore();
const clients = ref<Client[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    clients.value = await api<Client[]>('/clients', { token: auth.accessToken });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="page">
    <header>
      <h1 class="display">Dashboard</h1>
      <p class="muted">Resumen de tu cartera de clientes</p>
    </header>

    <div class="stats">
      <article class="card-panel">
        <p class="label">Clientes</p>
        <p class="value">{{ loading ? '…' : clients.length }}</p>
      </article>
      <article class="card-panel">
        <p class="label">Activos</p>
        <p class="value">
          {{ loading ? '…' : clients.filter((c) => c.status === 'ACTIVE').length }}
        </p>
      </article>
    </div>

    <div class="card-panel list">
      <div class="list-head">
        <h2>Últimos clientes</h2>
        <RouterLink class="btn btn-ghost" to="/trainer/clients">Ver todos</RouterLink>
      </div>
      <ul v-if="clients.length">
        <li v-for="client in clients.slice(0, 5)" :key="client.id">
          <strong>{{ client.fullName }}</strong>
          <span class="muted">{{ client.goals || 'Sin objetivo' }}</span>
        </li>
      </ul>
      <p v-else class="muted">Aún no hay clientes. Empieza registrando el primero.</p>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 1.5rem;
}

header h1 {
  font-size: 3rem;
}

header p {
  margin: 0.35rem 0 0;
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 1rem;
}

.label {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.85rem;
}

.value {
  margin: 0.35rem 0 0;
  font-size: 2rem;
  font-family: var(--font-display);
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--line);
}
</style>
