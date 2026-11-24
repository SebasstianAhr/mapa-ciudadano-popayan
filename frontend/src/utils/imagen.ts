const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANO_MAXIMO = 5 * 1024 * 1024
const LADO_MAXIMO = 1280

export function validarImagen(archivo: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) return 'La foto debe ser JPG, PNG o WEBP'
  if (archivo.size > TAMANO_MAXIMO) return 'La foto no puede pesar más de 5 MB'
  return null
}

function canvasABlob(canvas: HTMLCanvasElement, tipo: string, calidad: number) {
  return new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, tipo, calidad))
}

export async function comprimirImagen(archivo: File): Promise<File> {
  const imagen = await createImageBitmap(archivo, { imageOrientation: 'from-image' })
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(imagen.width * escala)
  canvas.height = Math.round(imagen.height * escala)

  const contexto = canvas.getContext('2d')
  if (!contexto) throw new Error('No se pudo procesar la foto')
  contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height)
  imagen.close()

  const webp = await canvasABlob(canvas, 'image/webp', 0.75)
  const resultado = webp?.type === 'image/webp' ? webp : await canvasABlob(canvas, 'image/jpeg', 0.8)
  if (!resultado) throw new Error('No se pudo comprimir la foto')

  const extension = resultado.type === 'image/webp' ? 'webp' : 'jpg'
  return new File([resultado], `reporte.${extension}`, { type: resultado.type })
}
