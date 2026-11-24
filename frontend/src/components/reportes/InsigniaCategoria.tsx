import type { CSSProperties } from 'react'
import type { CategoriaResumen, EstadoReporte } from '../../types'

export function InsigniaCategoria({ categoria }: { categoria: Pick<CategoriaResumen, 'nombre' | 'color'> }) {
  return (
    <span className="insignia-categoria" style={{ '--color-chip': categoria.color } as CSSProperties}>
      <span className="punto" style={{ background: categoria.color }} />
      {categoria.nombre}
    </span>
  )
}

export function InsigniaEstado({ estado, oculto }: { estado: EstadoReporte; oculto?: boolean }) {
  if (oculto) return <span className="insignia-estado oculto">Oculto</span>
  return <span className={`insignia-estado ${estado}`}>{estado === 'activo' ? 'Activo' : 'Antiguo'}</span>
}
