import { useEffect } from 'react'
import { Circle, CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useCategorias } from '../../context/categorias/useCategorias'
import { CENTRO_POPAYAN, COLOR_ANTIGUO, LIMITES_MAPA, ZOOM_INICIAL } from '../../utils/constantes'
import type { Cercania, ReporteMapa, VistaMapa } from '../../types'
import { CapaCalor } from './CapaCalor'

interface Props {
  reportes: ReporteMapa[]
  vista: VistaMapa
  cercania: Cercania | null
  seleccionadoId: string | null
  onSeleccionar: (id: string) => void
}

function AjustarACercania({ cercania }: { cercania: Cercania | null }) {
  const mapa = useMap()
  useEffect(() => {
    if (!cercania) return
    const limites = L.latLng(cercania.lat, cercania.lng).toBounds(cercania.radio * 2)
    mapa.flyToBounds(limites, { padding: [24, 24], duration: 0.6 })
  }, [mapa, cercania])
  return null
}

function CentrarEnSeleccionado({ reporte }: { reporte: ReporteMapa | undefined }) {
  const mapa = useMap()
  useEffect(() => {
    if (!reporte) return
    if (!mapa.getBounds().pad(-0.2).contains([reporte.lat, reporte.lng])) {
      mapa.panTo([reporte.lat, reporte.lng])
    }
  }, [mapa, reporte])
  return null
}

export function MapaReportes({ reportes, vista, cercania, seleccionadoId, onSeleccionar }: Props) {
  const { porId } = useCategorias()
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)

  return (
    <MapContainer
      center={[CENTRO_POPAYAN.lat, CENTRO_POPAYAN.lng]}
      zoom={ZOOM_INICIAL}
      minZoom={12}
      maxBounds={LIMITES_MAPA}
      className="mapa"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vista === 'calor' && <CapaCalor reportes={reportes} />}

      {vista === 'pines' &&
        reportes.map((reporte) => {
          const color = porId.get(reporte.categoria)?.color ?? COLOR_ANTIGUO
          const esAntiguo = reporte.estado === 'antiguo'
          const esSeleccionado = reporte.id === seleccionadoId
          return (
            <CircleMarker
              key={reporte.id}
              center={[reporte.lat, reporte.lng]}
              radius={esSeleccionado ? 12 : 8}
              pathOptions={{
                color: esSeleccionado ? '#111827' : esAntiguo ? COLOR_ANTIGUO : '#ffffff',
                weight: esSeleccionado ? 3 : 2,
                fillColor: color,
                fillOpacity: esAntiguo ? 0.35 : 0.95,
                dashArray: reporte.oculto ? '4 3' : undefined,
              }}
              eventHandlers={{ click: () => onSeleccionar(reporte.id) }}
            />
          )
        })}

      {cercania && (
        <>
          <Circle
            center={[cercania.lat, cercania.lng]}
            radius={cercania.radio}
            pathOptions={{ color: '#2563eb', weight: 1.5, fillColor: '#2563eb', fillOpacity: 0.06 }}
          />
          <CircleMarker
            center={[cercania.lat, cercania.lng]}
            radius={7}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }}
          />
        </>
      )}

      <AjustarACercania cercania={cercania} />
      <CentrarEnSeleccionado reporte={seleccionado} />
    </MapContainer>
  )
}
