# FitStack

<<<<<<< HEAD
Lo estas haciendo muy bien :)

estas en la rama de develop (desarrollo)


que bien, ya te voy a subir el proyecto para que lo ejecutes
=======
Plataforma DDD para entrenadores personales: un entrenador gestiona muchos clientes y ambos tienen app (Vue 3).

## Stack

| Capa | Tecnología |
|------|------------|
| API | Node.js, Express, TypeScript, Prisma |
| Front | Vue 3, Vite, Pinia, Vue Router |
| DB | PostgreSQL 16 |

## Estructura

```
apps/
  api/   # Backend DDD (Identity, Clients, Training, Progress)
  web/   # SPA entrenador + cliente
```

## Arranque rápido

Requisito: Docker Desktop encendido (para Postgres).

```bash
# 1. Dependencias
npm install

# 2. Postgres
npm run db:up

# 3. Variables de entorno (si no existe)
cp .env.example apps/api/.env

# 4. Cliente Prisma + migraciones (+ seed opcional)
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. API (puerto 3001) y Web (puerto 5173) — en dos terminales
npm run dev:api
npm run dev:web
```

Seed de demo: `coach@fitstack.dev` / `trainer123`

Flujo cliente: el entrenador crea un cliente → copia el ID → el cliente activa cuenta en `/client/join`.

## Roles

- **TRAINER**: registra clientes, programas, ejercicios y progreso.
- **CLIENT**: ve su plan, registra sesiones y métricas.

## Módulos DDD (API)

- `identity` — auth, usuarios, roles
- `clients` — perfiles de cliente ligados a un entrenador
- `training` — ejercicios, programas, asignaciones
- `progress` — logs de sesión y entradas de progreso
>>>>>>> 9d4e233 (Add proyect)
