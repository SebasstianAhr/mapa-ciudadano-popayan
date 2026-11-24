import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { conectarDB } from '../config/db.js';
import { Usuario } from '../models/Usuario.js';
import { Categoria } from '../models/Categoria.js';
import { Reporte } from '../models/Reporte.js';
import { Reconfirmacion } from '../models/Reconfirmacion.js';
import { Notificacion } from '../models/Notificacion.js';
import { Configuracion } from '../models/Configuracion.js';
import {
  CATEGORIAS,
  AREA_POPAYAN,
  CONFIGURACION_INICIAL,
  CANTIDAD_CUENTAS_DEMO,
  PASSWORD_DEMO,
} from './datos.js';

async function crearIndices() {
  for (const modelo of [Usuario, Categoria, Reporte, Reconfirmacion, Notificacion, Configuracion]) {
    await modelo.syncIndexes();
  }
  console.log('Índices creados');
}

async function sembrarConfiguracion() {
  await Configuracion.updateOne(
    { clave: 'general' },
    { $setOnInsert: CONFIGURACION_INICIAL, $set: { areaPopayan: AREA_POPAYAN } },
    { upsert: true }
  );
  console.log('Configuración lista');
}

async function sembrarCategorias() {
  for (const categoria of CATEGORIAS) {
    await Categoria.updateOne({ clave: categoria.clave }, { $setOnInsert: categoria }, { upsert: true });
  }
  console.log(`${CATEGORIAS.length} categorías listas`);
}

async function sembrarUsuario(nombre, correo, password, rol) {
  const passwordHash = await bcrypt.hash(password, 10);
  await Usuario.updateOne(
    { correo },
    { $set: { nombre, rol, passwordHash } },
    { upsert: true }
  );
}

async function sembrarUsuarios() {
  if (env.adminEmail && env.adminPassword) {
    await sembrarUsuario('Administrador', env.adminEmail.toLowerCase(), env.adminPassword, 'admin');
    console.log(`Administrador listo: ${env.adminEmail}`);
  } else {
    console.log('ADMIN_EMAIL o ADMIN_PASSWORD no están en el .env: no se creó el administrador');
  }

  for (let numero = 1; numero <= CANTIDAD_CUENTAS_DEMO; numero++) {
    await sembrarUsuario(`Demo ${numero}`, `demo${numero}@mapa.com`, PASSWORD_DEMO, 'ciudadano');
  }
  console.log(`${CANTIDAD_CUENTAS_DEMO} cuentas demo listas (contraseña: ${PASSWORD_DEMO})`);
}

try {
  await conectarDB();
  await crearIndices();
  await sembrarConfiguracion();
  await sembrarCategorias();
  await sembrarUsuarios();
  console.log('Seed terminado');
} catch (error) {
  console.error('Error en el seed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
