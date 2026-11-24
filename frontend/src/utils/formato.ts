const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
const formatoDia = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })
const formatoRelativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
]

export function formatearFecha(iso: string) {
  return formatoFecha.format(new Date(iso))
}

export function formatearDia(iso: string) {
  return formatoDia.format(new Date(iso))
}

export function tiempoRelativo(iso: string) {
  const segundos = (new Date(iso).getTime() - Date.now()) / 1000
  for (const [unidad, tamano] of UNIDADES) {
    if (Math.abs(segundos) >= tamano) return formatoRelativo.format(Math.round(segundos / tamano), unidad)
  }
  return 'hace un momento'
}

export function formatearDistancia(metros: number) {
  return metros >= 1000 ? `${(metros / 1000).toFixed(1)} km` : `${metros} m`
}
