import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/HttpError.js';

export function firmarToken(usuario) {
  return jwt.sign({ id: String(usuario._id), rol: usuario.rol, nombre: usuario.nombre }, env.jwtSecret, {
    expiresIn: '7d',
  });
}

function leerToken(req) {
  const cabecera = req.headers.authorization ?? '';
  const [tipo, token] = cabecera.split(' ');
  if (tipo !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return undefined;
  }
}

export function autenticacionOpcional(req, _res, next) {
  const datos = leerToken(req);
  req.usuario = datos || null;
  next();
}

export function requiereAutenticacion(req, _res, next) {
  const datos = leerToken(req);
  if (datos === null) throw new HttpError(401, 'Debes iniciar sesión');
  if (datos === undefined) throw new HttpError(401, 'Tu sesión expiró, vuelve a iniciar sesión');
  req.usuario = datos;
  next();
}

export function requiereAdmin(req, _res, next) {
  if (req.usuario?.rol !== 'admin') throw new HttpError(403, 'Solo un administrador puede hacer esto');
  next();
}
