import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { reportesApi } from '../api/servicios'
import { useDatos } from '../hooks/useDatos'
import { MapaReportes } from '../components/mapa/MapaReportes'
import { PanelFiltros } from '../components/mapa/PanelFiltros'
import { LeyendaMapa } from '../components/mapa/LeyendaMapa'
import { DetalleReporte } from '../components/reportes/DetalleReporte'
import type { FiltrosMapa, VistaMapa } from '../types'

const FILTROS_INICIALES: FiltrosMapa = { categorias: [], estado: '', cercania: null, incluirOcultos: false }

export function MapaPage() {
  const [parametros, setParametros] = useSearchParams()
  const [filtros, setFiltros] = useState<FiltrosMapa>(FILTROS_INICIALES)
  const [vista, setVista] = useState<VistaMapa>('pines')
  const seleccionadoId = parametros.get('reporte')

  const { datos: reportes, error, recargar } = useDatos(() => reportesApi.listar(filtros), JSON.stringify(filtros))

  const seleccionar = useCallback(
    (id: string | null) => {
      setParametros(id ? { reporte: id } : {}, { replace: true })
    },
    [setParametros]
  )

  return (
    <div className="pagina-mapa">
      <MapaReportes
        reportes={reportes ?? []}
        vista={vista}
        cercania={filtros.cercania}
        seleccionadoId={seleccionadoId}
        onSeleccionar={seleccionar}
      />

      <PanelFiltros filtros={filtros} vista={vista} onFiltros={setFiltros} onVista={setVista} />

      <LeyendaMapa vista={vista} total={reportes?.length ?? 0} />

      {error && <p className="aviso-flotante texto-error">{error}</p>}

      {reportes && reportes.length === 0 && !error && (
        <p className="aviso-flotante">No hay reportes con estos filtros.</p>
      )}

      <Link to="/reportar" className="boton-flotante">
        <span aria-hidden="true">+</span> Reportar problema
      </Link>

      {seleccionadoId && (
        <DetalleReporte
          key={seleccionadoId}
          id={seleccionadoId}
          onCerrar={() => seleccionar(null)}
          onCambio={recargar}
        />
      )}
    </div>
  )
}
