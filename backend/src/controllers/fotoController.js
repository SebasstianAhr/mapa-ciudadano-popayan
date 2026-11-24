import mongoose from 'mongoose';
import { obtenerInfoFoto, abrirFoto } from '../services/fotoService.js';
import { HttpError } from '../utils/HttpError.js';

export async function servirFoto(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Foto no válida');
  const id = new mongoose.Types.ObjectId(String(req.params.id));

  const info = await obtenerInfoFoto(id);
  if (!info) throw new HttpError(404, 'La foto no existe');

  res.set({
    'Content-Type': info.metadata?.contentType ?? 'image/jpeg',
    'Content-Length': info.length,
    'Cache-Control': 'public, max-age=604800, immutable',
  });

  await new Promise((resolve, reject) => {
    abrirFoto(id).on('error', reject).pipe(res).on('finish', resolve).on('error', reject);
  });
}
