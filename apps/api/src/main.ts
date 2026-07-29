import { createApp } from './app.js';
import { env } from './shared/infrastructure/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`FitStack API listening on http://localhost:${env.port}`);
});
