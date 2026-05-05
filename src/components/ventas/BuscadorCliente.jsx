import React from 'react';
import { Input, Checkbox } from '../common';

const BuscadorCliente = ({
  busquedaCliente,
  setBusquedaCliente,
  mostrarSugerencias,
  setMostrarSugerencias,
  clientesFiltrados,
  seleccionarCliente,
  clienteSeleccionado,
  aDomicilio,
  setADomicilio
}) => {
  return (
    <div className="space-y-6">
      {/* Cliente */}
      <div className="relative">
        <Input
          label="Cliente"
          value={busquedaCliente}
          onChange={(e) => {
            setBusquedaCliente(e.target.value);
            setMostrarSugerencias(true);
          }}
          onFocus={() => setMostrarSugerencias(true)}
          placeholder="Buscar por nombre o teléfono..."
          required
        />
        
        {/* Sugerencias */}
        {mostrarSugerencias && busquedaCliente && clientesFiltrados.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {clientesFiltrados.map(cliente => (
              <div
                key={cliente.id}
                onClick={() => seleccionarCliente(cliente)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <p className="font-medium text-gray-800">{cliente.nombre}</p>
                <p className="text-sm text-gray-600">{cliente.telefono}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dirección */}
      <Input
        label="Dirección"
        value={clienteSeleccionado?.direccion || ''}
        readOnly
        placeholder="Se llenará automáticamente al seleccionar cliente"
      />

      {/* A domicilio */}
      <Checkbox
        id="aDomicilio"
        label="¿A domicilio?"
        checked={aDomicilio}
        onChange={(e) => setADomicilio(e.target.checked)}
      />
    </div>
  );
};

export default BuscadorCliente;
