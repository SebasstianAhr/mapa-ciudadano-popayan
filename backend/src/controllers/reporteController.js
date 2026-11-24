import mongoose from 'mongoose';
import { Reporte } from '../models/Reporte.js';
import { Categoria } from '../models/Categoria.js';
import { Reconfirmacion } from '../models/Reconfirmacion.js';
import { Notificacion } from '../models/Notificacion.js';
import { obtenerConfiguracion, estaDentroDePopayan } from '../services/configuracionService.js';
import { guardarFoto, eliminarFoto } from '../services/fotoService.js';
import { notificar } from '../services/notificacionService.js';
import { aplicarVencimiento } from '../services/vencimientoService.js';
import { HttpError } from '../utils/HttpError.js';
import { inicioDelDiaBogota, sumarDias } from '../utils/fechas.js';

const RADIO_TIERRA_METROS = 6378100;
const RADIO_MAXIMO_METROS = 20000;
const ESTADOS = ['activo', 'antiguo'];

function esAdmin(req) {
  return req.usuario?.rol === 'admin';
}

function leerCoordenadas(lat, lng) {
  const latitud = Number(lat);
  const longitud = Number(lng);
  if (!Number.isFinite(latitud) || !Number.isFinite(longitud)) {
    throw new HttpError(400, 'La ubicación no es válida');
  }
  if (Math.abs(latitud) > 90 || Math.abs(longitud) > 180) {
    throw new HttpError(400, 'La ubicación está fuera de rango');
  }
  return { latitud, longitud };
}

function leerId(valor, mensaje) {
  if (!mongoose.isValidObjectId(valor)) throw new HttpError(400, mensaje);
  return new mongoose.Types.ObjectId(String(valor));
}

function formatearCategoria(categoria) {
  if (!categoria || !categoria._id) return { id: categoria };
  return { id: categoria._id, nombre: categoria.nombre, color: categoria.color, clave: categoria.clave };
}

function formatearReporte(reporte, req) {
  const autorId = String(reporte.autor?._id ?? reporte.autor);
  const resultado = {
    id: reporte._id,
    categoria: formatearCategoria(reporte.categoria),
    descripcion: reporte.descripcion,
    ubicacion: { lat: reporte.ubicacion.coordinates[1], lng: reporte.ubicacion.coordinates[0] },
    fotoUrl: `/api/fotos/${reporte.foto}`,
    estado: reporte.estado,
    oculto: reporte.oculto,
    totalReconfirmaciones: reporte.totalReconfirmaciones,
    ultimaActividad: reporte.ultimaActividad,
    creadoEn: reporte.creadoEn,
    esPropio: req.usuario?.id === autorId,
  };
  if (esAdmin(req) && reporte.autor?._id) {
    resultado.autor = { id: reporte.autor._id, nombre: reporte.autor.nombre, correo: reporte.autor.correo };
  }
  return resultado;
}

async function estadoReconfirmacion(reporte, usuarioId, config) {
  if (!usuarioId) return { puede: false, motivo: 'sin-sesion' };
  if (String(reporte.autor?._id ?? reporte.autor) === usuarioId) return { puede: false, motivo: 'propio' };

  const ultima = await Reconfirmacion.findOne({ reporte: reporte._id, usuario: usuarioId })
    .sort({ fecha: -1 })
    .lean();
  if (ultima) {
    const disponibleDesde = sumarDias(config.diasEntreReconfirmaciones, ultima.fecha);
    if (disponibleDesde > new Date()) return { puede: false, motivo: 'reciente', disponibleDesde };
  }
  return { puede: true };
}

async function buscarDuplicados(longitud, latitud, categoriaId, radioMetros) {
  return Reporte.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [longitud, latitud] },
        distanceField: 'distanciaMetros',
        maxDistance: radioMetros,
        spherical: true,
        query: { categoria: categoriaId, estado: 'activo', oculto: false },
      },
    },
    { $limit: 5 },
    {
      $project: {
        autor: 1,
        descripcion: 1,
        foto: 1,
        totalReconfirmaciones: 1,
        creadoEn: 1,
        distanciaMetros: { $round: ['$distanciaMetros', 0] },
      },
    },
  ]);
}

