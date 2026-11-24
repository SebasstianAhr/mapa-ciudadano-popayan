import { Notificacion } from '../models/Notificacion.js';

export async function notificar(usuario, tipo, reporte) {
  await Notificacion.create({ usuario, tipo, reporte });
}

export async function notificarVarios(reportes, tipo) {
  if (reportes.length === 0) return;
  await Notificacion.insertMany(
    reportes.map((reporte) => ({ usuario: reporte.autor, tipo, reporte: reporte._id }))
  );
}
