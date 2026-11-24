import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../context/auth/useAuth'
import { CampanaNotificaciones } from './CampanaNotificaciones'

export function Encabezado() {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const navegar = useNavigate()

  function salir() {
    cerrarSesion()
    navegar('/')
  }

  return (
    <header className="encabezado">
      <Link to="/" className="marca">
        <span className="marca-logo" aria-hidden="true" />
        <span className="marca-texto">
          Mapa Ciudadano <strong>Popayán</strong>
        </span>
      </Link>

      <nav className="navegacion">
        <NavLink to="/" end>
          Mapa
        </NavLink>
        <NavLink to="/estadisticas">Estadísticas</NavLink>
        {usuario && <NavLink to="/mis-reportes">Mis reportes</NavLink>}
      </nav>

      <div className="acciones-usuario">
        {usuario ? (
          <>
            <CampanaNotificaciones usuarioId={usuario.id} />
            <span className="usuario-nombre" title={usuario.correo}>
              {usuario.nombre}
              {esAdmin && <span className="etiqueta-admin">Admin</span>}
            </span>
            <button type="button" className="boton-enlace" onClick={salir}>
              Salir
            </button>
          </>
        ) : (
          <Link to="/login" className="boton boton-claro boton-pequeno">
            Entrar
          </Link>
        )}
      </div>
    </header>
  )
}
