<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({
  email: '',
  password: '',
});

async function submit() {
  await auth.login(form);
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null;
  if (redirect) {
    router.push(redirect);
    return;
  }
  router.push(auth.role === 'CLIENT' ? { name: 'client-home' } : { name: 'trainer-dashboard' });
}
</script>

<template>
  <section class="auth">
    <div class="card-panel panel">
      <h1 class="display">Entrar</h1>
      <p class="muted">Acceso para entrenador o cliente</p>
      <form class="form" @submit.prevent="submit">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            autocomplete="current-password"
          />
        </div>
        <p v-if="auth.error" class="error-text">{{ auth.error }}</p>
        <button class="btn btn-primary" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Entrando…' : 'Iniciar sesión' }}
        </button>
      </form>
      <p class="muted links">
        <RouterLink to="/register">Crear cuenta entrenador</RouterLink>
        ·
        <RouterLink to="/">Inicio</RouterLink>
      </p>
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
  width: min(420px, 100%);
  display: grid;
  gap: 1rem;
}

.form {
  display: grid;
  gap: 0.9rem;
}

.links {
  margin: 0;
  font-size: 0.9rem;
}
</style>
