import React, { useState } from 'react';
import { Eye, Edit, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import TarjetaVenta, { estadosColores } from './TarjetaVenta';

const TablaVentas = ({ ventasFiltradas, inicioRango, abrirModalDetalle, abrirModalEditar, abrirModalReimprimir }) => {
  const [diasColapsados, setDiasColapsados] = useState({});

  const toggleDia = (dia) => {
    setDiasColapsados(prev => ({
      ...prev,
      [dia]: !prev[dia]
    }));
  };

  return (
    <div className="space-y-6">
      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((nombreDia, index) => {
        const fechaDelDia = new Date(inicioRango);
        fechaDelDia.setDate(inicioRango.getDate() + index);

        const ventasDelDia = ventasFiltradas.filter(v => new Date(v.created_at).toDateString() === fechaDelDia.toDateString());
        if (ventasDelDia.length === 0) return null;

        return (
          <div key={nombreDia} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              onClick={() => toggleDia(nombreDia)}
              className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <button className="text-gray-500 hover:text-gray-700">
                  {diasColapsados[nombreDia] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
                <h3 className="font-bold text-gray-800 text-lg">
                  {nombreDia} <span className="text-gray-500 font-normal text-sm ml-2">({fechaDelDia.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })})</span>
                </h3>
              </div>
              <span className="text-sm font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                ${ventasDelDia.reduce((sum, v) => sum + Number(v.total), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            {!diasColapsados[nombreDia] && (
              <>
                {/* Desktop: Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Pago</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventasDelDia.map(venta => (
                    <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-600 text-sm">#{venta.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{venta.cliente_nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadosColores[venta.estado] || 'bg-gray-100'}`}>{venta.estado}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{venta.estado_pago}</td>
                      <td className="px-4 py-3 font-bold text-primary-700 text-right">${parseFloat(venta.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => abrirModalDetalle(venta)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-5 h-5" /></button>
                          <button onClick={() => abrirModalEditar(venta)} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Edit className="w-5 h-5" /></button>
                          <button onClick={() => abrirModalReimprimir(venta)} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Printer className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Lista de Tarjetas */}
            <div className="md:hidden p-3 bg-white">
              {ventasDelDia.map(venta => (
                <TarjetaVenta 
                  key={venta.id} 
                  venta={venta} 
                  abrirModalDetalle={abrirModalDetalle}
                  abrirModalEditar={abrirModalEditar}
                  abrirModalReimprimir={abrirModalReimprimir}
                />
              ))}
            </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TablaVentas;
