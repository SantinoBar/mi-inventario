import React from 'react';
import { Modal, Checkbox, Button } from '../../common';

const ModalReimprimir = ({
  isOpen,
  onClose,
  ventaSeleccionada,
  generarTickets,
  setGenerarTickets,
  cantidadTickets,
  setCantidadTickets,
  enviarWhatsApp,
  setEnviarWhatsApp,
  confirmarReimpresion
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reimprimir Ticket"
      subtitle={ventaSeleccionada ? `Venta #${ventaSeleccionada.id} - ${ventaSeleccionada.cliente_nombre}` : ''}
      size="medium"
    >
      <div className="space-y-4">
        {/* Generar Tickets */}
        <div className="border border-gray-200 rounded-lg p-4">
          <Checkbox
            id="generarTicketsReimpresion"
            label="Generar tickets impresos"
            checked={generarTickets}
            onChange={(e) => setGenerarTickets(e.target.checked)}
            className="mb-3"
          />

          {generarTickets && (
            <div className="ml-7">
              <label className="block text-sm text-gray-600 mb-2">
                Cantidad de tickets
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  onClick={() => setCantidadTickets(Math.max(1, cantidadTickets - 1))}
                  variant="outline"
                  size="small"
                  className="w-10 h-10"
                >
                  -
                </Button>
                <input
                  type="number"
                  min="1"
                  value={cantidadTickets}
                  onChange={(e) => setCantidadTickets(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button
                  type="button"
                  onClick={() => setCantidadTickets(cantidadTickets + 1)}
                  variant="outline"
                  size="small"
                  className="w-10 h-10"
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enviar WhatsApp */}
        <div className="border border-gray-200 rounded-lg p-4">
          <Checkbox
            id="enviarWhatsAppReimpresion"
            label="Enviar ticket por WhatsApp"
            checked={enviarWhatsApp}
            onChange={(e) => setEnviarWhatsApp(e.target.checked)}
          />
        </div>

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
            onClick={confirmarReimpresion}
            variant="primary"
            className="flex-1"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalReimprimir;
