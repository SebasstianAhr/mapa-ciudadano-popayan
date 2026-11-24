import { Router } from 'express';
import { autenticacionOpcional, requiereAutenticacion, requiereAdmin } from '../middlewares/auth.js';
import { subirFoto } from '../middlewares/subirFoto.js';
import { registrar, iniciarSesion, usuarioActual } from '../controllers/authController.js';
import { listarCategorias, crearCategoria, actualizarCategoria } from '../controllers/categoriaController.js';
import {
  listarReportes,
  misReportes,
  detalleReporte,
  consultarDuplicados,
  crearReporte,
  eliminarReporte,
  reconfirmarReporte,
  cambiarVisibilidad,
} from '../controllers/reporteController.js';
import { obtenerEstadisticas } from '../controllers/estadisticaController.js';
import {
  listarNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
} from '../controllers/notificacionController.js';
import { servirFoto } from '../controllers/fotoController.js';
import { conectarCliente } from '../services/tiempoRealService.js';

export const rutas = Router();

rutas.get('/salud', (_req, res) => res.json({ estado: 'ok' }));

rutas.post('/auth/registro', registrar);
rutas.post('/auth/login', iniciarSesion);
rutas.get('/auth/yo', requiereAutenticacion, usuarioActual);

rutas.get('/categorias', autenticacionOpcional, listarCategorias);
rutas.post('/categorias', requiereAutenticacion, requiereAdmin, crearCategoria);
rutas.patch('/categorias/:id', requiereAutenticacion, requiereAdmin, actualizarCategoria);

rutas.get('/reportes', autenticacionOpcional, listarReportes);
rutas.get('/reportes/mios', requiereAutenticacion, misReportes);
rutas.get('/reportes/duplicados', requiereAutenticacion, consultarDuplicados);
rutas.get('/reportes/:id', autenticacionOpcional, detalleReporte);
rutas.post('/reportes', requiereAutenticacion, subirFoto, crearReporte);
rutas.delete('/reportes/:id', requiereAutenticacion, eliminarReporte);
rutas.post('/reportes/:id/reconfirmar', requiereAutenticacion, reconfirmarReporte);
rutas.patch('/reportes/:id/visibilidad', requiereAutenticacion, requiereAdmin, cambiarVisibilidad);

rutas.get('/estadisticas', obtenerEstadisticas);

rutas.get('/notificaciones', requiereAutenticacion, listarNotificaciones);
rutas.patch('/notificaciones/leer-todas', requiereAutenticacion, marcarTodasLeidas);
rutas.patch('/notificaciones/:id/leida', requiereAutenticacion, marcarLeida);

rutas.get('/fotos/:id', servirFoto);

rutas.get('/tiempo-real', conectarCliente);
