import bcrypt from 'bcryptjs';
import { Usuario } from '../models/Usuario.js';
import { firmarToken } from '../middlewares/auth.js';
import { HttpError } from '../utils/HttpError.js';

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function respuestaSesion(usuario) {
  return {
    token: firmarToken(usuario),
    usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
  };
}

export async function registrar(req, res) {
  const nombre = String(req.body?.nombre ?? '').trim();
  const correo = String(req.body?.correo ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  if (nombre.length < 2) throw new HttpError(400, 'El nombre debe tener al menos 2 caracteres');
  if (!FORMATO_CORREO.test(correo)) throw new HttpError(400, 'El correo no es válido');
  if (password.length < 6) throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres');

  if (await Usuario.exists({ correo })) throw new HttpError(409, 'Ya existe una cuenta con ese correo');

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, correo, passwordHash });
  res.status(201).json(respuestaSesion(usuario));
}

export async function iniciarSesion(req, res) {
  const correo = String(req.body?.correo ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');

  const usuario = await Usuario.findOne({ correo }).select('+passwordHash');
  const valida = usuario && (await bcrypt.compare(password, usuario.passwordHash));
  if (!valida) throw new HttpError(401, 'Correo o contraseña incorrectos');

  res.json(respuestaSesion(usuario));
}

export async function usuarioActual(req, res) {
  const usuario = await Usuario.findById(req.usuario.id).lean();
  if (!usuario) throw new HttpError(401, 'La cuenta ya no existe');
  res.json({ id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol });
}
