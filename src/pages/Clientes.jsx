import React, { useState } from 'react';
import { Plus, Edit, Phone, MapPin, FileText, UserX, UserCheck } from 'lucide-react';
import { Button, Input, Modal, Card, TextArea } from '../components/common';
import { useClientes } from '../context/ClientesContext';

const Clientes = () => {
  // Obtener datos y funciones del contexto
  const {
    clientes,
    loading,
    agregarCliente,
    editarCliente,
    cambiarEstadoCliente
  } = useClientes();

  // Filtro activo/inactivo
  const [filtro, setFiltro] = useState('activos'); // 'activos' o 'inactivos'

  // Estado de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Estados de modales
  const [modalAgregarCliente, setModalAgregarCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [modalConfirmarCambioEstado, setModalConfirmarCambioEstado] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Estado de formulario
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    notas: ''
  });

  // Filtrar clientes según el filtro activo y búsqueda
  const clientesFiltrados = clientes.filter(cliente => {
    // Filtro por estado (activo/inactivo)
    const cumpleFiltroEstado = filtro === 'activos' ? cliente.activo : !cliente.activo;
    
    // Filtro por búsqueda (nombre, teléfono o dirección)
    const cumpleBusqueda = busqueda === '' || 
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.telefono.includes(busqueda) ||
      cliente.direccion.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // ========== FUNCIONES ==========

  const handleAgregarCliente = async () => {
    const cliente = {
      ...nuevoCliente,
      activo: true
    };
    
    const result = await agregarCliente(cliente);
    if (result.success) {
      setModalAgregarCliente(false);
      setNuevoCliente({ nombre: '', telefono: '', direccion: '', notas: '' });
    } else {
      alert('Error al agregar cliente: ' + result.error);
    }
  };

  const handleEditarCliente = async () => {
    const result = await editarCliente(clienteSeleccionado.id, clienteSeleccionado);
    if (result.success) {
      setModalEditarCliente(false);
      setClienteSeleccionado(null);
    } else {
      alert('Error al editar cliente: ' + result.error);
    }
  };

  const abrirModalEditarCliente = (cliente) => {
    setClienteSeleccionado({ ...cliente });
    setModalEditarCliente(true);
  };

  const abrirModalCambiarEstado = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalConfirmarCambioEstado(true);
  };

  const confirmarCambioEstado = async () => {
    const nuevoEstado = !clienteSeleccionado.activo;
    const result = await cambiarEstadoCliente(clienteSeleccionado.id, nuevoEstado);
    
    if (result.success) {
      setModalConfirmarCambioEstado(false);
      setClienteSeleccionado(null);
    } else {
      alert('Error al cambiar estado: ' + result.error);
    }
  };

  // Truncar texto a 2 líneas
  const truncarNotas = (texto, maxLength = 100) => {
    if (!texto) return 'Sin notas';
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
  };

  // Resaltar coincidencias de búsqueda
  const resaltarTexto = (texto, busqueda) => {
    if (!busqueda || !texto) return texto;
    
    const regex = new RegExp(`(${busqueda})`, 'gi');
    const partes = texto.split(regex);
    
    return partes.map((parte, index) => 
      regex.test(parte) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {parte}
        </mark>
      ) : (
        parte
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tu cartera de clientes</p>
        </div>
        <Button
          onClick={() => setModalAgregarCliente(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Agregar Cliente
        </Button>
      </div>

      {/* Buscador */}
      <div className="max-w-md">
        <Input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, teléfono o dirección..."
          className="w-full"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFiltro('activos')}
          className={`px-4 py-2 font-medium transition-colors ${
            filtro === 'activos'
              ? 'text-primary-700 border-b-2 border-primary-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Activos ({clientes.filter(c => c.activo).length})
        </button>
        <button
          onClick={() => setFiltro('inactivos')}
          className={`px-4 py-2 font-medium transition-colors ${
            filtro === 'inactivos'
              ? 'text-primary-700 border-b-2 border-primary-700'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Inactivos ({clientes.filter(c => !c.activo).length})
        </button>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id} className="p-4">
            {/* Header con nombre y badge */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-lg flex-1">
                {resaltarTexto(cliente.nombre, busqueda)}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                cliente.activo 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {cliente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            {/* Información */}
            <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
              {/* Teléfono */}
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">{resaltarTexto(cliente.telefono, busqueda)}</span>
              </div>

              {/* Dirección */}
              {cliente.direccion && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 line-clamp-2">{resaltarTexto(cliente.direccion, busqueda)}</span>
                </div>
              )}

              {/* Notas */}
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 italic line-clamp-2">
                  {truncarNotas(cliente.notas)}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={() => abrirModalEditarCliente(cliente)}
                variant="outline"
                size="small"
                className="flex-1 flex items-center justify-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                onClick={() => abrirModalCambiarEstado(cliente)}
                variant={cliente.activo ? 'secondary' : 'primary'}
                size="small"
                className="flex items-center justify-center gap-1 px-3"
              >
                {cliente.activo ? (
                  <>
                    <UserX className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Mensaje cuando no hay clientes */}
      {clientesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {busqueda ? (
              <>No se encontraron resultados para "<span className="font-semibold">{busqueda}</span>"</>
            ) : (
              <>No hay clientes {filtro === 'activos' ? 'activos' : 'inactivos'}</>
            )}
          </p>
        </div>
      )}

      {/* ========== MODALES ========== */}

      {/* Modal Agregar Cliente */}
      <Modal
        isOpen={modalAgregarCliente}
        onClose={() => setModalAgregarCliente(false)}
        title="Agregar Cliente"
        subtitle="Registra un nuevo cliente"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={nuevoCliente.nombre}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
            placeholder="Nombre completo del cliente"
            required
          />

          <Input
            label="Teléfono"
            type="tel"
            value={nuevoCliente.telefono}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
            placeholder="10 dígitos"
            required
          />

          <Input
            label="Dirección de Entrega"
            value={nuevoCliente.direccion}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, direccion: e.target.value })}
            placeholder="Calle, número, colonia"
          />

          <TextArea
            label="Notas"
            value={nuevoCliente.notas}
            onChange={(e) => setNuevoCliente({ ...nuevoCliente, notas: e.target.value })}
            placeholder="Información adicional del cliente..."
            rows={4}
          />

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setModalAgregarCliente(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarCliente}
              variant="primary"
              className="flex-1"
              disabled={!nuevoCliente.nombre || !nuevoCliente.telefono}
            >
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Editar Cliente */}
      <Modal
        isOpen={modalEditarCliente}
        onClose={() => setModalEditarCliente(false)}
        title="Editar Cliente"
        subtitle="Modifica la información del cliente"
      >
        {clienteSeleccionado && (
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={clienteSeleccionado.nombre}
              onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, nombre: e.target.value })}
              required
            />

            <Input
              label="Teléfono"
              type="tel"
              value={clienteSeleccionado.telefono}
              onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, telefono: e.target.value })}
              required
            />

            <Input
              label="Dirección de Entrega"
              value={clienteSeleccionado.direccion}
              onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, direccion: e.target.value })}
            />

            <TextArea
              label="Notas"
              value={clienteSeleccionado.notas}
              onChange={(e) => setClienteSeleccionado({ ...clienteSeleccionado, notas: e.target.value })}
              rows={4}
            />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setModalEditarCliente(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditarCliente}
                variant="primary"
                className="flex-1"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Cambio de Estado */}
      <Modal
        isOpen={modalConfirmarCambioEstado}
        onClose={() => setModalConfirmarCambioEstado(false)}
        title={clienteSeleccionado?.activo ? "Desactivar Cliente" : "Activar Cliente"}
        subtitle="Confirma el cambio de estado"
        size="small"
      >
        {clienteSeleccionado && (
          <div className="space-y-4">
            <div className={`border rounded-lg p-4 ${
              clienteSeleccionado.activo 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-sm ${
                clienteSeleccionado.activo 
                  ? 'text-orange-800' 
                  : 'text-green-800'
              }`}>
                {clienteSeleccionado.activo ? (
                  <>
                    ¿Estás seguro de que deseas <span className="font-semibold">desactivar</span> a{' '}
                    <span className="font-semibold">{clienteSeleccionado.nombre}</span>?
                    <br />
                    <span className="text-xs mt-1 block">El cliente pasará a la lista de inactivos.</span>
                  </>
                ) : (
                  <>
                    ¿Estás seguro de que deseas <span className="font-semibold">activar</span> a{' '}
                    <span className="font-semibold">{clienteSeleccionado.nombre}</span>?
                    <br />
                    <span className="text-xs mt-1 block">El cliente volverá a la lista de activos.</span>
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setModalConfirmarCambioEstado(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarCambioEstado}
                variant={clienteSeleccionado.activo ? 'secondary' : 'primary'}
                className="flex-1"
              >
                {clienteSeleccionado.activo ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clientes;