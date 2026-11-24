import { useContext } from 'react'
import { ContextoCategorias } from './contextoCategorias'

export function useCategorias() {
  const valor = useContext(ContextoCategorias)
  if (!valor) throw new Error('useCategorias debe usarse dentro de ProveedorCategorias')
  return valor
}
