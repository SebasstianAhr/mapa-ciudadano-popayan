import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { reportesApi } from '../api/servicios'
import { ErrorApi, mensajeDeError, urlRecurso } from '../api/cliente'
import { useCategorias } from '../context/categorias/useCategorias'
import { SelectorUbicacion } from '../components/mapa/SelectorUbicacion'
import { CENTRO_POPAYAN, estaEnPopayan } from '../utils/constantes'
import { obtenerUbicacionActual } from '../utils/ubicacion'
import { comprimirImagen, validarImagen } from '../utils/imagen'
import { formatearDistancia, tiempoRelativo } from '../utils/formato'
import type { Coordenadas, DetallesDuplicado } from '../types'

export function NuevoReportePage() {
  const navegar = useNavigate()
  const { categorias } = useCategorias()

  const [posicion, setPosicion] = useState<Coordenadas>(CENTRO_POPAYAN)
  const [centrarEn, setCentrarEn] = useState<Coordenadas | null>(null)
  const [estadoGps, setEstadoGps] = useState<'buscando' | 'listo' | 'error'>('buscando')
  const [mensajeGps, setMensajeGps] = useState('')

  const [foto, setFoto] = useState<File | null>(null)
  const [vistaPrevia, setVistaPrevia] = useState('')
  const [procesandoFoto, setProcesandoFoto] = useState(false)
  const [errorFoto, setErrorFoto] = useState('')

  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [duplicados, setDuplicados] = useState<DetallesDuplicado | null>(null)
  const [reconfirmandoId, setReconfirmandoId] = useState('')

  const usarGps = useCallback(() => {
    obtenerUbicacionActual()
      .then((punto) => {
        if (!estaEnPopayan(punto)) {
          setEstadoGps('error')
          setMensajeGps('Tu ubicación está fuera de Popayán. Mueve el pin al lugar del problema.')
          return
        }
        setPosicion(punto)
        setCentrarEn(punto)
        setEstadoGps('listo')
        setMensajeGps('Ubicamos el pin con tu GPS. Arrástralo si el problema está en otro punto.')
      })
      .catch((e: unknown) => {
        setEstadoGps('error')
        setMensajeGps(`${mensajeDeError(e)}. Toca el mapa o arrastra el pin al lugar del problema.`)
      })
  }, [])

  useEffect(() => {
    usarGps()
  }, [usarGps])

  useEffect(() => {
    if (!vistaPrevia) return
    return () => URL.revokeObjectURL(vistaPrevia)
  }, [vistaPrevia])

  const cambiarPosicion = useCallback((punto: Coordenadas) => {
    setPosicion(punto)
    setDuplicados(null)
  }, [])

  async function elegirFoto(archivo: File | undefined) {
    setErrorFoto('')
    if (!archivo) return
    const problema = validarImagen(archivo)
    if (problema) {
      setErrorFoto(problema)
      return
    }
    setProcesandoFoto(true)
    try {
      const comprimida = await comprimirImagen(archivo)
      setFoto(comprimida)
      setVistaPrevia(URL.createObjectURL(comprimida))
    } catch (e) {
      setErrorFoto(mensajeDeError(e))
    } finally {
      setProcesandoFoto(false)
    }
  }

  const faltantes = [
    !foto && 'una foto',
    !categoria && 'la categoría',
    descripcion.trim().length < 5 && 'una descripción (mínimo 5 caracteres)',
    !estaEnPopayan(posicion) && 'una ubicación dentro de Popayán',
  ].filter(Boolean) as string[]

  async function enviar(confirmarNuevo: boolean) {
    if (!foto || faltantes.length > 0) return
    setEnviando(true)
    setError('')
    const formulario = new FormData()
    formulario.append('foto', foto)
    formulario.append('categoria', categoria)
    formulario.append('descripcion', descripcion.trim())
    formulario.append('lat', String(posicion.lat))
    formulario.append('lng', String(posicion.lng))
    if (confirmarNuevo) formulario.append('confirmarNuevo', 'true')

    try {
      const creado = await reportesApi.crear(formulario)
      navegar(`/?reporte=${creado.id}`)
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 409 && e.detalles) {
        setDuplicados(e.detalles as DetallesDuplicado)
      } else {
        setError(mensajeDeError(e))
      }
    } finally {
      setEnviando(false)
    }
  }

  function alEnviar(evento: FormEvent) {
    evento.preventDefault()
    enviar(false)
  }

  async function reconfirmarExistente(id: string) {
    setReconfirmandoId(id)
    setError('')
    try {
      await reportesApi.reconfirmar(id)
      navegar(`/?reporte=${id}`)
    } catch (e) {
      setError(mensajeDeError(e))
    } finally {
      setReconfirmandoId('')
    }
  }

  return (
    <div className="pagina pagina-formulario">
      <h1>Reportar un problema</h1>

      <form onSubmit={alEnviar} className="formulario-reporte">
        <section className="tarjeta">
          <h2>1. Ubicación</h2>
          <SelectorUbicacion posicion={posicion} centrarEn={centrarEn} onCambiar={cambiarPosicion} />
          <p className={`nota ${estadoGps === 'error' ? 'nota-alerta' : ''}`}>
            {estadoGps === 'buscando' ? 'Buscando tu ubicación…' : mensajeGps}
          </p>
          {estadoGps === 'error' && (
            <button type="button" className="boton-enlace" onClick={usarGps}>
              Intentar de nuevo con el GPS
            </button>
          )}
        </section>

        <section className="tarjeta">
          <h2>2. Foto</h2>
          <label className="selector-foto">
            {vistaPrevia ? (
              <img src={vistaPrevia} alt="Vista previa de la foto" />
            ) : (
              <span>{procesandoFoto ? 'Procesando foto…' : 'Toca para tomar o elegir una foto'}</span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => elegirFoto(e.target.files?.[0])}
            />
          </label>
          {vistaPrevia && <p className="nota">Toca la foto para cambiarla.</p>}
          {errorFoto && <p className="texto-error">{errorFoto}</p>}
        </section>

        <section className="tarjeta">
          <h2>3. Categoría</h2>
          <div className="opciones-categoria">
            {categorias.map((c) => (
              <label key={c._id} className={`opcion-categoria ${categoria === c._id ? 'activa' : ''}`}>
                <input
                  type="radio"
                  name="categoria"
                  value={c._id}
                  checked={categoria === c._id}
                  onChange={() => {
                    setCategoria(c._id)
                    setDuplicados(null)
                  }}
                />
                <span className="punto" style={{ background: c.color }} />
                {c.nombre}
              </label>
            ))}
          </div>
        </section>

        <section className="tarjeta">
          <h2>4. Descripción</h2>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Ej: Hueco grande frente al número 12, ocupa medio carril."
          />
          <p className="nota contador">{descripcion.length}/500</p>
        </section>

        {duplicados && (
          <section className="tarjeta tarjeta-alerta" aria-live="polite">
            {duplicados.tipo === 'propio' ? (
              <>
                <h2>Ya reportaste este problema</h2>
                <p>Tienes un reporte activo de la misma categoría muy cerca de este punto.</p>
                <Link to={`/?reporte=${duplicados.duplicados[0]?.id}`} className="boton boton-primario">
                  Ver mi reporte
                </Link>
              </>
            ) : (
              <>
                <h2>¿Es alguno de estos problemas?</h2>
                <p>Ya hay reportes de la misma categoría muy cerca. Si es el mismo, confírmalo en lugar de duplicarlo.</p>
                <ul className="lista-duplicados">
                  {duplicados.duplicados.map((d) => (
                    <li key={d.id}>
                      <img src={urlRecurso(d.fotoUrl)} alt="" />
                      <div>
                        <p>{d.descripcion}</p>
                        <small>
                          A {formatearDistancia(d.distanciaMetros)} · {tiempoRelativo(d.creadoEn)} ·{' '}
                          {d.totalReconfirmaciones} confirmaciones
                        </small>
                      </div>
                      <button
                        type="button"
                        className="boton boton-primario"
                        onClick={() => reconfirmarExistente(d.id)}
                        disabled={reconfirmandoId !== ''}
                      >
                        {reconfirmandoId === d.id ? 'Enviando…' : 'Sigue ahí'}
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" className="boton boton-claro" onClick={() => enviar(true)} disabled={enviando}>
                  No, es otro problema
                </button>
              </>
            )}
          </section>
        )}

        {error && <p className="texto-error">{error}</p>}

        {!duplicados && (
          <div className="acciones-formulario">
            <button type="submit" className="boton boton-primario boton-ancho" disabled={faltantes.length > 0 || enviando}>
              {enviando ? 'Enviando reporte…' : 'Enviar reporte'}
            </button>
            {faltantes.length > 0 && <p className="nota">Falta: {faltantes.join(', ')}.</p>}
          </div>
        )}
      </form>
    </div>
  )
}
