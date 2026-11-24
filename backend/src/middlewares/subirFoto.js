import multer from 'multer';
import { HttpError } from '../utils/HttpError.js';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 5 * 1024 * 1024;

const cargador = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO, files: 1 },
  fileFilter: (_req, archivo, listo) => {
    if (TIPOS_PERMITIDOS.includes(archivo.mimetype)) return listo(null, true);
    listo(new HttpError(400, 'La foto debe ser JPG, PNG o WEBP'));
  },
});

export function subirFoto(req, res, next) {
  cargador.single('foto')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return next(new HttpError(400, 'La foto no puede pesar más de 5 MB'));
    }
    next(error);
  });
}
