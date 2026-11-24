import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import type { ReporteMapa } from '../../types'

let cargaPlugin: Promise<unknown> | null = null

function cargarPluginCalor() {
  if (!cargaPlugin) {
    ;(window as unknown as { L: typeof L }).L = L
    cargaPlugin = import('leaflet.heat')
  }
  return cargaPlugin
}

export function CapaCalor({ reportes }: { reportes: ReporteMapa[] }) {
  const mapa = useMap()

  useEffect(() => {
    let capa: L.Layer | null = null
    let activo = true

    cargarPluginCalor().then(() => {
      if (!activo) return
      const puntos: L.HeatLatLngTuple[] = reportes.map((r) => [
        r.lat,
        r.lng,
        r.estado === 'activo' ? 0.6 + Math.min(r.totalReconfirmaciones, 8) * 0.05 : 0.3,
      ])
      capa = L.heatLayer(puntos, { radius: 30, blur: 22, maxZoom: 17, minOpacity: 0.35 }).addTo(mapa)
    })

    return () => {
      activo = false
      capa?.remove()
    }
  }, [mapa, reportes])

  return null
}
