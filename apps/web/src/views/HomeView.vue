<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="hero">
    <p class="eyebrow">Entrenamiento con seguimiento real</p>
    <h1 class="display">FitStack</h1>
    <p class="lead">
      El espacio del entrenador para registrar clientes, asignar programas y llevar el proceso —
      y la app del cliente para ejecutarlo.
    </p>
    <div class="actions">
      <RouterLink class="btn btn-primary" to="/register">Soy entrenador</RouterLink>
      <RouterLink class="btn btn-ghost" to="/login">Iniciar sesión</RouterLink>
      <RouterLink class="btn btn-ghost" to="/client/join">Activar cuenta cliente</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: grid;
  align-content: center;
  gap: 1rem;
  padding: 2rem;
  max-width: 820px;
  margin: 0 auto;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  font-weight: 600;
}

h1 {
  font-size: clamp(4rem, 12vw, 7rem);
  line-height: 0.9;
}

.lead {
  max-width: 36rem;
  color: var(--ink-muted);
  font-size: 1.15rem;
  line-height: 1.55;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
