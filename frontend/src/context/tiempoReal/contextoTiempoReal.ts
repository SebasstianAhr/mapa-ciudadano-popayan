import { createContext } from 'react'

export type EventoTiempoReal = 'reportes' | 'notificacion'

export interface DatosEvento {
  tipo?: string
  id?: string
}

export type Oyente = (datos: DatosEvento) => void

export interface ValorTiempoReal {
  conectado: boolean
  suscribir: (evento: EventoTiempoReal, oyente: Oyente) => () => void
}

export const ContextoTiempoReal = createContext<ValorTiempoReal | null>(null)
