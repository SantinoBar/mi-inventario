import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../common';

const ListaItemsVenta = ({
  items,
  agregarItem,
  eliminarItem,
  actualizarItem,
  busquedasItems,
  handleBusquedaItem,
  mostrarSugerenciasItems,
  setMostrarSugerenciasItems,
  filtrarItems,
  seleccionarItem,
  incrementarCantidad,
  decrementarCantidad,
  calcularTotal
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Servicios/Productos *
        </label>
        <Button
          type="button"
          onClick={agregarItem}
          variant="primary"
          size="small"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 border border-gray-200 rounded-lg">
            {/* Servicio/Producto */}
            <div className="md:col-span-5 relative">
              <label className="block text-xs text-gray-600 mb-1">Servicio/Producto</label>
              <input
                type="text"
                value={busquedasItems[item.id] || ''}
                onChange={(e) => handleBusquedaItem(item.id, e.target.value)}
                onFocus={() => setMostrarSugerenciasItems({ ...mostrarSugerenciasItems, [item.id]: true })}
                placeholder="Buscar servicio o producto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                required
              />

              {/* Sugerencias */}
              {mostrarSugerenciasItems[item.id] && filtrarItems(item.id).length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filtrarItems(item.id).map((itemInv) => (
                    <div
                      key={itemInv.id}
                      onClick={() => seleccionarItem(item.id, itemInv)}
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

            {/* Cantidad con botones +/- */}
            <div className="md:col-span-3">
              <label className="block text-xs text-gray-600 mb-1">Cantidad</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => decrementarCantidad(item.id)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  disabled={item.cantidad <= 1}
                >
                  <Minus className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) => actualizarItem(item.id, 'cantidad', parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-center font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => incrementarCantidad(item.id)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Precio Unitario (bloqueado) */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Precio Unit.</label>
              <input
                type="text"
                value={`$${item.precioUnitario.toFixed(2)}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium cursor-not-allowed"
              />
            </div>

            {/* Subtotal */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Subtotal</label>
              <input
                type="text"
                value={`$${item.subtotal.toFixed(2)}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium"
              />
            </div>

            {/* Botón eliminar - Alineado con los inputs */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => eliminarItem(item.id)}
                disabled={items.length === 1}
                className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-red-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-4 flex justify-end">
        <div className="bg-primary-700 text-white px-6 py-3 rounded-lg">
          <span className="text-sm">Total: </span>
          <span className="text-2xl font-bold">${calcularTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ListaItemsVenta;
