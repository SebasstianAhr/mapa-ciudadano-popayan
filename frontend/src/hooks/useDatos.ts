import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { mensajeDeError } from '../api/cliente'

interface EstadoDatos<T> {
  clave: string
  version: number
  datos?: T
  error?: string
}

export function useDatos<T>(cargar: () => Promise<T>, clave: string) {
  const cargarRef = useRef(cargar)
  const [version, setVersion] = useState(0)
  const [estado, setEstado] = useState<EstadoDatos<T>>({ clave: '', version: -1 })

  useLayoutEffect(() => {
    cargarRef.current = cargar
  })

  useEffect(() => {
    let activo = true
    cargarRef
      .current()
      .then((datos) => {
        if (activo) setEstado({ clave, version, datos })
      })
      .catch((error: unknown) => {
        if (activo) setEstado({ clave, version, error: mensajeDeError(error) })
      })
    return () => {
      activo = false
    }
  }, [clave, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const reemplazar = useCallback(
    (datos: T) => setEstado((anterior) => ({ ...anterior, datos, error: undefined })),
    []
  )

  const mismaClave = estado.clave === clave
  return {
    datos: mismaClave ? estado.datos : undefined,
    error: mismaClave ? estado.error : undefined,
    cargando: !(mismaClave && estado.version === version),
    recargar,
    reemplazar,
  }
}
