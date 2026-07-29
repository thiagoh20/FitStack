<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

type ProgressPayload = {
  progress: Array<{
    id: string;
    recordedAt: string;
    weightKg: number | null;
    notes: string | null;
  }>;
  sessions: Array<{
    id: string;
    performedAt: string;
    workout: { name: string };
    rpe: number | null;
  }>;
};

const auth = useAuthStore();
const data = ref<ProgressPayload | null>(null);
const error = ref<string | null>(null);
const saving = ref(false);

const form = reactive({
  weightKg: undefined as number | undefined,
  notes: '',
});

async function load() {
  data.value = await api<ProgressPayload>('/progress/my-progress', { token: auth.accessToken });
}

async function save() {
  if (!auth.me?.clientProfile?.id) return;
  saving.value = true;
  error.value = null;
  try {
    await api(`/progress/clients/${auth.me.clientProfile.id}/progress`, {
      method: 'POST',
      token: auth.accessToken,
      body: JSON.stringify({
        weightKg: form.weightKg,
        notes: form.notes || undefined,
      }),
    });
    form.weightKg = undefined;
    form.notes = '';
    await load();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo guardar';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="page">
    <header>
      <h1 class="display">Progreso</h1>
      <p class="muted">Peso, notas y sesiones completadas</p>
    </header>

    <form class="card-panel form" @submit.prevent="save">
      <h2>Nueva entrada</h2>
      <div class="field">
        <label for="weight">Peso (kg)</label>
        <input id="weight" v-model.number="form.weightKg" type="number" step="0.1" min="1" />
      </div>
      <div class="field">
        <label for="notes">Notas</label>
        <textarea id="notes" v-model="form.notes" rows="2" />
      </div>
      <p v-if="error" class="error-text">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="saving">
        {{ saving ? 'Guardando…' : 'Registrar' }}
      </button>
    </form>

    <div class="columns" v-if="data">
      <div class="card-panel">
        <h3>Medidas</h3>
        <ul>
          <li v-for="entry in data.progress" :key="entry.id">
            <strong>{{ entry.weightKg ?? '—' }} kg</strong>
            <span class="muted">{{ new Date(entry.recordedAt).toLocaleDateString() }}</span>
          </li>
        </ul>
        <p v-if="!data.progress.length" class="muted">Sin registros aún.</p>
      </div>
      <div class="card-panel">
        <h3>Sesiones</h3>
        <ul>
          <li v-for="session in data.sessions" :key="session.id">
            <strong>{{ session.workout.name }}</strong>
            <span class="muted">{{ new Date(session.performedAt).toLocaleDateString() }}</span>
          </li>
        </ul>
        <p v-if="!data.sessions.length" class="muted">Sin sesiones aún.</p>
      </div>
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
  max-width: 420px;
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

ul {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.55rem;
  border-bottom: 1px solid var(--line);
}

@media (max-width: 720px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
</style>
