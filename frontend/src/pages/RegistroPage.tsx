import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../context/auth/useAuth'
import { mensajeDeError } from '../api/cliente'
import { destinoSeguro } from '../utils/navegacion'

export function RegistroPage() {
  const { registrar } = useAuth()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const volver = destinoSeguro(parametros.get('volver'))

  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setEnviando(true)
    setError('')
    try {
      await registrar(nombre, correo, password)
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
        <h1>Crear cuenta</h1>
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" minLength={2} required />
        </label>
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
            autoComplete="new-password"
            minLength={6}
            required
          />
          <small>Mínimo 6 caracteres</small>
        </label>
        {error && <p className="texto-error">{error}</p>}
        <button type="submit" className="boton boton-primario boton-ancho" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
        <p className="nota">
          ¿Ya tienes cuenta? <Link to={`/login?volver=${encodeURIComponent(volver)}`}>Inicia sesión</Link>
        </p>
      </form>
    </div>
  )
}
