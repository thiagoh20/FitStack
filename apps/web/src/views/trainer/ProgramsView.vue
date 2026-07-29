<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

type Program = {
  id: string;
  name: string;
  description: string | null;
  durationWeeks: number;
  status: string;
};

const auth = useAuthStore();
const programs = ref<Program[]>([]);
const error = ref<string | null>(null);
const saving = ref(false);

const form = reactive({
  name: '',
  description: '',
  durationWeeks: 4,
});

async function load() {
  programs.value = await api<Program[]>('/training/programs', { token: auth.accessToken });
}

async function createProgram() {
  saving.value = true;
  error.value = null;
  try {
    await api('/training/programs', {
      method: 'POST',
      token: auth.accessToken,
      body: JSON.stringify(form),
    });
    form.name = '';
    form.description = '';
    form.durationWeeks = 4;
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo crear';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="page">
    <header>
      <h1 class="display">Programas</h1>
      <p class="muted">Planes que luego asignas a cada cliente</p>
    </header>

    <form class="card-panel form" @submit.prevent="createProgram">
      <h2>Nuevo programa</h2>
      <div class="field">
        <label for="name">Nombre</label>
        <input id="name" v-model="form.name" required />
      </div>
      <div class="field">
        <label for="description">Descripción</label>
        <textarea id="description" v-model="form.description" rows="2" />
      </div>
      <div class="field">
        <label for="weeks">Semanas</label>
        <input id="weeks" v-model.number="form.durationWeeks" type="number" min="1" />
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'Guardando…' : 'Crear programa' }}
      </button>
    </form>

    <div class="grid">
      <article v-for="program in programs" :key="program.id" class="card-panel">
        <h3>{{ program.name }}</h3>
        <p class="muted">{{ program.description || 'Sin descripción' }}</p>
        <p class="meta">{{ program.durationWeeks }} semanas · {{ program.status }}</p>
      </article>
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

header p {
  margin: 0.3rem 0 0;
}

.form {
  display: grid;
  gap: 0.9rem;
  max-width: 520px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.muted,
.meta {
  margin: 0.45rem 0 0;
}

.meta {
  color: var(--accent);
  font-size: 0.85rem;
}
</style>
