import type { Coordenadas } from '../types'

export function obtenerUbicacionActual(): Promise<Coordenadas> {
  return new Promise((resolver, rechazar) => {
    if (!window.isSecureContext) {
      rechazar(new Error('El GPS solo funciona en sitios con HTTPS. Ubica el punto en el mapa.'))
      return
    }
    if (!('geolocation' in navigator)) {
      rechazar(new Error('Tu navegador no permite obtener la ubicación'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => resolver({ lat: posicion.coords.latitude, lng: posicion.coords.longitude }),
      (error) =>
        rechazar(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? 'No diste permiso para usar tu ubicación'
              : 'No se pudo obtener tu ubicación'
          )
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  })
}
