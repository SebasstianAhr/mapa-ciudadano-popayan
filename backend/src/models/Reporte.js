import mongoose from 'mongoose';

const puntoSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (valor) => Array.isArray(valor) && valor.length === 2,
        message: 'La ubicación debe tener [longitud, latitud]',
      },
    },
  },
  { _id: false }
);

const reporteSchema = new mongoose.Schema(
  {
    autor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', required: true },
    descripcion: { type: String, required: true, trim: true, minlength: 5, maxlength: 500 },
    ubicacion: { type: puntoSchema, required: true },
    foto: { type: mongoose.Schema.Types.ObjectId, required: true },
    estado: { type: String, enum: ['activo', 'antiguo'], default: 'activo' },
    oculto: { type: Boolean, default: false },
    totalReconfirmaciones: { type: Number, default: 0, min: 0 },
    ultimaActividad: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }, collection: 'reportes' }
);

reporteSchema.index({ ubicacion: '2dsphere' });
reporteSchema.index({ estado: 1, categoria: 1 });
reporteSchema.index({ autor: 1, creadoEn: -1 });
reporteSchema.index({ estado: 1, ultimaActividad: 1 });

export const Reporte = mongoose.model('Reporte', reporteSchema);
