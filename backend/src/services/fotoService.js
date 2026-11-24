import mongoose from 'mongoose';
import { Readable } from 'node:stream';

const NOMBRE_BUCKET = 'fotos';

function bucket() {
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: NOMBRE_BUCKET });
}

export function guardarFoto(buffer, nombreArchivo, contentType) {
  return new Promise((resolve, reject) => {
    const subida = bucket().openUploadStream(nombreArchivo, { metadata: { contentType } });
    Readable.from(buffer)
      .pipe(subida)
      .on('error', reject)
      .on('finish', () => resolve(subida.id));
  });
}

export async function obtenerInfoFoto(id) {
  const [archivo] = await bucket().find({ _id: id }).limit(1).toArray();
  return archivo ?? null;
}

export function abrirFoto(id) {
  return bucket().openDownloadStream(id);
}

export async function eliminarFoto(id) {
  try {
    await bucket().delete(id);
  } catch (error) {
    if (!String(error?.message).includes('File not found')) throw error;
  }
}
