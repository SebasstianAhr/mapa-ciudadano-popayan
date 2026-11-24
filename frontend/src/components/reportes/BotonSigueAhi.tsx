import { Link, useLocation } from 'react-router'
import { formatearFecha } from '../../utils/formato'
import type { EstadoReconfirmacion } from '../../types'

interface Props {
  estado: EstadoReconfirmacion
  enviando: boolean
  onReconfirmar: () => void
}

export function BotonSigueAhi({ estado, enviando, onReconfirmar }: Props) {
  const ubicacion = useLocation()

  if (estado.puede) {
    return (
      <button type="button" className="boton boton-primario boton-ancho" onClick={onReconfirmar} disabled={enviando}>
        {enviando ? 'Enviando…' : 'Sigue ahí'}
      </button>
    )
  }

  if (estado.motivo === 'sin-sesion') {
    const volver = encodeURIComponent(ubicacion.pathname + ubicacion.search)
    return (
      <Link to={`/login?volver=${volver}`} className="boton boton-claro boton-ancho">
        Inicia sesión para confirmar que sigue ahí
      </Link>
    )
  }

  if (estado.motivo === 'propio') {
    return <p className="nota">Este es tu reporte. Otros ciudadanos pueden confirmar que sigue ahí.</p>
  }

  return (
    <button type="button" className="boton boton-claro boton-ancho" disabled>
      Ya lo confirmaste.
      {estado.disponibleDesde && ` Podrás hacerlo de nuevo el ${formatearFecha(estado.disponibleDesde)}`}
    </button>
  )
}
