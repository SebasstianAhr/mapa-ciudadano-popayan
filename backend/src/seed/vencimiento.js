import mongoose from 'mongoose';
import { conectarDB } from '../config/db.js';
import { Configuracion } from '../models/Configuracion.js';

const minutos = Number(process.argv[2]);

if (!Number.isFinite(minutos) || minutos < 1) {
  console.log('Uso: npm run vencimiento -- <minutos>');
  console.log('Ejemplos: 2 para la demo, 43200 para 30 días');
  process.exit(1);
}

try {
  await conectarDB();
  await Configuracion.updateOne({ clave: 'general' }, { $set: { vencimientoMinutos: minutos } });
  console.log(`Vencimiento configurado en ${minutos} minuto(s). El backend lo aplica en máximo 1 minuto.`);
} finally {
  await mongoose.disconnect();
}
