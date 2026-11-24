import { pedir } from './cliente'
import type {
  Categoria,
  Estadisticas,
  FiltrosMapa,
  ListaNotificaciones,
  Reporte,
  ReporteDetalle,
  ReporteMapa,
  Sesion,
  Usuario,
} from '../types'

export const authApi = {
  registrar: (nombre: string, correo: string, password: string) =>
    pedir<Sesion>('/auth/registro', { method: 'POST', body: JSON.stringify({ nombre, correo, password }) }),
  iniciarSesion: (correo: string, password: string) =>
    pedir<Sesion>('/auth/login', { method: 'POST', body: JSON.stringify({ correo, password }) }),
  usuarioActual: () => pedir<Usuario>('/auth/yo'),
}

export const categoriasApi = {
  listar: () => pedir<Categoria[]>('/categorias'),
}

export const reportesApi = {
  listar: (filtros: FiltrosMapa) => {
    const parametros = new URLSearchParams()
    if (filtros.categorias.length > 0) parametros.set('categoria', filtros.categorias.join(','))
    if (filtros.estado) parametros.set('estado', filtros.estado)
    if (filtros.cercania) {
      parametros.set('lat', String(filtros.cercania.lat))
      parametros.set('lng', String(filtros.cercania.lng))
      parametros.set('radio', String(filtros.cercania.radio))
    }
    if (filtros.incluirOcultos) parametros.set('incluirOcultos', 'true')
    const consulta = parametros.toString()
    return pedir<ReporteMapa[]>(`/reportes${consulta ? `?${consulta}` : ''}`)
  },
  mios: () => pedir<Reporte[]>('/reportes/mios'),
  detalle: (id: string) => pedir<ReporteDetalle>(`/reportes/${id}`),
  crear: (formulario: FormData) => pedir<Reporte>('/reportes', { method: 'POST', body: formulario }),
  eliminar: (id: string) => pedir<void>(`/reportes/${id}`, { method: 'DELETE' }),
  reconfirmar: (id: string) => pedir<ReporteDetalle>(`/reportes/${id}/reconfirmar`, { method: 'POST' }),
  cambiarVisibilidad: (id: string, oculto: boolean) =>
    pedir<Reporte>(`/reportes/${id}/visibilidad`, { method: 'PATCH', body: JSON.stringify({ oculto }) }),
}

export const estadisticasApi = {
  obtener: () => pedir<Estadisticas>('/estadisticas'),
}

export const notificacionesApi = {
  listar: () => pedir<ListaNotificaciones>('/notificaciones'),
  marcarLeida: (id: string) => pedir<void>(`/notificaciones/${id}/leida`, { method: 'PATCH' }),
  marcarTodas: () => pedir<void>('/notificaciones/leer-todas', { method: 'PATCH' }),
}
