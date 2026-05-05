import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import { InventarioProvider } from './context/InventarioContext';
import { ClientesProvider } from './context/ClientesContext';
import { GastosProvider } from './context/GastosContext';
import { VentasProvider } from './context/VentasContext';
import { ConfiguracionProvider } from './context/ConfiguracionContext';
import { PrinterProvider } from './context/PrinterContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import Historial from './pages/Historial';
import Configuracion from './pages/Configuracion';
import Gastos from './pages/Gastos';

const AppProviders = ({ children }) => (
  <ConfiguracionProvider>
    <PrinterProvider>
      <InventarioProvider>
        <ClientesProvider>
          <GastosProvider>
            <VentasProvider>
              <NotificacionesProvider>
                {children}
              </NotificacionesProvider>
            </VentasProvider>
          </GastosProvider>
        </ClientesProvider>
      </InventarioProvider>
    </PrinterProvider>
  </ConfiguracionProvider>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppProviders><Layout /></AppProviders>}>
              <Route index element={<Dashboard />} />
              <Route path="ventas" element={<Ventas />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="gastos" element={<Gastos />} />
              <Route path="historial" element={<Historial />} />
              <Route path="configuracion" element={<Configuracion />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;