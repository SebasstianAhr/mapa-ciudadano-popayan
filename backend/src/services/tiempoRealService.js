import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Reporte } from '../models/Reporte.js';
import { Notificacion } from '../models/Notificacion.js';

const LATIDO_MS = 25000;
const REINTENTO_MS = 5000;
const clientes = new Set();

function enviar(cliente, evento, datos) {
  cliente.res.write(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`);
}

function difundir(evento, datos, filtro = () => true) {
  for (const cliente of clientes) {
    if (filtro(cliente)) enviar(cliente, evento, datos);
  }
}

function usuarioDelToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(String(token), env.jwtSecret).id;
  } catch {
    return null;
  }
}

export function conectarCliente(req, res) {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  const cliente = { res, usuarioId: usuarioDelToken(req.query.token) };
  clientes.add(cliente);
  res.write(`retry: ${REINTENTO_MS}\n\n`);
  enviar(cliente, 'conectado', { conSesion: Boolean(cliente.usuarioId) });

  const latido = setInterval(() => res.write(': latido\n\n'), LATIDO_MS);
  req.on('close', () => {
    clearInterval(latido);
    clientes.delete(cliente);
  });
}

function vigilar(nombre, crearFlujo, alCambiar) {
  const iniciar = () => {
    const flujo = crearFlujo();
    let reiniciando = false;
    flujo.on('change', (cambio) => {
      try {
        alCambiar(cambio);
      } catch (error) {
        console.error(`Error procesando cambio de ${nombre}:`, error.message);
      }
    });
    flujo.on('error', (error) => {
      if (reiniciando) return;
      reiniciando = true;
      console.error(`Change stream de ${nombre} se cayó: ${error.message}. Reintentando…`);
      flujo.close().catch(() => undefined);
      setTimeout(iniciar, REINTENTO_MS);
    });
  };
  iniciar();
}

export function iniciarTiempoReal() {
  vigilar(
    'reportes',
    () => Reporte.watch([{ $match: { operationType: { $in: ['insert', 'update', 'replace', 'delete'] } } }]),
    (cambio) => {
      difundir('reportes', { tipo: cambio.operationType, id: String(cambio.documentKey._id) });
    }
  );

  vigilar(
    'notificaciones',
    () => Notificacion.watch([{ $match: { operationType: 'insert' } }]),
    (cambio) => {
      const usuarioId = String(cambio.fullDocument.usuario);
      difundir('notificacion', { id: String(cambio.documentKey._id) }, (c) => c.usuarioId === usuarioId);
    }
  );

  console.log('Tiempo real activo con change streams de MongoDB');
}