function formatearDuplicado(duplicado, usuarioId) {
  return {
    id: duplicado._id,
    descripcion: duplicado.descripcion,
    fotoUrl: `/api/fotos/${duplicado.foto}`,
    totalReconfirmaciones: duplicado.totalReconfirmaciones,
    creadoEn: duplicado.creadoEn,
    distanciaMetros: duplicado.distanciaMetros,
    esPropio: String(duplicado.autor) === usuarioId,
  };
}

export async function listarReportes(req, res) {
  await aplicarVencimiento();

  const filtro = {};
  if (!(esAdmin(req) && req.query.incluirOcultos === 'true')) filtro.oculto = false;

  if (req.query.estado) {
    if (!ESTADOS.includes(req.query.estado)) throw new HttpError(400, 'Estado no válido');
    filtro.estado = req.query.estado;
  }

  if (req.query.categoria) {
    const ids = String(req.query.categoria)
      .split(',')
      .map((id) => leerId(id, 'Categoría no válida'));
    filtro.categoria = { $in: ids };
  }

  if (req.query.lat !== undefined || req.query.lng !== undefined || req.query.radio !== undefined) {
    const { latitud, longitud } = leerCoordenadas(req.query.lat, req.query.lng);
    const radio = Number(req.query.radio);
    if (!Number.isFinite(radio) || radio <= 0 || radio > RADIO_MAXIMO_METROS) {
      throw new HttpError(400, `El radio debe estar entre 1 y ${RADIO_MAXIMO_METROS} metros`);
    }
    filtro.ubicacion = {
      $geoWithin: { $centerSphere: [[longitud, latitud], radio / RADIO_TIERRA_METROS] },
    };
  }

  const reportes = await Reporte.find(filtro, {
    categoria: 1,
    ubicacion: 1,
    estado: 1,
    oculto: 1,
    totalReconfirmaciones: 1,
  })
    .limit(1000)
    .lean();

  res.json(
    reportes.map((r) => ({
      id: r._id,
      categoria: r.categoria,
      lat: r.ubicacion.coordinates[1],
      lng: r.ubicacion.coordinates[0],
      estado: r.estado,
      oculto: r.oculto,
      totalReconfirmaciones: r.totalReconfirmaciones,
    }))
  );
}

export async function misReportes(req, res) {
  await aplicarVencimiento();
  const reportes = await Reporte.find({ autor: req.usuario.id })
    .sort({ creadoEn: -1 })
    .populate('categoria', 'nombre color clave')
    .lean();
  res.json(reportes.map((r) => formatearReporte(r, req)));
}

export async function detalleReporte(req, res) {
  const id = leerId(req.params.id, 'Reporte no válido');
  const consulta = Reporte.findById(id).populate('categoria', 'nombre color clave');
  if (esAdmin(req)) consulta.populate('autor', 'nombre correo');
  const reporte = await consulta.lean();

  if (!reporte || (reporte.oculto && !esAdmin(req))) throw new HttpError(404, 'El reporte no existe');

  const config = await obtenerConfiguracion();
  const reconfirmacion = await estadoReconfirmacion(reporte, req.usuario?.id, config);
  res.json({ ...formatearReporte(reporte, req), reconfirmacion });
}

export async function consultarDuplicados(req, res) {
  const { latitud, longitud } = leerCoordenadas(req.query.lat, req.query.lng);
  const categoriaId = leerId(req.query.categoria, 'Categoría no válida');
  const config = await obtenerConfiguracion();
  const duplicados = await buscarDuplicados(longitud, latitud, categoriaId, config.radioDuplicadoMetros);
  res.json(duplicados.map((d) => formatearDuplicado(d, req.usuario.id)));
}

