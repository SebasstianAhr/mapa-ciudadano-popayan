import { BrowserRouter, Route, Routes } from 'react-router'
import { ProveedorAuth } from './context/auth/ProveedorAuth'
import { ProveedorCategorias } from './context/categorias/ProveedorCategorias'
import { ProveedorTiempoReal } from './context/tiempoReal/ProveedorTiempoReal'
import { Diseno } from './components/layout/Diseno'
import { RutaProtegida } from './components/layout/RutaProtegida'
import { MapaPage } from './pages/MapaPage'
import { NuevoReportePage } from './pages/NuevoReportePage'
import { LoginPage } from './pages/LoginPage'
import { RegistroPage } from './pages/RegistroPage'
import { MisReportesPage } from './pages/MisReportesPage'
import { EstadisticasPage } from './pages/EstadisticasPage'
import { NoEncontradoPage } from './pages/NoEncontradoPage'

export default function App() {
  return (
    <BrowserRouter>
      <ProveedorAuth>
        <ProveedorTiempoReal>
          <ProveedorCategorias>
            <Routes>
              <Route element={<Diseno />}>
                <Route index element={<MapaPage />} />
                <Route
                  path="reportar"
                  element={
                    <RutaProtegida>
                      <NuevoReportePage />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="mis-reportes"
                  element={
                    <RutaProtegida>
                      <MisReportesPage />
                    </RutaProtegida>
                  }
                />
                <Route path="estadisticas" element={<EstadisticasPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registro" element={<RegistroPage />} />
                <Route path="*" element={<NoEncontradoPage />} />
              </Route>
            </Routes>
          </ProveedorCategorias>
        </ProveedorTiempoReal>
      </ProveedorAuth>
    </BrowserRouter>
  )
}
