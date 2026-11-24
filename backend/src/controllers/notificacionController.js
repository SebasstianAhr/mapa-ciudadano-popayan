import mongoose from 'mongoose';
import { Notificacion } from '../models/Notificacion.js';
import { HttpError } from '../utils/HttpError.js';

const MENSAJES = {
  reconfirmado: 'Alguien confirmó que tu reporte sigue ahí',
  antiguo: 'Tu reporte pasó a antiguo por falta de reconfirmaciones',
  ocultado: 'Un moderador ocultó tu reporte',
};

export async function listarNotificaciones(req, res) {
  const usuario = req.usuario.id;
  const [notificaciones, noLeidas] = await Promise.all([
    Notificacion.find({ usuario }).sort({ creadaEn: -1 }).limit(30).lean(),
    Notificacion.countDocuments({ usuario, leida: false }),
  ]);

  res.json({
    noLeidas,
    notificaciones: notificaciones.map((n) => ({
      id: n._id,
      tipo: n.tipo,
      mensaje: MENSAJES[n.tipo],
      reporteId: n.reporte,
      leida: n.leida,
      creadaEn: n.creadaEn,
    })),
  });
}

export async function marcarLeida(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Notificación no válida');
  const resultado = await Notificacion.updateOne(
    { _id: req.params.id, usuario: req.usuario.id },
    { $set: { leida: true } }
  );
  if (resultado.matchedCount === 0) throw new HttpError(404, 'La notificación no existe');
  res.status(204).end();
}

export async function marcarTodasLeidas(req, res) {
  await Notificacion.updateMany({ usuario: req.usuario.id, leida: false }, { $set: { leida: true } });
  res.status(204).end();
}
