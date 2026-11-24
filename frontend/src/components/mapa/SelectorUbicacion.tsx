import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { LIMITES_MAPA } from '../../utils/constantes'
import type { Coordenadas } from '../../types'

interface Props {
  posicion: Coordenadas
  centrarEn: Coordenadas | null
  onCambiar: (posicion: Coordenadas) => void
}

const iconoPin = L.divIcon({
  className: 'pin-ubicacion',
  html: '<span></span>',
  iconSize: [28, 40],
  iconAnchor: [14, 40],
})

function EscucharClics({ onCambiar }: { onCambiar: (posicion: Coordenadas) => void }) {
  useMapEvents({ click: (evento) => onCambiar({ lat: evento.latlng.lat, lng: evento.latlng.lng }) })
  return null
}

function Centrar({ destino }: { destino: Coordenadas | null }) {
  const mapa = useMap()
  useEffect(() => {
    if (destino) mapa.flyTo([destino.lat, destino.lng], 17, { duration: 0.6 })
  }, [mapa, destino])
  return null
}

export function SelectorUbicacion({ posicion, centrarEn, onCambiar }: Props) {
  const eventos = useMemo(
    () => ({
      dragend: (evento: L.DragEndEvent) => {
        const punto = (evento.target as L.Marker).getLatLng()
        onCambiar({ lat: punto.lat, lng: punto.lng })
      },
    }),
    [onCambiar]
  )

  return (
    <MapContainer
      center={[posicion.lat, posicion.lng]}
      zoom={15}
      minZoom={12}
      maxBounds={LIMITES_MAPA}
      className="mapa-selector"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[posicion.lat, posicion.lng]} icon={iconoPin} draggable eventHandlers={eventos} />
      <EscucharClics onCambiar={onCambiar} />
      <Centrar destino={centrarEn} />
    </MapContainer>
  )
}
