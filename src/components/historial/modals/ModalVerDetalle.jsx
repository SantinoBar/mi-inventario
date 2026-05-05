import React from 'react';
import { Modal } from '../../common';
import { estadosColores } from '../TarjetaVenta';

const ModalVerDetalle = ({ 
  isOpen, 
  onClose, 
  ventaSeleccionada, 
  loadingItems, 
  itemsVentaSeleccionada,
  formatearFecha 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle de Venta #${ventaSeleccionada?.id}`}
      subtitle={ventaSeleccionada ? formatearFecha(ventaSeleccionada.created_at) : ''}
      size="large"
    >
      {ventaSeleccionada && (
        <div className="space-y-4">
          {/* Cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Información del Cliente</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nombre:</span> {ventaSeleccionada.cliente_nombre}</p>
              <p><span className="font-medium">Teléfono:</span> {ventaSeleccionada.cliente_telefono}</p>
              <p><span className="font-medium">Dirección:</span> {ventaSeleccionada.cliente_direccion}</p>
              <p><span className="font-medium">A domicilio:</span> {ventaSeleccionada.a_domicilio ? 'Sí' : 'No'}</p>
            </div>
          </div>

          {/* Fechas de Entrega/Recolección */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Fecha de Entrega</p>
              <p className="font-semibold text-gray-800 mt-1">
                {new Date(ventaSeleccionada.fecha_entrega).toLocaleDateString('es-MX')}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Fecha de Recolección</p>
              <p className="font-semibold text-gray-800 mt-1">
                {new Date(ventaSeleccionada.fecha_recoleccion).toLocaleDateString('es-MX')}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Servicios/Productos</h3>
            {loadingItems ? (
              <div className="text-center py-4">
                <p className="text-gray-600">Cargando items...</p>
              </div>
            ) : itemsVentaSeleccionada.length > 0 ? (
              <div className="space-y-2">
                {itemsVentaSeleccionada.map((item, index) => (
                  <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.item_tipo === 'servicio' ? '🧺' : '📦'} {item.nombre_item}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.cantidad} x ${parseFloat(item.precio_unitario).toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">${parseFloat(item.subtotal).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">No hay items registrados</p>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-primary-700 text-xl">
                ${parseFloat(ventaSeleccionada.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Estado y Pago */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estado</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${estadosColores[ventaSeleccionada.estado] || 'bg-gray-100'}`}>
                {ventaSeleccionada.estado}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estado de Pago</p>
              <p className="font-semibold text-gray-800 mt-1">{ventaSeleccionada.estado_pago}</p>
              {ventaSeleccionada.estado_pago === 'Pagado parcialmente' && (
                <p className="text-sm text-gray-600 mt-1">
                  Pagado: ${parseFloat(ventaSeleccionada.cantidad_pagada).toFixed(2)} / 
                  Falta: ${(parseFloat(ventaSeleccionada.total) - parseFloat(ventaSeleccionada.cantidad_pagada)).toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Notas */}
          {ventaSeleccionada.notas && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Notas</h3>
              <p className="text-sm text-gray-700">{ventaSeleccionada.notas}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ModalVerDetalle;
