import { useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { ContextoTiempoReal, type DatosEvento, type EventoTiempoReal } from './contextoTiempoReal'

export function useTiempoReal() {
  const valor = useContext(ContextoTiempoReal)
  if (!valor) throw new Error('useTiempoReal debe usarse dentro de ProveedorTiempoReal')
  return valor
}

interface Opciones {
  filtro?: (datos: DatosEvento) => boolean
  esperaMs?: number
}

export function useEventoTiempoReal(evento: EventoTiempoReal, alRecibir: () => void, opciones: Opciones = {}) {
  const { suscribir } = useTiempoReal()
  const alRecibirRef = useRef(alRecibir)
  const filtroRef = useRef(opciones.filtro)
  const esperaMs = opciones.esperaMs ?? 400

  useLayoutEffect(() => {
    alRecibirRef.current = alRecibir
    filtroRef.current = opciones.filtro
  })

  useEffect(() => {
    let temporizador: number | undefined
    const cancelar = suscribir(evento, (datos) => {
      if (filtroRef.current && !filtroRef.current(datos)) return
      window.clearTimeout(temporizador)
      temporizador = window.setTimeout(() => alRecibirRef.current(), esperaMs)
    })
    return () => {
      cancelar()
      window.clearTimeout(temporizador)
    }
  }, [suscribir, evento, esperaMs])
}
