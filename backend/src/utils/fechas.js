const OFFSET_BOGOTA_MS = 5 * 60 * 60 * 1000;

export function inicioDelDiaBogota(fecha = new Date()) {
  const local = new Date(fecha.getTime() - OFFSET_BOGOTA_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() + OFFSET_BOGOTA_MS);
}

export function restarMinutos(minutos, desde = new Date()) {
  return new Date(desde.getTime() - minutos * 60 * 1000);
}

export function sumarDias(dias, desde = new Date()) {
  return new Date(desde.getTime() + dias * 24 * 60 * 60 * 1000);
}
