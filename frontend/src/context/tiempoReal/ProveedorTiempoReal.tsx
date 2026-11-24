import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { leerToken, urlRecurso } from '../../api/cliente'
import { useAuth } from '../auth/useAuth'
import { ContextoTiempoReal, type DatosEvento, type EventoTiempoReal, type Oyente } from './contextoTiempoReal'

const EVENTOS: EventoTiempoReal[] = ['reportes', 'notificacion']

export function ProveedorTiempoReal({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const oyentes = useRef(new Map<EventoTiempoReal, Set<Oyente>>())
  const [conectado, setConectado] = useState(false)

  const emitir = useCallback((evento: EventoTiempoReal, datos: DatosEvento) => {
    oyentes.current.get(evento)?.forEach((oyente) => oyente(datos))
  }, [])

  useEffect(() => {
    if (typeof EventSource === 'undefined') return
    const token = leerToken()
    const consulta = usuario && token ? `?token=${encodeURIComponent(token)}` : ''
    const fuente = new EventSource(urlRecurso(`/api/tiempo-real${consulta}`))
    let primeraConexion = true

    fuente.addEventListener('conectado', () => {
      setConectado(true)
      if (!primeraConexion) EVENTOS.forEach((evento) => emitir(evento, {}))
      primeraConexion = false
    })

    EVENTOS.forEach((evento) =>
      fuente.addEventListener(evento, (mensaje) => {
        let datos: DatosEvento = {}
        try {
          datos = JSON.parse((mensaje as MessageEvent<string>).data)
        } catch {
          datos = {}
        }
        emitir(evento, datos)
      })
    )

    fuente.onerror = () => setConectado(false)

    return () => {
      fuente.close()
      setConectado(false)
    }
  }, [usuario, emitir])

  const suscribir = useCallback((evento: EventoTiempoReal, oyente: Oyente) => {
    const mapa = oyentes.current
    const conjunto = mapa.get(evento) ?? new Set<Oyente>()
    conjunto.add(oyente)
    mapa.set(evento, conjunto)
    return () => {
      conjunto.delete(oyente)
    }
  }, [])

  const valor = useMemo(() => ({ conectado, suscribir }), [conectado, suscribir])

  return <ContextoTiempoReal.Provider value={valor}>{children}</ContextoTiempoReal.Provider>
}
