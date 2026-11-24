import mongoose from 'mongoose';
import { HttpError } from '../utils/HttpError.js';

export function rutaNoEncontrada(req, _res, next) {
  next(new HttpError(404, `La ruta ${req.method} ${req.originalUrl} no existe`));
}

export function manejoErrores(error, _req, res, _next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ mensaje: error.message, detalles: error.detalles });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const primero = Object.values(error.errors)[0];
    return res.status(400).json({ mensaje: primero?.message ?? 'Datos inválidos' });
  }
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ mensaje: 'Identificador inválido' });
  }
  if (error?.code === 11000) {
    return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos' });
  }
  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}
