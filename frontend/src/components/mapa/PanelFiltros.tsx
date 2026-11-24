import { useState, type CSSProperties } from 'react'
import { useAuth } from '../../context/auth/useAuth'
import { useCategorias } from '../../context/categorias/useCategorias'
import { RADIOS_CERCANIA } from '../../utils/constantes'
import { formatearDistancia } from '../../utils/formato'
import { obtenerUbicacionActual } from '../../utils/ubicacion'
import { mensajeDeError } from '../../api/cliente'
import type { EstadoReporte, FiltrosMapa, VistaMapa } from '../../types'

interface Props {
  filtros: FiltrosMapa
  vista: VistaMapa
  onFiltros: (filtros: FiltrosMapa) => void
  onVista: (vista: VistaMapa) => void
}

export function PanelFiltros({ filtros, vista, onFiltros, onVista }: Props) {
  const { categorias } = useCategorias()
  const { esAdmin } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false)
  const [errorUbicacion, setErrorUbicacion] = useState('')

  const cantidadActivos =
    filtros.categorias.length + (filtros.estado ? 1 : 0) + (filtros.cercania ? 1 : 0) + (filtros.incluirOcultos ? 1 : 0)

  function alternarCategoria(id: string) {
    const categoriasNuevas = filtros.categorias.includes(id)
      ? filtros.categorias.filter((c) => c !== id)
      : [...filtros.categorias, id]
    onFiltros({ ...filtros, categorias: categoriasNuevas })
  }

  async function alternarCercania() {
    setErrorUbicacion('')
    if (filtros.cercania) {
      onFiltros({ ...filtros, cercania: null })
      return
    }
    setBuscandoUbicacion(true)
    try {
      const posicion = await obtenerUbicacionActual()
      onFiltros({ ...filtros, cercania: { ...posicion, radio: 500 } })
    } catch (error) {
      setErrorUbicacion(mensajeDeError(error))
    } finally {
      setBuscandoUbicacion(false)
    }
  }

  function limpiar() {
    setErrorUbicacion('')
    onFiltros({ categorias: [], estado: '', cercania: null, incluirOcultos: false })
  }

  return (
    <div className={`panel-filtros ${abierto ? 'abierto' : ''}`}>
      <div className="panel-filtros-barra">
        <button type="button" className="boton boton-claro" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
          Filtros{cantidadActivos > 0 && <span className="insignia">{cantidadActivos}</span>}
        </button>
        <div className="selector-vista" role="group" aria-label="Tipo de vista">
          <button type="button" className={vista === 'pines' ? 'activo' : ''} onClick={() => onVista('pines')}>
            Pines
          </button>
          <button type="button" className={vista === 'calor' ? 'activo' : ''} onClick={() => onVista('calor')}>
            Mapa de calor
          </button>
        </div>
      </div>

      {abierto && (
        <div className="panel-filtros-contenido">
          <section>
            <h3>Cerca de mí</h3>
            <div className="fila">
              <button
                type="button"
                className={`boton ${filtros.cercania ? 'boton-primario' : 'boton-claro'}`}
                onClick={alternarCercania}
                disabled={buscandoUbicacion}
              >
                {buscandoUbicacion ? 'Buscando…' : filtros.cercania ? 'Activado' : 'Usar mi ubicación'}
              </button>
              {filtros.cercania && (
                <select
                  value={filtros.cercania.radio}
                  onChange={(e) =>
                    filtros.cercania &&
                    onFiltros({ ...filtros, cercania: { ...filtros.cercania, radio: Number(e.target.value) } })
                  }
                  aria-label="Radio de búsqueda"
                >
                  {RADIOS_CERCANIA.map((radio) => (
                    <option key={radio} value={radio}>
                      {formatearDistancia(radio)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {errorUbicacion && <p className="texto-error">{errorUbicacion}</p>}
          </section>

          <section>
            <h3>Categoría</h3>
            <div className="chips">
              {categorias.map((categoria) => (
                <button
                  key={categoria._id}
                  type="button"
                  className={`chip ${filtros.categorias.includes(categoria._id) ? 'activo' : ''}`}
                  style={{ '--color-chip': categoria.color } as CSSProperties}
                  onClick={() => alternarCategoria(categoria._id)}
                >
                  <span className="punto" style={{ background: categoria.color }} />
                  {categoria.nombre}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>Estado</h3>
            <select
              value={filtros.estado}
              onChange={(e) => onFiltros({ ...filtros, estado: e.target.value as '' | EstadoReporte })}
            >
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="antiguo">Antiguos</option>
            </select>
          </section>

          {esAdmin && (
            <section>
              <label className="casilla">
                <input
                  type="checkbox"
                  checked={filtros.incluirOcultos}
                  onChange={(e) => onFiltros({ ...filtros, incluirOcultos: e.target.checked })}
                />
                Mostrar reportes ocultos
              </label>
            </section>
          )}

          {cantidadActivos > 0 && (
            <button type="button" className="boton-enlace" onClick={limpiar}>
              Quitar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
