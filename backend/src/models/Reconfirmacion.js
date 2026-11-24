import mongoose from 'mongoose';

const reconfirmacionSchema = new mongoose.Schema(
  {
    reporte: { type: mongoose.Schema.Types.ObjectId, ref: 'Reporte', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, default: Date.now },
  },
  { collection: 'reconfirmaciones', versionKey: false }
);

reconfirmacionSchema.index({ reporte: 1, usuario: 1, fecha: -1 });

export const Reconfirmacion = mongoose.model('Reconfirmacion', reconfirmacionSchema);
