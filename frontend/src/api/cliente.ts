const URL_BASE = String(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
const CLAVE_TOKEN = 'mapa_popayan_token'

export class ErrorApi extends Error {
  status: number
  detalles: unknown

  constructor(status: number, mensaje: string, detalles?: unknown) {
    super(mensaje)
    this.status = status
    this.detalles = detalles
  }
}

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(CLAVE_TOKEN, token)
    else localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    return
  }
}

export function urlRecurso(ruta: string) {
  return `${URL_BASE}${ruta}`
}

export function mensajeDeError(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado'
}

export async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const cabeceras = new Headers(opciones.headers)
  const token = leerToken()
  if (token) cabeceras.set('Authorization', `Bearer ${token}`)
  if (opciones.body && !(opciones.body instanceof FormData)) {
    cabeceras.set('Content-Type', 'application/json')
  }

  let respuesta: Response
  try {
    respuesta = await fetch(`${URL_BASE}/api${ruta}`, { ...opciones, headers: cabeceras })
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa tu conexión.')
  }

  if (respuesta.status === 204) return undefined as T

  const datos = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, datos?.mensaje ?? 'Ocurrió un error en el servidor', datos?.detalles)
  }
  return datos as T
}
