import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal, Select, Input, Button } from '../../common';

const ModalEditarVenta = ({
  isOpen,
  onClose,
  ventaSeleccionada,
  setVentaSeleccionada,
  itemsVentaSeleccionada,
  setItemsVentaSeleccionada,
  loadingItems,
  busquedasItemsEdicion,
  handleBusquedaItemEdicion,
  mostrarSugerenciasItemsEdicion,
  setMostrarSugerenciasItemsEdicion,
  filtrarItemsEdicion,
  seleccionarItemEdicion,
  handleEditarVenta // now passed from parent
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Venta #${ventaSeleccionada?.id}`}
      subtitle="Modifica la información de la venta"
      size="large"
    >
      {ventaSeleccionada && (
        <div className="space-y-4">
          {/* Estado */}
          <Select
            label="Estado"
            value={ventaSeleccionada.estado}
            onChange={(e) => setVentaSeleccionada({ ...ventaSeleccionada, estado: e.target.value })}
            options={[
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'En proceso', label: 'En proceso' },
              { value: 'Completada', label: 'Completada' },
              { value: 'Entregada', label: 'Entregada' }
            ]}
            required
          />

          {/* Estado de Pago */}
          <Select
            label="Estado de Pago"
            value={ventaSeleccionada.estado_pago}
            onChange={(e) => setVentaSeleccionada({ ...ventaSeleccionada, estado_pago: e.target.value })}
            options={[
              { value: 'No pagado', label: 'No pagado' },
              { value: 'Pagado parcialmente', label: 'Pagado parcialmente' },
              { value: 'Pagado', label: 'Pagado' }
            ]}
            required
          />

          {/* Campos de pago parcial */}
          {ventaSeleccionada.estado_pago === 'Pagado parcialmente' && (
            <Input
              type="number"
              label="Cantidad Pagada"
              value={ventaSeleccionada.cantidad_pagada}
              onChange={(e) => setVentaSeleccionada({ ...ventaSeleccionada, cantidad_pagada: parseFloat(e.target.value) || 0 })}
              min="0"
              max={ventaSeleccionada.total}
              step="0.01"
              required
            />
          )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={ventaSeleccionada.notas || ''}
              onChange={(e) => setVentaSeleccionada({ ...ventaSeleccionada, notas: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Agrega notas sobre esta venta..."
            />
          </div>

          {/* Items - Solo editable si No pagado */}
          {ventaSeleccionada.estado_pago === 'No pagado' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Servicios/Productos
                </label>
                <Button
                  type="button"
                  onClick={() => {
                    setItemsVentaSeleccionada([
                      ...itemsVentaSeleccionada,
                      { id: Date.now(), item_tipo: '', item_id: '', nombre_item: '', cantidad: 1, precio_unitario: 0, subtotal: 0, esNuevo: true }
                    ]);
                  }}
                  variant="primary"
                  size="small"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>

              {loadingItems ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Cargando items...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemsVentaSeleccionada.map((item, index) => (
                    <div key={item.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        {/* Nombre con Autocompletado */}
                        <div className="col-span-12 md:col-span-5 relative">
                          <label className="block text-xs text-gray-600 mb-1">Producto/Servicio</label>
                          <input
                            type="text"
                            value={busquedasItemsEdicion[item.id] || item.nombre_item}
                            onChange={(e) => handleBusquedaItemEdicion(item.id, e.target.value)}
                            onFocus={() => setMostrarSugerenciasItemsEdicion({ ...mostrarSugerenciasItemsEdicion, [item.id]: true })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Buscar producto o servicio..."
                          />

                          {/* Sugerencias */}
                          {mostrarSugerenciasItemsEdicion[item.id] && filtrarItemsEdicion(item.id).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filtrarItemsEdicion(item.id).map((itemInv) => (
                                <div
                                  key={itemInv.id}
                                  onClick={() => seleccionarItemEdicion(index, itemInv)}
                                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-0"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">
                                        {itemInv.tipo === 'servicio' ? '🧺' : '📦'} {itemInv.nombre}
                                      </p>
                                      {itemInv.tipo === 'producto' && itemInv.stock !== undefined && (
                                        <p className="text-xs text-gray-500">
                                          Stock: {itemInv.stock} {itemInv.unidad}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-sm font-bold text-primary-700 ml-3">
                                      ${itemInv.precio.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Cantidad */}
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Cant.</label>
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => {
                              const nuevosItems = [...itemsVentaSeleccionada];
                              nuevosItems[index].cantidad = parseFloat(e.target.value) || 1;
                              nuevosItems[index].subtotal = nuevosItems[index].cantidad * nuevosItems[index].precio_unitario;
                              setItemsVentaSeleccionada(nuevosItems);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        {/* Precio */}
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Precio</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precio_unitario}
                            onChange={(e) => {
                              const nuevosItems = [...itemsVentaSeleccionada];
                              nuevosItems[index].precio_unitario = parseFloat(e.target.value) || 0;
                              nuevosItems[index].subtotal = nuevosItems[index].cantidad * nuevosItems[index].precio_unitario;
                              setItemsVentaSeleccionada(nuevosItems);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-3 md:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Subtotal</label>
                          <input
                            type="text"
                            value={`$${parseFloat(item.subtotal || 0).toFixed(2)}`}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium"
                          />
                        </div>

                        {/* Eliminar */}
                        <div className="col-span-1 flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (itemsVentaSeleccionada.length > 1) {
                                const nuevosItems = itemsVentaSeleccionada.filter((_, i) => i !== index);
                                setItemsVentaSeleccionada(nuevosItems);
                              }
                            }}
                            disabled={itemsVentaSeleccionada.length === 1}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nuevo Total Calculado */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-800">Total Actualizado</span>
                <span className="font-bold text-primary-700 text-xl">
                  ${itemsVentaSeleccionada.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Total (solo lectura si ya está pagado) */}
          {ventaSeleccionada.estado_pago !== 'No pagado' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total de la venta</span>
                <span className="text-2xl font-bold text-primary-700">
                  ${parseFloat(ventaSeleccionada.total).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Los items no pueden editarse porque la venta ya tiene pagos registrados
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditarVenta}
              variant="primary"
              className="flex-1"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalEditarVenta;
