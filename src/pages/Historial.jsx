import React, { useState } from 'react';
import { DollarSign, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useVentas } from '../context/VentasContext';
import { useInventario } from '../context/InventarioContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import PrinterService from '../services/PrinterService';

// Import extracted components
import FiltrosHistorial from '../components/historial/FiltrosHistorial';
import TablaVentas from '../components/historial/TablaVentas';
import ModalVerDetalle from '../components/historial/modals/ModalVerDetalle';
import ModalEditarVenta from '../components/historial/modals/ModalEditarVenta';
import ModalReimprimir from '../components/historial/modals/ModalReimprimir';
import WhatsAppService from '../services/WhatsAppService';

const Historial = () => {
  // Contextos
  const { ventas: ventasContext, editarVenta, obtenerItemsVenta, actualizarVentaConItems } = useVentas();
  const { obtenerConfig } = useConfiguracion();
  const { obtenerTodosLosItems } = useInventario();
  const itemsInventario = obtenerTodosLosItems();

  const hoy = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth());
  const [anioSeleccionado, setAnioSeleccionado] = useState(hoy.getFullYear());
  const [mostrarFiltrosMobile, setMostrarFiltrosMobile] = useState(false);
  const [semanasColapsadas, setSemanasColapsadas] = useState({});

  const toggleSemana = (numeroSemana) => {
    setSemanasColapsadas(prev => ({
      ...prev,
      [numeroSemana]: !prev[numeroSemana]
    }));
  };
  
  // Filtros
  const [filtroEstadoVenta, setFiltroEstadoVenta] = useState('Todos');
  const [filtroEstadoPago, setFiltroEstadoPago] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Estados de Modales
  const [modalVerDetalle, setModalVerDetalle] = useState(false);
  const [modalEditarVenta, setModalEditarVenta] = useState(false);
  const [modalReimprimir, setModalReimprimir] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [itemsVentaSeleccionada, setItemsVentaSeleccionada] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // Estados para autocompletado en Edición
  const [busquedasItemsEdicion, setBusquedasItemsEdicion] = useState({});
  const [mostrarSugerenciasItemsEdicion, setMostrarSugerenciasItemsEdicion] = useState({});
  
  // Estados para impresión
  const [generarTickets, setGenerarTickets] = useState(true);
  const [cantidadTickets, setCantidadTickets] = useState(1);
  const [enviarWhatsApp, setEnviarWhatsApp] = useState(false);

  // Lógica de Semanas
  const obtenerSemanasDelMes = (anio, mes) => {
    const semanas = [];
    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);

    let diaSemana = primerDia.getDay(); // 0 (Dom) - 6 (Sab)
    let diasParaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    
    let inicio = new Date(primerDia);
    inicio.setDate(primerDia.getDate() - diasParaLunes);

    let num = 1;
    while (inicio <= ultimoDia) {
      let fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      
      semanas.push({ numero: num, inicio: new Date(inicio), fin: new Date(fin) });
      inicio.setDate(inicio.getDate() + 7);
      num++;
    }
    return semanas;
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Filtrado de Ventas
  const filtrarPorPeriodo = (venta) => {
    const fechaVenta = new Date(venta.created_at);
    return fechaVenta.getMonth() === mesSeleccionado && fechaVenta.getFullYear() === anioSeleccionado;
  };

  const filtrarPorBusqueda = (venta) => {
    if (!busqueda) return true;
    const busquedaLower = busqueda.toLowerCase();
    return (
      venta.cliente_nombre?.toLowerCase().includes(busquedaLower) ||
      venta.id.toString().includes(busqueda)
    );
  };

  const ventasFiltradas = ventasContext
    .filter(v => filtrarPorPeriodo(v) && filtrarPorBusqueda(v))
    .filter(v => filtroEstadoVenta === 'Todos' || v.estado === filtroEstadoVenta)
    .filter(v => filtroEstadoPago === 'Todos' || v.estado_pago === filtroEstadoPago)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Cálculo de Métricas
  const totalVendido = ventasFiltradas.reduce((sum, v) => sum + Number(v.total || 0), 0);
  const porCobrar = ventasFiltradas.reduce((sum, v) => {
    if (v.estado_pago === 'No pagado') return sum + Number(v.total);
    if (v.estado_pago === 'Pagado parcialmente') return sum + (Number(v.total) - Number(v.cantidad_pagada));
    return sum;
  }, 0);
  const totalTickets = ventasFiltradas.length;

  // Lógica de Autocompletado de Items
  const handleBusquedaItemEdicion = (itemId, valor) => {
    setBusquedasItemsEdicion({ ...busquedasItemsEdicion, [itemId]: valor });
    setMostrarSugerenciasItemsEdicion({ ...mostrarSugerenciasItemsEdicion, [itemId]: valor.length > 0 });
  };

  const seleccionarItemEdicion = (itemIndex, itemInventario) => {
    const nuevosItems = [...itemsVentaSeleccionada];
    nuevosItems[itemIndex] = {
      ...nuevosItems[itemIndex],
      item_tipo: itemInventario.tipo,
      item_id: itemInventario.tipo === 'producto' ? itemInventario.productoId : itemInventario.servicioId,
      nombre_item: itemInventario.nombre,
      precio_unitario: itemInventario.precio,
      subtotal: nuevosItems[itemIndex].cantidad * itemInventario.precio
    };
    
    setItemsVentaSeleccionada(nuevosItems);
    setBusquedasItemsEdicion({ ...busquedasItemsEdicion, [nuevosItems[itemIndex].id]: itemInventario.nombre });
    setMostrarSugerenciasItemsEdicion({ ...mostrarSugerenciasItemsEdicion, [nuevosItems[itemIndex].id]: false });
  };

  const filtrarItemsEdicion = (itemId) => {
    const busq = busquedasItemsEdicion[itemId] || '';
    if (!busq) return itemsInventario;
    return itemsInventario.filter(item => item.nombre.toLowerCase().includes(busq.toLowerCase()));
  };

  // Lógica de Modales
  const abrirModalDetalle = async (venta) => {
    setVentaSeleccionada(venta);
    setModalVerDetalle(true);
    setLoadingItems(true);
    const result = await obtenerItemsVenta(venta.id);
    if (result.success) setItemsVentaSeleccionada(result.data);
    else { setItemsVentaSeleccionada([]); console.error('Error:', result.error); }
    setLoadingItems(false);
  };

  const abrirModalEditar = async (venta) => {
    setVentaSeleccionada({ ...venta });
    setModalEditarVenta(true);
    setLoadingItems(true);
    const result = await obtenerItemsVenta(venta.id);
    if (result.success) {
      setItemsVentaSeleccionada(result.data);
      const busquedasIniciales = {};
      result.data.forEach(item => { busquedasIniciales[item.id] = item.nombre_item; });
      setBusquedasItemsEdicion(busquedasIniciales);
    } else {
      setItemsVentaSeleccionada([]);
      console.error('Error:', result.error);
    }
    setLoadingItems(false);
  };

  const abrirModalReimprimir = async (venta) => {
    setVentaSeleccionada(venta);
    setGenerarTickets(true);
    setCantidadTickets(1);
    setEnviarWhatsApp(false);
    setModalReimprimir(true);
    const result = await obtenerItemsVenta(venta.id);
    if (result.success) setItemsVentaSeleccionada(result.data);
    else { setItemsVentaSeleccionada([]); console.error('Error:', result.error); }
  };

  // Impresión y Edición
  const imprimirTicketHistorial = async () => {
    if (!ventaSeleccionada) { alert('No hay venta seleccionada'); return; }
    if (!PrinterService.isDeviceConnected()) { alert('Impresora no conectada. Ve al Dashboard para conectarla.'); return; }
    try {
      const datosNegocio = {
        nombre: obtenerConfig('negocio_nombre', 'MI NEGOCIO'),
        direccion: obtenerConfig('negocio_direccion', ''),
        telefono: obtenerConfig('negocio_telefono', '')
      };
      const ventaCompleta = { ...ventaSeleccionada, items: itemsVentaSeleccionada };
      for (let i = 0; i < cantidadTickets; i++) {
        await PrinterService.printTicket(ventaCompleta, datosNegocio);
        if (i < cantidadTickets - 1) await new Promise(resolve => setTimeout(resolve, 500));
      }
      alert(`${cantidadTickets} ticket(s) impreso(s) exitosamente`);
      return true;
    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      alert('Error al imprimir ticket: ' + error.message);
      return false;
    }
  };

  const confirmarReimpresion = async () => {
    if (generarTickets) {
      const success = await imprimirTicketHistorial();
      if (!success) return; 
    }
    if (enviarWhatsApp) {
      const negocioConfig = { nombre: obtenerConfig('negocio_nombre', 'MI NEGOCIO') };
      WhatsAppService.enviarTicketWhatsApp(ventaSeleccionada, itemsVentaSeleccionada, negocioConfig);
    }
    setModalReimprimir(false);
    setVentaSeleccionada(null);
  };

  const handleEditarVenta = async () => {
    // Si el estado de pago es "No pagado", permitimos editar los items y actualizamos todo
    if (ventaSeleccionada.estado_pago === 'No pagado') {
      if (itemsVentaSeleccionada.length === 0) { alert('Debe haber al menos un producto o servicio'); return; }
      for (let i = 0; i < itemsVentaSeleccionada.length; i++) {
        const item = itemsVentaSeleccionada[i];
        if (!item.nombre_item || item.nombre_item.trim() === '') { alert(`Item ${i + 1}: Debe tener un nombre`); return; }
        if (item.cantidad <= 0) { alert(`Item ${i + 1}: La cantidad debe ser mayor a 0`); return; }
        if (item.precio_unitario < 0) { alert(`Item ${i + 1}: El precio no puede ser negativo`); return; }
      }

      const nuevoTotal = itemsVentaSeleccionada.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
      
      const itemsParaInsertar = itemsVentaSeleccionada.map(item => ({
        venta_id: ventaSeleccionada.id,
        item_tipo: item.item_tipo || 'producto',
        item_id: item.item_id || 0,
        nombre_item: item.nombre_item,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }));

      // Usar la función modularizada del contexto, en lugar de queries directos a Supabase
      const result = await actualizarVentaConItems(
        ventaSeleccionada.id, 
        {
          estado: ventaSeleccionada.estado,
          estado_pago: ventaSeleccionada.estado_pago,
          cantidad_pagada: 0,
          notas: ventaSeleccionada.notas,
          total: nuevoTotal
        }, 
        itemsParaInsertar
      );

      if (result.success) {
        setModalEditarVenta(false);
        setVentaSeleccionada(null);
        setItemsVentaSeleccionada([]);
        setBusquedasItemsEdicion({});
        setMostrarSugerenciasItemsEdicion({});
      } else { alert('Error al editar venta: ' + result.error); }
    } else {
      // Si ya tiene pagos, solo actualizamos los datos básicos
      const result = await editarVenta(ventaSeleccionada.id, {
        estado: ventaSeleccionada.estado,
        estado_pago: ventaSeleccionada.estado_pago,
        cantidad_pagada: ventaSeleccionada.cantidad_pagada,
        notas: ventaSeleccionada.notas
      });
      if (result.success) {
        setModalEditarVenta(false);
        setVentaSeleccionada(null);
        setBusquedasItemsEdicion({});
        setMostrarSugerenciasItemsEdicion({});
      } else { alert('Error al editar venta: ' + result.error); }
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      {/* CABECERA Y NAVEGACIÓN */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historial de Ventas</h1>
          <p className="text-gray-600 mt-1">Consulta y gestiona las ventas realizadas</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
          <span className="text-sm font-medium text-gray-600">Ver historial por:</span>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
              className="flex-1 md:w-40 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes, i) => (
                <option key={mes} value={i}>{mes}</option>
              ))}
            </select>
            <select 
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
              className="flex-1 md:w-32 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {[2024, 2025, 2026, 2027, 2028].map(anio => (
                <option key={anio} value={anio}>{anio}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="bg-green-100 p-3 rounded-lg"><DollarSign className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Vendido</p>
            <p className="font-bold text-gray-800 text-lg md:text-xl">${totalVendido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-lg"><Clock className="w-6 h-6 text-orange-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Por Cobrar</p>
            <p className="font-bold text-gray-800 text-lg md:text-xl">${porCobrar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Tickets Emitidos</p>
            <p className="font-bold text-gray-800 text-lg md:text-xl">{totalTickets}</p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <FiltrosHistorial 
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        filtroEstadoVenta={filtroEstadoVenta}
        setFiltroEstadoVenta={setFiltroEstadoVenta}
        filtroEstadoPago={filtroEstadoPago}
        setFiltroEstadoPago={setFiltroEstadoPago}
        mostrarFiltrosMobile={mostrarFiltrosMobile}
        setMostrarFiltrosMobile={setMostrarFiltrosMobile}
      />

      {/* LISTA DE VENTAS */}
      {ventasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-lg">
            {busqueda ? `No se encontraron resultados para "${busqueda}"` : 'No hay ventas registradas para este mes.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {obtenerSemanasDelMes(anioSeleccionado, mesSeleccionado).map((semana) => {
            const ventasDeLaSemana = ventasFiltradas.filter(v => {
              const f = new Date(v.created_at);
              f.setHours(0,0,0,0);
              const inicio = new Date(semana.inicio);
              inicio.setHours(0,0,0,0);
              const fin = new Date(semana.fin);
              fin.setHours(23,59,59,999);
              return f >= inicio && f <= fin;
            });

            if (ventasDeLaSemana.length === 0) return null;

            return (
              <div key={semana.numero} className="bg-transparent border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div 
                  onClick={() => toggleSemana(semana.numero)}
                  className="bg-white px-5 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <h2 className="text-xl font-bold text-gray-800">
                    Semana {semana.numero} 
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({semana.inicio.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})} al {semana.fin.toLocaleDateString('es-MX', {day: 'numeric', month: 'short'})})
                    </span>
                  </h2>
                  <button className="text-gray-500 hover:text-gray-700">
                    {semanasColapsadas[semana.numero] ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>
                {!semanasColapsadas[semana.numero] && (
                  <div className="p-4">
                    <TablaVentas 
                      ventasFiltradas={ventasDeLaSemana}
                      inicioRango={semana.inicio}
                      abrirModalDetalle={abrirModalDetalle}
                      abrirModalEditar={abrirModalEditar}
                      abrirModalReimprimir={abrirModalReimprimir}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODALES REUTILIZABLES */}
      <ModalVerDetalle 
        isOpen={modalVerDetalle}
        onClose={() => setModalVerDetalle(false)}
        ventaSeleccionada={ventaSeleccionada}
        loadingItems={loadingItems}
        itemsVentaSeleccionada={itemsVentaSeleccionada}
        formatearFecha={formatearFecha}
      />

      <ModalEditarVenta 
        isOpen={modalEditarVenta}
        onClose={() => setModalEditarVenta(false)}
        ventaSeleccionada={ventaSeleccionada}
        setVentaSeleccionada={setVentaSeleccionada}
        itemsVentaSeleccionada={itemsVentaSeleccionada}
        setItemsVentaSeleccionada={setItemsVentaSeleccionada}
        loadingItems={loadingItems}
        busquedasItemsEdicion={busquedasItemsEdicion}
        handleBusquedaItemEdicion={handleBusquedaItemEdicion}
        mostrarSugerenciasItemsEdicion={mostrarSugerenciasItemsEdicion}
        setMostrarSugerenciasItemsEdicion={setMostrarSugerenciasItemsEdicion}
        filtrarItemsEdicion={filtrarItemsEdicion}
        seleccionarItemEdicion={seleccionarItemEdicion}
        handleEditarVenta={handleEditarVenta}
      />

      <ModalReimprimir
        isOpen={modalReimprimir}
        onClose={() => setModalReimprimir(false)}
        ventaSeleccionada={ventaSeleccionada}
        generarTickets={generarTickets}
        setGenerarTickets={setGenerarTickets}
        cantidadTickets={cantidadTickets}
        setCantidadTickets={setCantidadTickets}
        enviarWhatsApp={enviarWhatsApp}
        setEnviarWhatsApp={setEnviarWhatsApp}
        confirmarReimpresion={confirmarReimpresion}
      />
    </div>
  );
};

export default Historial;