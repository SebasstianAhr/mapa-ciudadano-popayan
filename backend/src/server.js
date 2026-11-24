import { env } from './config/env.js';
import { conectarDB } from './config/db.js';
import { app } from './app.js';
import { iniciarTareaVencimiento } from './services/vencimientoService.js';
import { iniciarTiempoReal } from './services/tiempoRealService.js';

await conectarDB();
iniciarTareaVencimiento();
iniciarTiempoReal();

app.listen(env.port, '0.0.0.0', () => {
  console.log(`API escuchando en http://localhost:${env.port}/api`);
});
