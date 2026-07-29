<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

type Assignment = {
  id: string;
  startDate: string;
  program: {
    name: string;
    description: string | null;
    workouts: Array<{
      id: string;
      dayIndex: number;
      name: string;
      exercises: Array<{
        sets: number;
        reps: string;
        exercise: { name: string };
      }>;
    }>;
  };
} | null;

const auth = useAuthStore();
const plan = ref<Assignment>(null);
const loading = ref(true);
const logging = ref<string | null>(null);
const message = ref<string | null>(null);

async function load() {
  plan.value = await api<Assignment>('/training/my-plan', { token: auth.accessToken });
  loading.value = false;
}

async function markDone(workoutId: string) {
  if (!auth.me?.clientProfile?.id) return;
  logging.value = workoutId;
  message.value = null;
  try {
    await api(`/progress/clients/${auth.me.clientProfile.id}/session-logs`, {
      method: 'POST',
      token: auth.accessToken,
      body: JSON.stringify({ workoutId }),
    });
    message.value = 'Sesión registrada';
  } catch (e) {
    message.value = e instanceof Error ? e.message : 'No se pudo registrar';
  } finally {
    logging.value = null;
  }
}

onMounted(load);
</script>

<template>
  <section class="page">
    <header>
      <h1 class="display">Mi plan</h1>
      <p class="muted">Tu programa activo</p>
    </header>

    <p v-if="loading" class="muted">Cargando…</p>

    <div v-else-if="!plan" class="card-panel">
      <p class="muted">Todavía no tienes un programa asignado. Tu entrenador lo cargará pronto.</p>
    </div>

    <template v-else>
      <div class="card-panel">
        <h2>{{ plan.program.name }}</h2>
        <p class="muted">{{ plan.program.description || 'Sin descripción' }}</p>
      </div>

      <article
        v-for="workout in plan.program.workouts"
        :key="workout.id"
        class="card-panel workout"
      >
        <div class="head">
          <div>
            <p class="day">Día {{ workout.dayIndex + 1 }}</p>
            <h3>{{ workout.name }}</h3>
          </div>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="logging === workout.id"
            @click="markDone(workout.id)"
          >
            {{ logging === workout.id ? 'Guardando…' : 'Marcar hecho' }}
          </button>
        </div>
        <ul>
          <li v-for="(ex, i) in workout.exercises" :key="i">
            <strong>{{ ex.exercise.name }}</strong>
            <span class="muted">{{ ex.sets }} × {{ ex.reps }}</span>
          </li>
        </ul>
      </article>

      <p v-if="message" class="muted">{{ message }}</p>
    </template>
  </section>
</template>

<style scoped>
.page {
  display: grid;
  gap: 1rem;
}

header h1 {
  font-size: 3rem;
}

header p {
  margin: 0.3rem 0 0;
}

.workout .head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.day {
  margin: 0;
  color: var(--accent);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

ul {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.55rem;
  border-top: 1px solid var(--line);
}
</style>
