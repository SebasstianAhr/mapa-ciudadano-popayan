export function destinoSeguro(volver: string | null) {
  return volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : '/'
}
