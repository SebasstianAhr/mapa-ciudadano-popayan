import { useState } from 'react'
import { reportesApi } from '../../api/servicios'
import { mensajeDeError, urlRecurso } from '../../api/cliente'
import { useAuth } from '../../context/auth/useAuth'
import { useDatos } from '../../hooks/useDatos'
import { formatearFecha, tiempoRelativo } from '../../utils/formato'
import { BotonSigueAhi } from './BotonSigueAhi'
import { InsigniaCategoria, InsigniaEstado } from './InsigniaCategoria'

interface Props {
  id: string
  onCerrar: () => void
  onCambio: () => void
}

export function DetalleReporte({ id, onCerrar, onCambio }: Props) {
  const { usuario, esAdmin } = useAuth()
  const { datos: reporte, error, cargando, reemplazar } = useDatos(
    () => reportesApi.detalle(id),
    `${id}-${usuario?.id ?? 'anonimo'}`
  )
  const [accion, setAccion] = useState<'' | 'reconfirmar' | 'visibilidad' | 'eliminar'>('')
  const [errorAccion, setErrorAccion] = useState('')

  async function ejecutar(tipo: typeof accion, tarea: () => Promise<void>) {
    setAccion(tipo)
    setErrorAccion('')
    try {
      await tarea()
    } catch (e) {
      setErrorAccion(mensajeDeError(e))
    } finally {
      setAccion('')
    }
  }

  function reconfirmar() {
    ejecutar('reconfirmar', async () => {
      reemplazar(await reportesApi.reconfirmar(id))
      onCambio()
    })
  }

  function cambiarVisibilidad() {
    if (!reporte) return
    ejecutar('visibilidad', async () => {
      const actualizado = await reportesApi.cambiarVisibilidad(id, !reporte.oculto)
      reemplazar({ ...reporte, ...actualizado })
      onCambio()
    })
  }

  function eliminar() {
    const mensaje = esAdmin && !reporte?.esPropio
      ? '¿Eliminar este reporte de forma permanente? No se puede deshacer.'
      : '¿Eliminar tu reporte? No se puede deshacer.'
    if (!window.confirm(mensaje)) return
    ejecutar('eliminar', async () => {
      await reportesApi.eliminar(id)
      onCambio()
      onCerrar()
    })
  }

  return (
    <aside className="detalle" aria-label="Detalle del reporte">
      <button type="button" className="detalle-cerrar" onClick={onCerrar} aria-label="Cerrar">
        ×
      </button>

      {cargando && !reporte && <p className="detalle-estado">Cargando reporte…</p>}
      {error && !reporte && <p className="detalle-estado texto-error">{error}</p>}

      {reporte && (
        <>
          <img className="detalle-foto" src={urlRecurso(reporte.fotoUrl)} alt={`Foto del reporte: ${reporte.descripcion}`} />
          <div className="detalle-cuerpo">
            <div className="fila fila-espaciada">
              <InsigniaCategoria categoria={reporte.categoria} />
              <InsigniaEstado estado={reporte.estado} oculto={reporte.oculto} />
            </div>

            <p className="detalle-descripcion">{reporte.descripcion}</p>

            <dl className="detalle-datos">
              <div>
                <dt>Reportado</dt>
                <dd title={formatearFecha(reporte.creadoEn)}>{tiempoRelativo(reporte.creadoEn)}</dd>
              </div>
              <div>
                <dt>Confirmaciones</dt>
                <dd>{reporte.totalReconfirmaciones}</dd>
              </div>
              <div>
                <dt>Última actividad</dt>
                <dd title={formatearFecha(reporte.ultimaActividad)}>{tiempoRelativo(reporte.ultimaActividad)}</dd>
              </div>
            </dl>

            {reporte.estado === 'antiguo' && (
              <p className="nota">
                Nadie ha confirmado este problema recientemente. Si sigue ahí, confírmalo para que vuelva a estar activo.
              </p>
            )}

            {!reporte.oculto && (
              <BotonSigueAhi
                estado={reporte.reconfirmacion}
                enviando={accion === 'reconfirmar'}
                onReconfirmar={reconfirmar}
              />
            )}

            {esAdmin && reporte.autor && (
              <div className="detalle-admin">
                <h3>Moderación</h3>
                <p>
                  Autor: <strong>{reporte.autor.nombre}</strong> ({reporte.autor.correo})
                </p>
              </div>
            )}

            {(esAdmin || reporte.esPropio) && (
              <div className="fila">
                {esAdmin && (
                  <button
                    type="button"
                    className="boton boton-claro"
                    onClick={cambiarVisibilidad}
                    disabled={accion !== ''}
                  >
                    {reporte.oculto ? 'Mostrar de nuevo' : 'Ocultar'}
                  </button>
                )}
                <button type="button" className="boton boton-peligro" onClick={eliminar} disabled={accion !== ''}>
                  {accion === 'eliminar' ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            )}

            {errorAccion && <p className="texto-error">{errorAccion}</p>}
          </div>
        </>
      )}
    </aside>
  )
}
