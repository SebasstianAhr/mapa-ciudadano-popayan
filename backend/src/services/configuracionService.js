import { Configuracion } from '../models/Configuracion.js';
import { HttpError } from '../utils/HttpError.js';

const DURACION_CACHE_MS = 60 * 1000;
let cache = null;
let cacheHasta = 0;

export async function obtenerConfiguracion() {
  if (cache && Date.now() < cacheHasta) return cache;
  const config = await Configuracion.findOne({ clave: 'general' }).lean();
  if (!config) {
    throw new HttpError(500, 'La configuración no existe. Ejecuta "npm run seed" en el backend.');
  }
  cache = config;
  cacheHasta = Date.now() + DURACION_CACHE_MS;
  return cache;
}

export async function estaDentroDePopayan(longitud, latitud) {
  const coincidencia = await Configuracion.exists({
    clave: 'general',
    areaPopayan: {
      $geoIntersects: { $geometry: { type: 'Point', coordinates: [longitud, latitud] } },
    },
  });
  return Boolean(coincidencia);
}
