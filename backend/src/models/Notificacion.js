import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tipo: { type: String, enum: ['reconfirmado', 'antiguo', 'ocultado'], required: true },
    reporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Reporte', required: true },
    leida: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'creadaEn', updatedAt: false }, collection: 'notificaciones', versionKey: false }
);

notificacionSchema.index({ usuario: 1, leida: 1, creadaEn: -1 });

export const Notificacion = mongoose.model('Notificacion', notificacionSchema);
