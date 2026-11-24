import { Outlet } from 'react-router'
import { Encabezado } from './Encabezado'

export function Diseno() {
  return (
    <div className="aplicacion">
      <Encabezado />
      <main className="contenido">
        <Outlet />
      </main>
    </div>
  )
}
