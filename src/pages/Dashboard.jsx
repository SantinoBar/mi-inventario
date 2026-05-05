import React, { useMemo, useState, useEffect } from 'react';
import { Clock, AlertCircle, DollarSign, TrendingUp, Package, Users, Check, Edit, CreditCard, Printer } from 'lucide-react';
import { useVentas } from '../context/VentasContext';
import { useInventario } from '../context/InventarioContext';
import { useClientes } from '../context/ClientesContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import { usePrinter } from '../context/PrinterContext';
import { Card, Modal, Button } from '../components/common';

const Dashboard = () => {
  // Obtener datos de contextos
  const { ventas, obtenerVentasPorEstado, obtenerVentasPorEstadoPago, obtenerTotalPendientePago, editarVenta, obtenerItemsVenta } = useVentas();
  const { productos, servicios } = useInventario();
  const { clientes, obtenerClientesActivos } = useClientes();
  const { obtenerConfig } = useConfiguracion();
  
  // Usar contexto de impresora
  const { 
    isConnected: printerConnected, 
    isConnecting: connectingPrinter, 
    deviceName, 
    connect: connectPrinter, 
    disconnect: disconnectPrinter,
    printerService 
  } = usePrinter();

  // Estados para modal de confirmación
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [ventaAEntregar, setVentaAEntregar] = useState(null);
  
  // Estados para modal de detalle
  const [modalDetalle, setModalDetalle] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [itemsVentaDetalle, setItemsVentaDetalle] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // Estado para modal de marcar como pagado
  const [modalPagar, setModalPagar] = useState(false);
  const [ventaAPagar, setVentaAPagar] = useState(null);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    // Ventas de hoy
    const ventasHoy = ventas.filter(v => {
      const fechaVenta = new Date(v.created_at);
      return fechaVenta >= hoy && fechaVenta < mañana;
    });

    const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + parseFloat(v.total), 0);

    // Contadores por estado
    const pendientes = obtenerVentasPorEstado('Pendiente').length;
    const enProceso = obtenerVentasPorEstado('En proceso').length;
    const completadas = obtenerVentasPorEstado('Completada').length;

    // Total pendiente de cobro
    const pendienteCobro = obtenerTotalPendientePago();

    // Clientes activos
    const clientesActivos = obtenerClientesActivos().length;

    // Productos con stock bajo (menos de 10 unidades)
    const productosStockBajo = productos.filter(p => p.stock < 10).length;

    return {
      ventasHoy: ventasHoy.length,
      totalVentasHoy,
      pendientes,
      enProceso,
      completadas,
      pendienteCobro,
      clientesActivos,
      productosStockBajo,
      totalVentas: ventas.length,
      totalProductos: productos.length,
      totalServicios: servicios.length
    };
  }, [ventas, productos, servicios, clientes, obtenerVentasPorEstado, obtenerVentasPorEstadoPago, obtenerTotalPendientePago, obtenerClientesActivos]);

  // Obtener ventas urgentes (entrega/recolección hoy o vencidas)
  const ventasUrgentes = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    return ventas
      .filter(v => {
        if (v.estado === 'Completada' || v.estado === 'Entregada') return false;
        
        const fechaEntrega = new Date(v.fecha_entrega);
        const fechaRecoleccion = new Date(v.fecha_recoleccion);
        
        // Urgente si la fecha de entrega o recolección es hoy o ya pasó
        return (fechaEntrega >= hoy && fechaEntrega < mañana) || 
               (fechaRecoleccion >= hoy && fechaRecoleccion < mañana) ||
               fechaEntrega < hoy ||
               fechaRecoleccion < hoy;
      })
      .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega))
      .slice(0, 10); // Máximo 10
  }, [ventas]);

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short'
    });
  };

  const esVencida = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(fecha) < hoy;
  };

  // Funciones de impresora usando contexto
  const handleConnectPrinter = async () => {
    try {
      const result = await connectPrinter();
      if (result.success && !result.reconnected) {
        alert('Impresora conectada exitosamente');
      }
    } catch (error) {
      alert('Error al conectar impresora: ' + error.message);
    }
  };

  const handleDisconnectPrinter = () => {
    disconnectPrinter();
  };

  // Imprimir ticket desde modal de detalle
  const imprimirTicketDashboard = async () => {
    if (!ventaDetalle) {
      alert('No hay venta seleccionada');
      return;
    }

    if (!printerConnected) {
      alert('Impresora no conectada. Conecta la impresora primero.');
      return;
    }

    try {
      // Obtener datos del negocio
      const datosNegocio = {
        nombre: obtenerConfig('negocio_nombre', 'MI NEGOCIO'),
        direccion: obtenerConfig('negocio_direccion', ''),
        telefono: obtenerConfig('negocio_telefono', '')
      };

      // Preparar venta con items
      const ventaCompleta = {
        ...ventaDetalle,
        items: itemsVentaDetalle
      };

      // Imprimir
      await printerService.printTicket(ventaCompleta, datosNegocio);
      alert('Ticket impreso exitosamente');
    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      alert('Error al imprimir ticket: ' + error.message);
    }
  };

  // Abrir modal de confirmación
  const confirmarEntrega = (venta, e) => {
    e?.stopPropagation(); // Evitar que abra el modal de detalle
    setVentaAEntregar(venta);
    setModalConfirmar(true);
  };

  // Abrir modal de detalle
  const abrirDetalle = async (venta) => {
    setVentaDetalle(venta);
    setModalDetalle(true);
    setLoadingItems(true);
    
    // Cargar items de la venta
    const result = await obtenerItemsVenta(venta.id);
    if (result.success) {
      setItemsVentaDetalle(result.data);
    } else {
      setItemsVentaDetalle([]);
      console.error('Error cargando items:', result.error);
    }
    setLoadingItems(false);
  };

  // Abrir modal para marcar como pagado
  const confirmarPago = (venta, e) => {
    e?.stopPropagation();
    setVentaAPagar(venta);
    setModalPagar(true);
  };

  // Marcar como pagado
  const marcarComoPagado = async () => {
    if (!ventaAPagar) return;

    const result = await editarVenta(ventaAPagar.id, {
      estado: ventaAPagar.estado,
      estado_pago: 'Pagado',
      cantidad_pagada: parseFloat(ventaAPagar.total),
      notas: ventaAPagar.notas
    });

    if (result.success) {
      setModalPagar(false);
      setVentaAPagar(null);
      // Si está en el modal de detalle, actualizarlo
      if (modalDetalle && ventaDetalle?.id === ventaAPagar.id) {
        setVentaDetalle({ ...ventaDetalle, estado_pago: 'Pagado', cantidad_pagada: ventaDetalle.total });
      }
    } else {
      alert('Error al marcar como pagado: ' + result.error);
    }
  };

  // Marcar como entregada
  const marcarComoEntregada = async () => {
    if (!ventaAEntregar) return;

    const result = await editarVenta(ventaAEntregar.id, {
      estado: 'Entregada',
      estado_pago: ventaAEntregar.estado_pago,
      cantidad_pagada: ventaAEntregar.cantidad_pagada,
      notas: ventaAEntregar.notas
    });

    if (result.success) {
      setModalConfirmar(false);
      setVentaAEntregar(null);
      // Si está en el modal de detalle, cerrarlo también
      if (modalDetalle) {
        setModalDetalle(false);
        setVentaDetalle(null);
      }
    } else {
      alert('Error al marcar como entregada: ' + result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de impresora */}
      {/* Header con botón de impresora */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen general de tu negocio</p>
        </div>
        
        {/* Estado y botón de impresora */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 bg-white px-4 py-3 rounded-lg border border-gray-200 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Impresora:</span>
            <span className={`text-sm font-medium ${printerConnected ? 'text-green-600' : 'text-red-600'}`}>
              {printerConnected ? `🟢 ${deviceName || 'Conectada'}` : '🔴 Desconectada'}
            </span>
          </div>
          <Button
            onClick={printerConnected ? handleDisconnectPrinter : handleConnectPrinter}
            variant={printerConnected ? 'outline' : 'primary'}
            size="small"
            disabled={connectingPrinter}
            className={`w-full sm:w-auto ${printerConnected ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}`}
          >
            {connectingPrinter ? 'Conectando...' : (printerConnected ? 'Desconectar' : 'Conectar')}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas de Hoy */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas de Hoy</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.ventasHoy}</p>
              <p className="text-sm text-green-600 mt-1">
                ${stats.totalVentasHoy.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Pendientes */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendientes}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* En Proceso */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Proceso</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.enProceso}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Completadas */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completadas}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Cards - Fila 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pendiente de Cobro */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendiente de Cobro</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                ${stats.pendienteCobro.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Clientes Activos */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Activos</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stats.clientesActivos}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        {/* Productos Stock Bajo */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{stats.productosStockBajo}</p>
              <p className="text-xs text-gray-500 mt-1">Menos de 10 unidades</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Pendientes Urgentes */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Entregas/Recolecciones Urgentes
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Pendientes para hoy o vencidas
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {ventasUrgentes.length > 0 ? (
            ventasUrgentes.map((venta) => (
              <div 
                key={venta.id} 
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => abrirDetalle(venta)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{venta.cliente_nombre}</h3>
                      {(esVencida(venta.fecha_entrega) || esVencida(venta.fecha_recoleccion)) && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Vencida
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        venta.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                        venta.estado === 'En proceso' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {venta.estado}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      Venta #{venta.id} • Total: ${parseFloat(venta.total).toFixed(2)}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-500 text-sm mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Entrega: {formatearFecha(venta.fecha_entrega)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Recol: {formatearFecha(venta.fecha_recoleccion)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón Marcar como Entregada */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmarEntrega(venta);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Check className="w-4 h-4" />
                    Marcar Entregada
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hay pendientes urgentes</p>
              <p className="text-sm text-gray-500 mt-1">¡Todo al día!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Confirmación */}
      <Modal
        isOpen={modalConfirmar}
        onClose={() => {
          setModalConfirmar(false);
          setVentaAEntregar(null);
        }}
        title="Confirmar Entrega"
        subtitle={ventaAEntregar ? `Venta #${ventaAEntregar.id} - ${ventaAEntregar.cliente_nombre}` : ''}
        size="medium"
        zIndex="z-[60]"
      >
        {ventaAEntregar && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ¿Estás seguro de marcar esta venta como <strong>Entregada</strong>?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium text-gray-800">{ventaAEntregar.cliente_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-gray-800">
                  ${parseFloat(ventaAEntregar.total).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado de Pago:</span>
                <span className={`font-medium ${
                  ventaAEntregar.estado_pago === 'Pagado' ? 'text-green-600' :
                  ventaAEntregar.estado_pago === 'Pagado parcialmente' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {ventaAEntregar.estado_pago}
                </span>
              </div>
            </div>

            {ventaAEntregar.estado_pago !== 'Pagado' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    <strong>Atención:</strong> Esta venta aún no está completamente pagada. 
                    Asegúrate de cobrar antes de marcar como entregada.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setModalConfirmar(false);
                  setVentaAEntregar(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={marcarComoEntregada}
                variant="primary"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmar Entrega
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Detalle de Venta */}
      <Modal
        isOpen={modalDetalle}
        onClose={() => {
          setModalDetalle(false);
          setVentaDetalle(null);
          setItemsVentaDetalle([]);
        }}
        title={`Detalle de Venta #${ventaDetalle?.id}`}
        subtitle={ventaDetalle ? formatearFecha(ventaDetalle.created_at) : ''}
        size="large"
      >
        {ventaDetalle && (
          <div className="space-y-4">
            {/* Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Información del Cliente</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nombre:</span> {ventaDetalle.cliente_nombre}</p>
                <p><span className="font-medium">Teléfono:</span> {ventaDetalle.cliente_telefono}</p>
                <p><span className="font-medium">Dirección:</span> {ventaDetalle.cliente_direccion}</p>
                <p><span className="font-medium">A domicilio:</span> {ventaDetalle.a_domicilio ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Fecha de Entrega</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {new Date(ventaDetalle.fecha_entrega).toLocaleDateString('es-MX')}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Fecha de Recolección</p>
                <p className="font-semibold text-gray-800 mt-1">
                  {new Date(ventaDetalle.fecha_recoleccion).toLocaleDateString('es-MX')}
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
              ) : itemsVentaDetalle.length > 0 ? (
                <div className="space-y-2">
                  {itemsVentaDetalle.map((item, index) => (
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
                  ${parseFloat(ventaDetalle.total).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Estado y Pago */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estado</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                  ventaDetalle.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                  ventaDetalle.estado === 'En proceso' ? 'bg-blue-100 text-blue-700' :
                  ventaDetalle.estado === 'Completada' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {ventaDetalle.estado}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Estado de Pago</p>
                <p className={`font-semibold mt-1 ${
                  ventaDetalle.estado_pago === 'Pagado' ? 'text-green-600' :
                  ventaDetalle.estado_pago === 'Pagado parcialmente' ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {ventaDetalle.estado_pago}
                </p>
                {ventaDetalle.estado_pago === 'Pagado parcialmente' && (
                  <p className="text-sm text-gray-600 mt-1">
                    Pagado: ${parseFloat(ventaDetalle.cantidad_pagada).toFixed(2)} / 
                    Falta: ${(parseFloat(ventaDetalle.total) - parseFloat(ventaDetalle.cantidad_pagada)).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Notas */}
            {ventaDetalle.notas && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Notas</h3>
                <p className="text-sm text-gray-700">{ventaDetalle.notas}</p>
              </div>
            )}

            {/* Botones de Acción */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  imprimirTicketDashboard();
                }}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/historial?editar=${ventaDetalle.id}`;
                }}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              
              {ventaDetalle.estado_pago !== 'Pagado' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmarPago(ventaDetalle, e);
                  }}
                  variant="primary"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4" />
                  Marcar Pagado
                </Button>
              )}
              
              {ventaDetalle.estado !== 'Entregada' && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmarEntrega(ventaDetalle, e);
                  }}
                  variant="primary"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Marcar Entregada
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmar Pago */}
      <Modal
        isOpen={modalPagar}
        onClose={() => {
          setModalPagar(false);
          setVentaAPagar(null);
        }}
        title="Confirmar Pago"
        subtitle={ventaAPagar ? `Venta #${ventaAPagar.id} - ${ventaAPagar.cliente_nombre}` : ''}
        size="medium"
        zIndex="z-[60]"
      >
        {ventaAPagar && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ¿Confirmas que esta venta ha sido <strong>pagada completamente</strong>?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium text-gray-800">{ventaAPagar.cliente_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total a Cobrar:</span>
                <span className="font-bold text-gray-800 text-lg">
                  ${parseFloat(ventaAPagar.total).toFixed(2)}
                </span>
              </div>
              {ventaAPagar.estado_pago === 'Pagado parcialmente' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ya Pagado:</span>
                    <span className="font-medium text-green-600">
                      ${parseFloat(ventaAPagar.cantidad_pagada).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="text-gray-600">Falta por Cobrar:</span>
                    <span className="font-bold text-red-600">
                      ${(parseFloat(ventaAPagar.total) - parseFloat(ventaAPagar.cantidad_pagada)).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setModalPagar(false);
                  setVentaAPagar(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={marcarComoPagado}
                variant="primary"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;