<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

type Client = {
  id: string;
  fullName: string;
  email: string | null;
  goals: string | null;
  status: string;
};

const auth = useAuthStore();
const clients = ref<Client[]>([]);
const error = ref<string | null>(null);
const creating = ref(false);

const form = reactive({
  fullName: '',
  email: '',
  goals: '',
});

async function load() {
  clients.value = await api<Client[]>('/clients', { token: auth.accessToken });
}

async function createClient() {
  creating.value = true;
  error.value = null;
  try {
    await api('/clients', {
      method: 'POST',
      token: auth.accessToken,
      body: JSON.stringify({
        fullName: form.fullName,
        email: form.email || undefined,
        goals: form.goals || undefined,
      }),
    });
    form.fullName = '';
    form.email = '';
    form.goals = '';
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo crear';
  } finally {
    creating.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="page">
    <header>
      <h1 class="display">Clientes</h1>
      <p class="muted">Un entrenador · muchos clientes</p>
    </header>

    <form class="card-panel form" @submit.prevent="createClient">
      <h2>Nuevo cliente</h2>
      <div class="grid">
        <div class="field">
          <label for="fullName">Nombre</label>
          <input id="fullName" v-model="form.fullName" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" />
        </div>
      </div>
      <div class="field">
        <label for="goals">Objetivos</label>
        <textarea id="goals" v-model="form.goals" rows="2" />
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="creating">
        {{ creating ? 'Guardando…' : 'Registrar cliente' }}
      </button>
    </form>

    <div class="card-panel">
      <ul>
        <li v-for="client in clients" :key="client.id">
          <div>
            <strong>{{ client.fullName }}</strong>
            <p class="muted">{{ client.goals || 'Sin objetivo' }}</p>
            <p class="id">ID para activar app: {{ client.id }}</p>
          </div>
          <span class="status">{{ client.status }}</span>
        </li>
      </ul>
      <p v-if="!clients.length" class="muted">Sin clientes todavía.</p>
    </div>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 1.25rem;
}

header h1 {
  font-size: 3rem;
}

header p,
.muted {
  margin: 0.3rem 0 0;
}

.form {
  display: grid;
  gap: 0.9rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
}

.id {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: var(--accent);
  word-break: break-all;
}

.status {
  align-self: start;
  font-size: 0.75rem;
  color: var(--ink-muted);
  letter-spacing: 0.06em;
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
