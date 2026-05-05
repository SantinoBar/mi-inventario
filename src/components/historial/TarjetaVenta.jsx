import React from 'react';
import { Eye, Edit, Printer } from 'lucide-react';
import { Card } from '../common';

export const estadosColores = {
  'Pendiente': 'bg-yellow-100 text-yellow-700',
  'En proceso': 'bg-blue-100 text-blue-700',
  'Completada': 'bg-green-100 text-green-700',
  'Entregada': 'bg-purple-100 text-purple-700'
};

const TarjetaVenta = ({ venta, abrirModalDetalle, abrirModalEditar, abrirModalReimprimir }) => (
  <Card className="p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => abrirModalDetalle(venta)}>
    <div className="flex justify-between items-start mb-2">
      <span className="font-bold text-gray-800">#{venta.id}</span>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadosColores[venta.estado] || 'bg-gray-100'}`}>
        {venta.estado}
      </span>
    </div>
    <div className="mb-2">
      <h3 className="font-semibold text-gray-800">{venta.cliente_nombre}</h3>
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span>{new Date(venta.created_at).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
        <span className="font-medium text-gray-700">{venta.estado_pago}</span>
      </div>
    </div>
    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-3">
      <span className="text-xl font-bold text-primary-700">
        ${parseFloat(venta.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </span>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => abrirModalDetalle(venta)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
          <Eye className="w-5 h-5" />
        </button>
        <button onClick={() => abrirModalEditar(venta)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
          <Edit className="w-5 h-5" />
        </button>
        <button onClick={() => abrirModalReimprimir(venta)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Printer className="w-5 h-5" />
        </button>
      </div>
    </div>
  </Card>
);

export default TarjetaVenta;
