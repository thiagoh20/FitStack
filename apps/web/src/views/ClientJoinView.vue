<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  clientProfileId: '',
  email: '',
  password: '',
});

async function submit() {
  await auth.registerClient(form);
  router.push({ name: 'client-home' });
}
</script>

<template>
  <section class="auth">
    <div class="card-panel panel">
      <h1 class="display">Activar cuenta</h1>
      <p class="muted">
        Tu entrenador te habrá creado un perfil. Usa el ID de cliente que te compartió.
      </p>
      <form class="form" @submit.prevent="submit">
        <div class="field">
          <label for="clientProfileId">ID de cliente</label>
          <input id="clientProfileId" v-model="form.clientProfileId" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" required />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" minlength="8" required />
        </div>
        <p v-if="auth.error" class="error-text">{{ auth.error }}</p>
        <button class="btn btn-primary" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Activando…' : 'Activar' }}
        </button>
      </form>
      <p class="muted"><RouterLink to="/login">Ya tengo cuenta</RouterLink></p>
    </div>
  </section>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.panel {
  width: min(440px, 100%);
  display: grid;
  gap: 1rem;
}

.form {
  display: grid;
  gap: 0.9rem;
}
</style>
