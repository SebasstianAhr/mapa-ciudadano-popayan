import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../context/auth/useAuth'
import { mensajeDeError } from '../api/cliente'
import { destinoSeguro } from '../utils/navegacion'

export function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const volver = destinoSeguro(parametros.get('volver'))

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await iniciarSesion(correo, password)
      navegar(volver, { replace: true })
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pagina pagina-acceso">
      <form className="tarjeta formulario-acceso" onSubmit={enviar}>
        <h1>Iniciar sesión</h1>
        <label>
          Correo
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="texto-error">{error}</p>}
        <button type="submit" className="boton boton-primario boton-ancho" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="nota">
          ¿No tienes cuenta? <Link to={`/registro?volver=${encodeURIComponent(volver)}`}>Regístrate en segundos</Link>
        </p>
        <p className="nota nota-demo">
          Cuentas de prueba: <strong>demo1@mapa.com</strong> a <strong>demo10@mapa.com</strong>, contraseña{' '}
          <strong>demo123</strong>
        </p>
      </form>
    </div>
  )
}
