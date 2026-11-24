import { Categoria } from '../models/Categoria.js';
import { HttpError } from '../utils/HttpError.js';

function generarClave(nombre) {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function listarCategorias(req, res) {
  const verTodas = req.usuario?.rol === 'admin' && req.query.todas === 'true';
  const filtro = verTodas ? {} : { activa: true };
  const categorias = await Categoria.find(filtro).sort({ nombre: 1 }).lean();
  res.json(categorias);
}

export async function crearCategoria(req, res) {
  const nombre = String(req.body?.nombre ?? '').trim();
  const color = String(req.body?.color ?? '').trim();
  if (!nombre) throw new HttpError(400, 'El nombre es obligatorio');
  const categoria = await Categoria.create({ clave: generarClave(nombre), nombre, color });
  res.status(201).json(categoria);
}

export async function actualizarCategoria(req, res) {
  const cambios = {};
  if (req.body?.nombre !== undefined) cambios.nombre = String(req.body.nombre).trim();
  if (req.body?.color !== undefined) cambios.color = String(req.body.color).trim();
  if (req.body?.activa !== undefined) cambios.activa = Boolean(req.body.activa);

  const categoria = await Categoria.findByIdAndUpdate(req.params.id, cambios, {
    new: true,
    runValidators: true,
  });
  if (!categoria) throw new HttpError(404, 'La categoría no existe');
  res.json(categoria);
}
