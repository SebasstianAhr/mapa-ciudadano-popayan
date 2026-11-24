import mongoose from 'mongoose';

const configuracionSchema = new mongoose.Schema(
  {
    clave: { type: String, required: true, unique: true, default: 'general' },
    vencimientoMinutos: { type: Number, default: 43200, min: 1 },
    diasEntreReconfirmaciones: { type: Number, default: 7, min: 0 },
    limiteDiario: { type: Number, default: 10, min: 1 },
    radioDuplicadoMetros: { type: Number, default: 30, min: 1 },
    areaPopayan: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]], required: true },
    },
  },
  { collection: 'configuracion', versionKey: false }
);

configuracionSchema.index({ areaPopayan: '2dsphere' });

export const Configuracion = mongoose.model('Configuracion', configuracionSchema);
