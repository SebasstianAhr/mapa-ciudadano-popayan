import { Link } from 'react-router'
import { estadisticasApi } from '../api/servicios'
import { useDatos } from '../hooks/useDatos'
import { InsigniaCategoria, InsigniaEstado } from '../components/reportes/InsigniaCategoria'
import { formatearDia } from '../utils/formato'

export function EstadisticasPage() {
  const { datos, cargando, error } = useDatos(estadisticasApi.obtener, 'estadisticas')

  if (cargando && !datos) return <p className="pagina-estado">Calculando estadísticas…</p>
  if (error) return <p className="pagina-estado texto-error">{error}</p>
  if (!datos) return null

  const maximoCategoria = Math.max(1, ...datos.porCategoria.map((c) => c.cantidad))
  const maximoSemana = Math.max(1, ...datos.porSemana.map((s) => s.cantidad))
  const porcentajeActivos = datos.total > 0 ? Math.round((datos.porEstado.activo / datos.total) * 100) : 0

  return (
    <div className="pagina pagina-estadisticas">
      <h1>Estadísticas de Popayán</h1>

      <div className="indicadores">
        <div className="tarjeta indicador">
          <span>Reportes totales</span>
          <strong>{datos.total}</strong>
        </div>
        <div className="tarjeta indicador">
          <span>Activos</span>
          <strong>{datos.porEstado.activo}</strong>
        </div>
        <div className="tarjeta indicador">
          <span>Antiguos</span>
          <strong>{datos.porEstado.antiguo}</strong>
        </div>
      </div>

      {datos.total === 0 ? (
        <div className="tarjeta vacio">
          <p>Todavía no hay reportes para calcular estadísticas.</p>
        </div>
      ) : (
        <>
          <section className="tarjeta">
            <h2>Activos vs. antiguos</h2>
            <div className="barra-proporcion" role="img" aria-label={`${porcentajeActivos}% activos`}>
              <span className="parte-activa" style={{ width: `${porcentajeActivos}%` }} />
            </div>
            <p className="nota">
              {porcentajeActivos}% de los reportes han sido confirmados en los últimos 30 días.
            </p>
          </section>

          <section className="tarjeta">
            <h2>Reportes por categoría</h2>
            <ul className="barras-horizontales">
              {datos.porCategoria.map((categoria) => (
                <li key={categoria.id}>
                  <span className="barra-etiqueta">{categoria.nombre}</span>
                  <span className="barra-pista">
                    <span
                      className="barra-relleno"
                      style={{ width: `${(categoria.cantidad / maximoCategoria) * 100}%`, background: categoria.color }}
                    />
                  </span>
                  <span className="barra-valor">{categoria.cantidad}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="tarjeta">
            <h2>Problemas más persistentes</h2>
            {datos.topPersistentes.length === 0 ? (
              <p className="nota">Aún nadie ha confirmado reportes de otros ciudadanos.</p>
            ) : (
              <ol className="lista-persistentes">
                {datos.topPersistentes.map((reporte) => (
                  <li key={reporte.id}>
                    <Link to={`/?reporte=${reporte.id}`}>
                      <div className="fila fila-espaciada">
                        <InsigniaCategoria categoria={reporte.categoria} />
                        <InsigniaEstado estado={reporte.estado} />
                      </div>
                      <p>{reporte.descripcion}</p>
                      <small>{reporte.totalReconfirmaciones} confirmaciones</small>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="tarjeta">
            <h2>Reportes por semana</h2>
            <div className="barras-verticales">
              {datos.porSemana.map((semana) => (
                <div key={semana.semana} className="barra-columna">
                  <span className="barra-valor">{semana.cantidad}</span>
                  <span className="barra-vertical" style={{ height: `${(semana.cantidad / maximoSemana) * 100}%` }} />
                  <span className="barra-etiqueta">{formatearDia(semana.semana)}</span>
                </div>
              ))}
            </div>
            <p className="nota">Cada barra es una semana, desde el lunes indicado.</p>
          </section>
        </>
      )}
    </div>
  )
}
