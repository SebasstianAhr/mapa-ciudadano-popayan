export type EstadoReporte = 'activo' | 'antiguo'
export type Rol = 'ciudadano' | 'admin'
export type VistaMapa = 'pines' | 'calor'

export interface Coordenadas {
  lat: number
  lng: number
}

export interface Usuario {
  id: string
  nombre: string
  correo: string
  rol: Rol
}

export interface Sesion {
  token: string
  usuario: Usuario
}

export interface Categoria {
  _id: string
  clave: string
  nombre: string
  color: string
  activa: boolean
}

export interface CategoriaResumen {
  id: string
  nombre?: string
  color?: string
  clave?: string
}

export interface ReporteMapa {
  id: string
  categoria: string
  lat: number
  lng: number
  estado: EstadoReporte
  oculto: boolean
  totalReconfirmaciones: number
}

export interface Reporte {
  id: string
  categoria: CategoriaResumen
  descripcion: string
  ubicacion: Coordenadas
  fotoUrl: string
  estado: EstadoReporte
  oculto: boolean
  totalReconfirmaciones: number
  ultimaActividad: string
  creadoEn: string
  esPropio: boolean
  autor?: { id: string; nombre: string; correo: string }
}

export interface EstadoReconfirmacion {
  puede: boolean
  motivo?: 'sin-sesion' | 'propio' | 'reciente'
  disponibleDesde?: string
}

export interface ReporteDetalle extends Reporte {
  reconfirmacion: EstadoReconfirmacion
}

export interface Duplicado {
  id: string
  descripcion: string
  fotoUrl: string
  totalReconfirmaciones: number
  creadoEn: string
  distanciaMetros: number
  esPropio: boolean
}

export interface DetallesDuplicado {
  tipo: 'propio' | 'duplicado'
  duplicados: Duplicado[]
}

export interface Cercania extends Coordenadas {
  radio: number
}

export interface FiltrosMapa {
  categorias: string[]
  estado: '' | EstadoReporte
  cercania: Cercania | null
  incluirOcultos: boolean
}

export interface Notificacion {
  id: string
  tipo: 'reconfirmado' | 'antiguo' | 'ocultado'
  mensaje: string
  reporteId: string
  leida: boolean
  creadaEn: string
}

export interface ListaNotificaciones {
  noLeidas: number
  notificaciones: Notificacion[]
}

export interface Estadisticas {
  total: number
  porCategoria: { id: string; nombre: string; color: string; cantidad: number }[]
  porEstado: Record<EstadoReporte, number>
  topPersistentes: {
    id: string
    descripcion: string
    totalReconfirmaciones: number
    estado: EstadoReporte
    creadoEn: string
    categoria: { nombre: string; color: string }
  }[]
  porSemana: { semana: string; cantidad: number }[]
}
