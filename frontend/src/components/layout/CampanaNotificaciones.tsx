import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { notificacionesApi } from '../../api/servicios'
import { useDatos } from '../../hooks/useDatos'
import { tiempoRelativo } from '../../utils/formato'
import type { Notificacion } from '../../types'

const INTERVALO_MS = 30000

export function CampanaNotificaciones({ usuarioId }: { usuarioId: string }) {
  const navegar = useNavigate()
  const [ciclo, setCiclo] = useState(0)
  const [abierta, setAbierta] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const { datos, recargar } = useDatos(notificacionesApi.listar, `${usuarioId}-${ciclo}`)

  useEffect(() => {
    const temporizador = window.setInterval(() => setCiclo((c) => c + 1), INTERVALO_MS)
    return () => window.clearInterval(temporizador)
  }, [])

  useEffect(() => {
    if (!abierta) return
    function alClicFuera(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierta(false)
    }
    document.addEventListener('mousedown', alClicFuera)
    return () => document.removeEventListener('mousedown', alClicFuera)
  }, [abierta])

  async function abrirNotificacion(notificacion: Notificacion) {
    setAbierta(false)
    if (!notificacion.leida) {
      await notificacionesApi.marcarLeida(notificacion.id).catch(() => undefined)
      recargar()
    }
    navegar(`/?reporte=${notificacion.reporteId}`)
  }

  async function marcarTodas() {
    await notificacionesApi.marcarTodas().catch(() => undefined)
    recargar()
  }

  const noLeidas = datos?.noLeidas ?? 0

  return (
    <div className="campana" ref={contenedor}>
      <button
        type="button"
        className="campana-boton"
        onClick={() => setAbierta(!abierta)}
        aria-label={`Notificaciones${noLeidas > 0 ? `, ${noLeidas} sin leer` : ''}`}
        aria-expanded={abierta}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z"
            fill="currentColor"
          />
        </svg>
        {noLeidas > 0 && <span className="campana-contador">{noLeidas > 9 ? '9+' : noLeidas}</span>}
      </button>

      {abierta && (
        <div className="campana-menu">
          <div className="campana-encabezado">
            <strong>Notificaciones</strong>
            {noLeidas > 0 && (
              <button type="button" className="boton-enlace" onClick={marcarTodas}>
                Marcar todas como leídas
              </button>
            )}
          </div>
          {datos && datos.notificaciones.length === 0 && <p className="campana-vacia">No tienes notificaciones.</p>}
          <ul>
            {datos?.notificaciones.map((notificacion) => (
              <li key={notificacion.id}>
                <button
                  type="button"
                  className={notificacion.leida ? '' : 'no-leida'}
                  onClick={() => abrirNotificacion(notificacion)}
                >
                  <span>{notificacion.mensaje}</span>
                  <small>{tiempoRelativo(notificacion.creadaEn)}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
