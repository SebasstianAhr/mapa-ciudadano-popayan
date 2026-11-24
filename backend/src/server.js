import { env } from './config/env.js';
import { conectarDB } from './config/db.js';
import { app } from './app.js';
import { iniciarTareaVencimiento } from './services/vencimientoService.js';

await conectarDB();
iniciarTareaVencimiento();

app.listen(env.port, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${env.port}/api`);
});
