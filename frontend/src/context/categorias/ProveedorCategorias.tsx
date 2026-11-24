import { useMemo, type ReactNode } from 'react'
import { categoriasApi } from '../../api/servicios'
import { useDatos } from '../../hooks/useDatos'
import { ContextoCategorias } from './contextoCategorias'

export function ProveedorCategorias({ children }: { children: ReactNode }) {
  const { datos, cargando, error } = useDatos(categoriasApi.listar, 'categorias')

  const valor = useMemo(() => {
    const categorias = datos ?? []
    return {
      categorias,
      porId: new Map(categorias.map((c) => [c._id, c])),
      cargando,
      error,
    }
  }, [datos, cargando, error])

  return <ContextoCategorias.Provider value={valor}>{children}</ContextoCategorias.Provider>
}
