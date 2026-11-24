import type { Coordenadas } from '../types'

export const CENTRO_POPAYAN: Coordenadas = { lat: 2.4448, lng: -76.6147 }
export const ZOOM_INICIAL = 14

export const LIMITES_POPAYAN = {
  sur: 2.4,
  norte: 2.5,
  oeste: -76.66,
  este: -76.55,
}

export const LIMITES_MAPA: [[number, number], [number, number]] = [
  [LIMITES_POPAYAN.sur - 0.05, LIMITES_POPAYAN.oeste - 0.05],
  [LIMITES_POPAYAN.norte + 0.05, LIMITES_POPAYAN.este + 0.05],
]

export const RADIOS_CERCANIA = [300, 500, 1000, 2000]

export const COLOR_ANTIGUO = '#9ca3af'

export function estaEnPopayan({ lat, lng }: Coordenadas) {
  return (
    lat >= LIMITES_POPAYAN.sur &&
    lat <= LIMITES_POPAYAN.norte &&
    lng >= LIMITES_POPAYAN.oeste &&
    lng <= LIMITES_POPAYAN.este
  )
}
