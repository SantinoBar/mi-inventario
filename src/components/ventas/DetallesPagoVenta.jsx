import React from 'react';
import { Input, Select, TextArea } from '../common';

const DetallesPagoVenta = ({
  fechaEntrega,
  setFechaEntrega,
  fechaRecoleccion,
  setFechaRecoleccion,
  estado,
  setEstado,
  estadoPago,
  setEstadoPago,
  cantidadPagada,
  setCantidadPagada,
  calcularTotal,
  calcularFaltaPorPagar,
  notas,
  setNotas
}) => {
  return (
    <div className="space-y-6">
      {/* Fechas de Período y Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          type="date"
          label="Fecha de Entrega"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          required
        />

        <Input
          type="date"
          label="Fecha de Recolección"
          value={fechaRecoleccion}
          onChange={(e) => setFechaRecoleccion(e.target.value)}
          required
        />

        <Select
          label="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          options={[
            { value: 'Pendiente', label: 'Pendiente' },
            { value: 'En proceso', label: 'En proceso' },
            { value: 'Completada', label: 'Completada' },
            { value: 'Entregada', label: 'Entregada' }
          ]}
          required
        />
      </div>

      {/* Estado de Pago */}
      <div>
        <Select
          label="Estado de Pago"
          value={estadoPago}
          onChange={(e) => setEstadoPago(e.target.value)}
          options={[
            { value: 'No pagado', label: 'No pagado' },
            { value: 'Pagado parcialmente', label: 'Pagado parcialmente' },
            { value: 'Pagado', label: 'Pagado' }
          ]}
          required
        />

        {/* Campos de pago parcial */}
        {estadoPago === 'Pagado parcialmente' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Cantidad Pagada"
              value={cantidadPagada}
              onChange={(e) => setCantidadPagada(parseFloat(e.target.value) || 0)}
              min="0"
              max={calcularTotal()}
              step="0.01"
              required
            />
            <Input
              label="Falta por Pagar"
              value={`$${calcularFaltaPorPagar().toFixed(2)}`}
              readOnly
            />
          </div>
        )}
      </div>

      {/* Notas */}
      <TextArea
        label="Notas/Observaciones"
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Agrega cualquier nota u observación adicional..."
        rows={4}
      />
    </div>
  );
};

export default DetallesPagoVenta;
