import { Reporte } from '../models/Reporte.js';
import { obtenerConfiguracion } from './configuracionService.js';
import { notificarVarios } from './notificacionService.js';
import { restarMinutos } from '../utils/fechas.js';

const INTERVALO_MS = 60 * 1000;
const ESPERA_MINIMA_MS = 15 * 1000;
let ultimaEjecucion = 0;
let enCurso = null;

async function ejecutar() {
  const config = await obtenerConfiguracion();
  const limite = restarMinutos(config.vencimientoMinutos);

  const vencidos = await Reporte.find(
    { estado: 'activo', ultimaActividad: { $lt: limite } },
    { _id: 1, autor: 1 }
  ).lean();

  if (vencidos.length === 0) return 0;

  await Reporte.updateMany(
    { _id: { $in: vencidos.map((r) => r._id) }, estado: 'activo' },
    { $set: { estado: 'antiguo' } }
  );
  await notificarVarios(vencidos, 'antiguo');
  return vencidos.length;
}

export async function aplicarVencimiento() {
  if (enCurso) return enCurso;
  if (Date.now() - ultimaEjecucion < ESPERA_MINIMA_MS) return 0;
  ultimaEjecucion = Date.now();
  enCurso = ejecutar().finally(() => {
    enCurso = null;
  });
  return enCurso;
}

export function iniciarTareaVencimiento() {
  const correr = () =>
    aplicarVencimiento()
      .then((cantidad) => {
        if (cantidad > 0) console.log(`Vencimiento: ${cantidad} reporte(s) pasaron a antiguo`);
      })
      .catch((error) => console.error('Error en la tarea de vencimiento:', error.message));
  correr();
  setInterval(correr, INTERVALO_MS);
}
