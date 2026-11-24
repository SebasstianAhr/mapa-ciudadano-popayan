import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    rol: { type: String, enum: ['ciudadano', 'admin'], default: 'ciudadano' },
  },
  { timestamps: { createdAt: 'creadoEn', updatedAt: 'actualizadoEn' }, collection: 'usuarios' }
);

export const Usuario = mongoose.model('Usuario', usuarioSchema);
