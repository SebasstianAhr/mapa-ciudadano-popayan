import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '../../api/servicios'
import { guardarToken, leerToken } from '../../api/cliente'
import type { Sesion, Usuario } from '../../types'
import { ContextoAuth } from './contextoAuth'

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(() => Boolean(leerToken()))

  useEffect(() => {
    if (!leerToken()) return
    authApi
      .usuarioActual()
      .then(setUsuario)
      .catch(() => guardarToken(null))
      .finally(() => setCargando(false))
  }, [])

  const abrirSesion = useCallback((sesion: Sesion) => {
    guardarToken(sesion.token)
    setUsuario(sesion.usuario)
  }, [])

  const iniciarSesion = useCallback(
    async (correo: string, password: string) => abrirSesion(await authApi.iniciarSesion(correo, password)),
    [abrirSesion]
  )

  const registrar = useCallback(
    async (nombre: string, correo: string, password: string) =>
      abrirSesion(await authApi.registrar(nombre, correo, password)),
    [abrirSesion]
  )

  const cerrarSesion = useCallback(() => {
    guardarToken(null)
    setUsuario(null)
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      esAdmin: usuario?.rol === 'admin',
      iniciarSesion,
      registrar,
      cerrarSesion,
    }),
    [usuario, cargando, iniciarSesion, registrar, cerrarSesion]
  )

  return <ContextoAuth.Provider value={valor}>{children}</ContextoAuth.Provider>
}
