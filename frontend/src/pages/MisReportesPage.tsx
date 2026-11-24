import { useState } from 'react'
import { Link } from 'react-router'
import { reportesApi } from '../api/servicios'
import { mensajeDeError, urlRecurso } from '../api/cliente'
import { useAuth } from '../context/auth/useAuth'
import { useDatos } from '../hooks/useDatos'
import { InsigniaCategoria, InsigniaEstado } from '../components/reportes/InsigniaCategoria'
import { tiempoRelativo } from '../utils/formato'

export function MisReportesPage() {
  const { usuario } = useAuth()
  const { datos: reportes, cargando, error, recargar } = useDatos(reportesApi.mios, usuario?.id ?? '')
  const [eliminandoId, setEliminandoId] = useState('')
  const [errorAccion, setErrorAccion] = useState('')

  async function eliminar(id: string) {
    if (!window.confirm('¿Eliminar este reporte? No se puede deshacer.')) return
    setEliminandoId(id)
    setErrorAccion('')
    try {
      await reportesApi.eliminar(id)
      recargar()
    } catch (e) {
      setErrorAccion(mensajeDeError(e))
    } finally {
      setEliminandoId('')
    }
  }

  return (
    <div className="pagina">
      <div className="fila fila-espaciada">
        <h1>Mis reportes</h1>
        <Link to="/reportar" className="boton boton-primario">
          Nuevo reporte
        </Link>
      </div>

      {cargando && !reportes && <p className="pagina-estado">Cargando…</p>}
      {error && <p className="texto-error">{error}</p>}
      {errorAccion && <p className="texto-error">{errorAccion}</p>}

      {reportes && reportes.length === 0 && (
        <div className="tarjeta vacio">
          <p>Aún no has creado reportes.</p>
          <Link to="/reportar" className="boton boton-primario">
            Reportar mi primer problema
          </Link>
        </div>
      )}

      <ul className="lista-reportes">
        {reportes?.map((reporte) => (
          <li key={reporte.id} className="tarjeta tarjeta-reporte">
            <img src={urlRecurso(reporte.fotoUrl)} alt="" loading="lazy" />
            <div className="tarjeta-reporte-cuerpo">
              <div className="fila fila-espaciada">
                <InsigniaCategoria categoria={reporte.categoria} />
                <InsigniaEstado estado={reporte.estado} oculto={reporte.oculto} />
              </div>
              <p>{reporte.descripcion}</p>
              <small>
                {tiempoRelativo(reporte.creadoEn)} · {reporte.totalReconfirmaciones} confirmaciones
              </small>
              <div className="fila">
                {!reporte.oculto && (
                  <Link to={`/?reporte=${reporte.id}`} className="boton boton-claro boton-pequeno">
                    Ver en el mapa
                  </Link>
                )}
                <button
                  type="button"
                  className="boton boton-peligro boton-pequeno"
                  onClick={() => eliminar(reporte.id)}
                  disabled={eliminandoId !== ''}
                >
                  {eliminandoId === reporte.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
