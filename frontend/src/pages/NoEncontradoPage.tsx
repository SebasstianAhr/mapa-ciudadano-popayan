import { Link } from 'react-router'

export function NoEncontradoPage() {
  return (
    <div className="pagina pagina-estado">
      <h1>Página no encontrada</h1>
      <Link to="/" className="boton boton-primario">
        Volver al mapa
      </Link>
    </div>
  )
}
