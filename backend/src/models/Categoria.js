import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema(
  {
    clave: { type: String, required: true, unique: true, trim: true },
    nombre: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
    color: { type: String, required: true, match: /^#[0-9A-Fa-f]{6}$/ },
    activa: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }, collection: 'categorias' }
);

export const Categoria = mongoose.model('Categoria', categoriaSchema);
