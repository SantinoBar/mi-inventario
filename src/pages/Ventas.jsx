import React, { useState } from 'react';
import { Card, Button } from '../components/common';
import { useInventario } from '../context/InventarioContext';
import { useClientes } from '../context/ClientesContext';
import { useVentas } from '../context/VentasContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import PrinterService from '../services/PrinterService';

// Import extracted components
import BuscadorCliente from '../components/ventas/BuscadorCliente';
import ListaItemsVenta from '../components/ventas/ListaItemsVenta';
import DetallesPagoVenta from '../components/ventas/DetallesPagoVenta';
import ModalConfirmacionVenta from '../components/ventas/modals/ModalConfirmacionVenta';

const Ventas = () => {
  // Contextos
  const { obtenerTodosLosItems } = useInventario();
  const itemsInventario = obtenerTodosLosItems();
  const { obtenerClientesActivos } = useClientes();
  const clientesActivos = obtenerClientesActivos();
  const { agregarVenta, obtenerItemsVenta } = useVentas();
  const { obtenerConfig } = useConfiguracion();

  // Estados del formulario - Cliente
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [aDomicilio, setADomicilio] = useState(false);

  // Estados del formulario - Items
  const [items, setItems] = useState([{ id: 1, servicio: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]);
  const [nextItemId, setNextItemId] = useState(2);
  const [busquedasItems, setBusquedasItems] = useState({});
  const [mostrarSugerenciasItems, setMostrarSugerenciasItems] = useState({});

  // Estados del formulario - Detalles y Pago
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().split('T')[0]);
  const [fechaRecoleccion, setFechaRecoleccion] = useState(new Date().toISOString().split('T')[0]);
  const [estado, setEstado] = useState('Pendiente');
  const [estadoPago, setEstadoPago] = useState('No pagado');
  const [cantidadPagada, setCantidadPagada] = useState(0);
  const [notas, setNotas] = useState('');

  // Estados del Modal
  const [mostrarModal, setMostrarModal] = useState(false);
  const [generarTickets, setGenerarTickets] = useState(false);
  const [cantidadTickets, setCantidadTickets] = useState(1);
  const [enviarWhatsApp, setEnviarWhatsApp] = useState(false);
  const [ventaCreada, setVentaCreada] = useState(null);

  // --- Lógica de Cliente ---
  const clientesFiltrados = clientesActivos.filter(cliente =>
    cliente.nombre.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    cliente.telefono.includes(busquedaCliente)
  );

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(`${cliente.nombre} - ${cliente.telefono}`);
    setMostrarSugerencias(false);
  };

  // --- Lógica de Items ---
  const agregarItem = () => {
    setItems([...items, { id: nextItemId, servicio: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]);
    setNextItemId(nextItemId + 1);
  };

  const eliminarItem = (itemId) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== itemId));
      const nuevasBusquedas = { ...busquedasItems };
      delete nuevasBusquedas[itemId];
      setBusquedasItems(nuevasBusquedas);
      const nuevasSugerencias = { ...mostrarSugerenciasItems };
      delete nuevasSugerencias[itemId];
      setMostrarSugerenciasItems(nuevasSugerencias);
    }
  };

  const actualizarItem = (itemId, campo, valor) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const itemActualizado = { ...item, [campo]: valor };
        if (campo === 'servicio') {
          const itemSeleccionado = itemsInventario.find(inv => inv.id === valor);
          if (itemSeleccionado) itemActualizado.precioUnitario = itemSeleccionado.precio;
        }
        if (['cantidad', 'precioUnitario', 'servicio'].includes(campo)) {
          itemActualizado.subtotal = itemActualizado.cantidad * itemActualizado.precioUnitario;
        }
        return itemActualizado;
      }
      return item;
    }));
  };

  const handleBusquedaItem = (itemId, valor) => {
    setBusquedasItems({ ...busquedasItems, [itemId]: valor });
    setMostrarSugerenciasItems({ ...mostrarSugerenciasItems, [itemId]: valor.length > 0 });
  };

  const seleccionarItem = (itemId, itemInventario) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          servicio: itemInventario.id,
          precioUnitario: itemInventario.precio,
          subtotal: item.cantidad * itemInventario.precio
        };
      }
      return item;
    }));
    setBusquedasItems({ ...busquedasItems, [itemId]: itemInventario.nombre });
    setMostrarSugerenciasItems({ ...mostrarSugerenciasItems, [itemId]: false });
  };

  const filtrarItems = (itemId) => {
    const busqueda = busquedasItems[itemId] || '';
    if (!busqueda) return itemsInventario;
    return itemsInventario.filter(item => item.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  };

  const incrementarCantidad = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item) actualizarItem(itemId, 'cantidad', item.cantidad + 1);
  };

  const decrementarCantidad = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item && item.cantidad > 1) actualizarItem(itemId, 'cantidad', item.cantidad - 1);
  };

  const calcularTotal = () => items.reduce((sum, item) => sum + item.subtotal, 0);
  const calcularFaltaPorPagar = () => calcularTotal() - cantidadPagada;

  // --- Lógica de Guardado ---
  const guardarVenta = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado) { alert('Debes seleccionar un cliente'); return; }
    if (items.length === 0 || !items[0].servicio) { alert('Debes agregar al menos un servicio o producto'); return; }

    const venta = {
      cliente_id: clienteSeleccionado.id,
      a_domicilio: aDomicilio,
      fecha_entrega: fechaEntrega,
      fecha_recoleccion: fechaRecoleccion,
      estado: estado,
      estado_pago: estadoPago,
      cantidad_pagada: estadoPago === 'Pagado' ? calcularTotal() : estadoPago === 'Pagado parcialmente' ? cantidadPagada : 0,
      total: calcularTotal(),
      notas: notas
    };

    const itemsParaInsertar = items.map(item => {
      const itemInventario = itemsInventario.find(i => i.id === item.servicio);
      return {
        tipo: itemInventario.tipo,
        itemId: itemInventario.tipo === 'producto' ? itemInventario.productoId : itemInventario.servicioId,
        nombre: itemInventario.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precioUnitario,
        subtotal: item.subtotal
      };
    });

    const result = await agregarVenta(venta, itemsParaInsertar);
    if (result.success) {
      setVentaCreada(result.data);
      setMostrarModal(true);
    } else {
      alert('Error al guardar venta: ' + result.error);
    }
  };

  // --- Lógica de Impresión y Modal ---
  const imprimirTicket = async () => {
    if (!ventaCreada) { alert('No hay venta para imprimir'); return; }
    if (!PrinterService.isDeviceConnected()) { alert('Impresora no conectada. Ve al Dashboard para conectarla.'); return; }

    try {
      const datosNegocio = {
        nombre: obtenerConfig('negocio_nombre', 'MI NEGOCIO'),
        direccion: obtenerConfig('negocio_direccion', ''),
        telefono: obtenerConfig('negocio_telefono', '')
      };

      const resultItems = await obtenerItemsVenta(ventaCreada.id);
      if (!resultItems.success) { alert('Error cargando items de la venta'); return; }

      const ventaCompleta = { ...ventaCreada, items: resultItems.data };

      for (let i = 0; i < cantidadTickets; i++) {
        await PrinterService.printTicket(ventaCompleta, datosNegocio);
        if (i < cantidadTickets - 1) await new Promise(resolve => setTimeout(resolve, 500));
      }
      alert(`${cantidadTickets} ticket(s) impreso(s) exitosamente`);
    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      alert('Error al imprimir ticket: ' + error.message);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setVentaCreada(null);
    setBusquedaCliente('');
    setClienteSeleccionado(null);
    setADomicilio(false);
    setItems([{ id: 1, servicio: '', cantidad: 1, precioUnitario: 0, subtotal: 0 }]);
    setNextItemId(2);
    setBusquedasItems({});
    setMostrarSugerenciasItems({});
    setFechaEntrega(new Date().toISOString().split('T')[0]);
    setFechaRecoleccion(new Date().toISOString().split('T')[0]);
    setEstado('Pendiente');
    setEstadoPago('No pagado');
    setCantidadPagada(0);
    setNotas('');
    setGenerarTickets(false);
    setCantidadTickets(1);
    setEnviarWhatsApp(false);
  };

  const confirmarModal = async () => {
    if (generarTickets) await imprimirTicket();
    if (enviarWhatsApp) console.log('Enviando ticket por WhatsApp');
    cerrarModal();
  };

  return (
    <div className="max-w-4xl pb-20 md:pb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Nueva Venta</h1>
        <p className="text-gray-600 mt-1">Registra una nueva venta o servicio</p>
      </div>

      <Card className="p-6 space-y-6">
        <form onSubmit={guardarVenta} className="space-y-6">
          <BuscadorCliente 
            busquedaCliente={busquedaCliente}
            setBusquedaCliente={setBusquedaCliente}
            mostrarSugerencias={mostrarSugerencias}
            setMostrarSugerencias={setMostrarSugerencias}
            clientesFiltrados={clientesFiltrados}
            seleccionarCliente={seleccionarCliente}
            clienteSeleccionado={clienteSeleccionado}
            aDomicilio={aDomicilio}
            setADomicilio={setADomicilio}
          />

          <ListaItemsVenta 
            items={items}
            agregarItem={agregarItem}
            eliminarItem={eliminarItem}
            actualizarItem={actualizarItem}
            busquedasItems={busquedasItems}
            handleBusquedaItem={handleBusquedaItem}
            mostrarSugerenciasItems={mostrarSugerenciasItems}
            setMostrarSugerenciasItems={setMostrarSugerenciasItems}
            filtrarItems={filtrarItems}
            seleccionarItem={seleccionarItem}
            incrementarCantidad={incrementarCantidad}
            decrementarCantidad={decrementarCantidad}
            calcularTotal={calcularTotal}
          />

          <DetallesPagoVenta 
            fechaEntrega={fechaEntrega}
            setFechaEntrega={setFechaEntrega}
            fechaRecoleccion={fechaRecoleccion}
            setFechaRecoleccion={setFechaRecoleccion}
            estado={estado}
            setEstado={setEstado}
            estadoPago={estadoPago}
            setEstadoPago={setEstadoPago}
            cantidadPagada={cantidadPagada}
            setCantidadPagada={setCantidadPagada}
            calcularTotal={calcularTotal}
            calcularFaltaPorPagar={calcularFaltaPorPagar}
            notas={notas}
            setNotas={setNotas}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" size="large">
              Guardar Venta
            </Button>
          </div>
        </form>
      </Card>

      <ModalConfirmacionVenta 
        mostrarModal={mostrarModal}
        cerrarModal={cerrarModal}
        generarTickets={generarTickets}
        setGenerarTickets={setGenerarTickets}
        cantidadTickets={cantidadTickets}
        setCantidadTickets={setCantidadTickets}
        enviarWhatsApp={enviarWhatsApp}
        setEnviarWhatsApp={setEnviarWhatsApp}
        confirmarModal={confirmarModal}
      />
    </div>
  );
};

export default Ventas;