export async function crearReporte(req, res) {
  if (!req.file) throw new HttpError(400, 'La foto es obligatoria');

  const { latitud, longitud } = leerCoordenadas(req.body?.lat, req.body?.lng);
  const categoriaId = leerId(req.body?.categoria, 'Selecciona una categoría');
  const descripcion = String(req.body?.descripcion ?? '').trim();
  const confirmarNuevo = req.body?.confirmarNuevo === 'true';

  if (descripcion.length < 5) throw new HttpError(400, 'La descripción debe tener al menos 5 caracteres');
  if (descripcion.length > 500) throw new HttpError(400, 'La descripción no puede superar 500 caracteres');

  const categoria = await Categoria.findOne({ _id: categoriaId, activa: true }).lean();
  if (!categoria) throw new HttpError(400, 'La categoría no existe o está desactivada');

  if (!(await estaDentroDePopayan(longitud, latitud))) {
    throw new HttpError(400, 'La ubicación está fuera de Popayán');
  }

  const config = await obtenerConfiguracion();
  const creadosHoy = await Reporte.countDocuments({
    autor: req.usuario.id,
    creadoEn: { $gte: inicioDelDiaBogota() },
  });
  if (creadosHoy >= config.limiteDiario) {
    throw new HttpError(429, `Alcanzaste el límite de ${config.limiteDiario} reportes por día`);
  }

  const duplicados = (await buscarDuplicados(longitud, latitud, categoriaId, config.radioDuplicadoMetros)).map(
    (d) => formatearDuplicado(d, req.usuario.id)
  );
  const propio = duplicados.find((d) => d.esPropio);
  if (propio) {
    throw new HttpError(409, 'Ya reportaste este problema', { tipo: 'propio', duplicados: [propio] });
  }
  if (duplicados.length > 0 && !confirmarNuevo) {
    throw new HttpError(409, 'Hay reportes parecidos muy cerca', { tipo: 'duplicado', duplicados });
  }

  const fotoId = await guardarFoto(req.file.buffer, req.file.originalname || 'foto', req.file.mimetype);
  try {
    const reporte = await Reporte.create({
      autor: req.usuario.id,
      categoria: categoriaId,
      descripcion,
      ubicacion: { type: 'Point', coordinates: [longitud, latitud] },
      foto: fotoId,
    });
    const completo = await Reporte.findById(reporte._id).populate('categoria', 'nombre color clave').lean();
    res.status(201).json(formatearReporte(completo, req));
  } catch (error) {
    await eliminarFoto(fotoId);
    throw error;
  }
}

export async function eliminarReporte(req, res) {
  const id = leerId(req.params.id, 'Reporte no válido');
  const reporte = await Reporte.findById(id).lean();
  if (!reporte) throw new HttpError(404, 'El reporte no existe');

  const esAutor = String(reporte.autor) === req.usuario.id;
  if (!esAutor && !esAdmin(req)) throw new HttpError(403, 'Solo puedes eliminar tus propios reportes');

  await Promise.all([
    Reconfirmacion.deleteMany({ reporte: id }),
    Notificacion.deleteMany({ reporte: id }),
    eliminarFoto(reporte.foto),
  ]);
  await Reporte.deleteOne({ _id: id });
  res.status(204).end();
}

export async function reconfirmarReporte(req, res) {
  const id = leerId(req.params.id, 'Reporte no válido');
  const reporte = await Reporte.findById(id).lean();
  if (!reporte || reporte.oculto) throw new HttpError(404, 'El reporte no existe');

  const config = await obtenerConfiguracion();
  const estado = await estadoReconfirmacion(reporte, req.usuario.id, config);
  if (estado.motivo === 'propio') throw new HttpError(403, 'No puedes reconfirmar tu propio reporte');
  if (estado.motivo === 'reciente') {
    throw new HttpError(409, 'Ya reconfirmaste este reporte hace poco', {
      disponibleDesde: estado.disponibleDesde,
    });
  }

  await Reconfirmacion.create({ reporte: id, usuario: req.usuario.id });
  const actualizado = await Reporte.findByIdAndUpdate(
    id,
    { $inc: { totalReconfirmaciones: 1 }, $set: { ultimaActividad: new Date(), estado: 'activo' } },
    { new: true }
  )
    .populate('categoria', 'nombre color clave')
    .lean();
  await notificar(reporte.autor, 'reconfirmado', id);

  const reconfirmacion = await estadoReconfirmacion(actualizado, req.usuario.id, config);
  res.json({ ...formatearReporte(actualizado, req), reconfirmacion });
}

export async function cambiarVisibilidad(req, res) {
  const id = leerId(req.params.id, 'Reporte no válido');
  if (typeof req.body?.oculto !== 'boolean') throw new HttpError(400, 'Indica si el reporte queda oculto');

  const anterior = await Reporte.findByIdAndUpdate(id, { $set: { oculto: req.body.oculto } }).lean();
  if (!anterior) throw new HttpError(404, 'El reporte no existe');
  if (req.body.oculto && !anterior.oculto) await notificar(anterior.autor, 'ocultado', id);

  const reporte = await Reporte.findById(id)
    .populate('categoria', 'nombre color clave')
    .populate('autor', 'nombre correo')
    .lean();
  res.json(formatearReporte(reporte, req));
}
