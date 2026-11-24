import { useCategorias } from '../../context/categorias/useCategorias'
import { COLOR_ANTIGUO } from '../../utils/constantes'
import type { VistaMapa } from '../../types'

export function LeyendaMapa({ vista, total }: { vista: VistaMapa; total: number }) {
  const { categorias } = useCategorias()

  return (
    <div className="leyenda">
      <p className="leyenda-total">
        {total} {total === 1 ? 'reporte' : 'reportes'}
      </p>
      {vista === 'pines' ? (
        <ul>
          {categorias.map((categoria) => (
            <li key={categoria._id}>
              <span className="punto" style={{ background: categoria.color }} />
              {categoria.nombre}
            </li>
          ))}
          <li>
            <span className="punto punto-antiguo" style={{ borderColor: COLOR_ANTIGUO }} />
            Antiguo
          </li>
        </ul>
      ) : (
        <div className="leyenda-calor">
          <span>Menos</span>
          <span className="barra-calor" />
          <span>Más</span>
        </div>
      )}
    </div>
  )
}
