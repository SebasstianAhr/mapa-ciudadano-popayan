import { createContext } from 'react'
import type { Usuario } from '../../types'

export interface ValorAuth {
  usuario: Usuario | null
  cargando: boolean
  esAdmin: boolean
  iniciarSesion: (correo: string, password: string) => Promise<void>
  registrar: (nombre: string, correo: string, password: string) => Promise<void>
  cerrarSesion: () => void
}

export const ContextoAuth = createContext<ValorAuth | null>(null)
