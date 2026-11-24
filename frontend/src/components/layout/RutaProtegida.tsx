import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/auth/useAuth'

export function RutaProtegida({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  if (cargando) return <p className="pagina-estado">Cargando…</p>
  if (!usuario) {
    const volver = encodeURIComponent(ubicacion.pathname + ubicacion.search)
    return <Navigate to={`/login?volver=${volver}`} replace />
  }
  return children
}
