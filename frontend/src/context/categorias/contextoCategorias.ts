import { createContext } from 'react'
import type { Categoria } from '../../types'

export interface ValorCategorias {
  categorias: Categoria[]
  porId: Map<string, Categoria>
  cargando: boolean
  error?: string
}

export const ContextoCategorias = createContext<ValorCategorias | null>(null)
