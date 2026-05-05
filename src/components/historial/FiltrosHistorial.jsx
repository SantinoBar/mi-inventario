import React from 'react';
import { Search, Filter } from 'lucide-react';

const FiltrosHistorial = ({
  busqueda,
  setBusqueda,
  filtroEstadoVenta,
  setFiltroEstadoVenta,
  filtroEstadoPago,
  setFiltroEstadoPago,
  mostrarFiltrosMobile,
  setMostrarFiltrosMobile
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente o número de venta..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        {/* Mobile Filters Toggle */}
        <button 
          onClick={() => setMostrarFiltrosMobile(!mostrarFiltrosMobile)}
          className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-200"
        >
          <Filter className="w-4 h-4" /> Filtros {filtroEstadoVenta !== 'Todos' || filtroEstadoPago !== 'Todos' ? '(Activos)' : ''}
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`${mostrarFiltrosMobile ? 'block' : 'hidden'} md:block bg-gray-50 p-4 md:p-0 md:bg-transparent rounded-lg border border-gray-200 md:border-none`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado de Venta</label>
            <select value={filtroEstadoVenta} onChange={(e) => setFiltroEstadoVenta(e.target.value)} className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="Todos">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Completada">Completada</option>
              <option value="Entregada">Entregada</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado de Pago</label>
            <select value={filtroEstadoPago} onChange={(e) => setFiltroEstadoPago(e.target.value)} className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="Todos">Todos los pagos</option>
              <option value="Pagado">Pagado</option>
              <option value="Pagado parcialmente">Pagado parcialmente</option>
              <option value="No pagado">No pagado</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltrosHistorial;
