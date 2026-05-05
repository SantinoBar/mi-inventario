import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInventario } from './InventarioContext';
import { useVentas } from './VentasContext';
import { useConfiguracion } from './ConfiguracionContext';

const NotificacionesContext = createContext();

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error('useNotificaciones debe usarse dentro de NotificacionesProvider');
  }
  return context;
};

export const NotificacionesProvider = ({ children }) => {
  const { productos } = useInventario();
  const { ventas } = useVentas();
  const { obtenerConfig } = useConfiguracion();

  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesLeidas, setNotificacionesLeidas] = useState(new Set());
  const [mostrarPanel, setMostrarPanel] = useState(false);

  // Generar notificaciones
  useEffect(() => {
    const generarNotificaciones = () => {
      const nuevasNotificaciones = [];
      const ahora = new Date();

      // Verificar si las notificaciones están activas
      const notifActivas = obtenerConfig('notif_activas', true);
      if (!notifActivas) {
        setNotificaciones([]);
        return;
      }

      // 1. NOTIFICACIONES DE STOCK BAJO
      const alertasStockBajo = obtenerConfig('notif_stock_bajo', true);
      const limiteStock = obtenerConfig('notif_limite_stock', 10);

      if (alertasStockBajo) {
        const productosStockBajo = productos.filter(p => p.stock < limiteStock && p.stock > 0);
        
        productosStockBajo.forEach(producto => {
          nuevasNotificaciones.push({
            id: `stock-${producto.id}`,
            tipo: 'stock',
            prioridad: producto.stock < 5 ? 'alta' : 'media',
            titulo: 'Stock Bajo',
            mensaje: `${producto.nombre} tiene solo ${producto.stock} unidades`,
            fecha: new Date(),
            icono: '📦',
            color: producto.stock < 5 ? 'red' : 'orange',
            accion: {
              texto: 'Ver Producto',
              link: '/inventario'
            },
            datos: {
              producto_id: producto.id,
              stock_actual: producto.stock
            }
          });
        });

        // Productos sin stock
        const productosSinStock = productos.filter(p => p.stock === 0);
        productosSinStock.forEach(producto => {
          nuevasNotificaciones.push({
            id: `sin-stock-${producto.id}`,
            tipo: 'stock',
            prioridad: 'alta',
            titulo: 'Sin Stock',
            mensaje: `${producto.nombre} está agotado`,
            fecha: new Date(),
            icono: '⚠️',
            color: 'red',
            accion: {
              texto: 'Reabastecer',
              link: '/inventario'
            },
            datos: {
              producto_id: producto.id,
              stock_actual: 0
            }
          });
        });
      }

      // 2. NOTIFICACIONES DE ENTREGAS
      const recordatorios = obtenerConfig('notif_recordatorios', true);

      if (recordatorios) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);

        // Entregas para hoy
        const entregasHoy = ventas.filter(v => {
          if (v.estado === 'Entregada') return false;
          const fechaEntrega = new Date(v.fecha_entrega);
          return fechaEntrega >= hoy && fechaEntrega < mañana;
        });

        entregasHoy.forEach(venta => {
          nuevasNotificaciones.push({
            id: `entrega-hoy-${venta.id}`,
            tipo: 'entrega',
            prioridad: 'media',
            titulo: 'Entrega Programada Hoy',
            mensaje: `Entregar pedido a ${venta.cliente_nombre}`,
            fecha: new Date(venta.fecha_entrega),
            icono: '🚚',
            color: 'blue',
            accion: {
              texto: 'Ver Pedido',
              link: `/historial?id=${venta.id}`
            },
            datos: {
              venta_id: venta.id,
              cliente: venta.cliente_nombre,
              total: venta.total
            }
          });
        });

        // Entregas vencidas
        const entregasVencidas = ventas.filter(v => {
          if (v.estado === 'Entregada') return false;
          const fechaEntrega = new Date(v.fecha_entrega);
          return fechaEntrega < hoy;
        });

        entregasVencidas.forEach(venta => {
          const diasVencidos = Math.floor((hoy - new Date(venta.fecha_entrega)) / (1000 * 60 * 60 * 24));
          nuevasNotificaciones.push({
            id: `entrega-vencida-${venta.id}`,
            tipo: 'entrega',
            prioridad: 'alta',
            titulo: 'Entrega Vencida',
            mensaje: `Entrega a ${venta.cliente_nombre} venció hace ${diasVencidos} día(s)`,
            fecha: new Date(venta.fecha_entrega),
            icono: '⏰',
            color: 'red',
            accion: {
              texto: 'Ver Urgente',
              link: `/historial?id=${venta.id}`
            },
            datos: {
              venta_id: venta.id,
              cliente: venta.cliente_nombre,
              dias_vencidos: diasVencidos
            }
          });
        });

        // Recolecciones para hoy
        const recoleccionesHoy = ventas.filter(v => {
          if (v.estado === 'Entregada') return false;
          const fechaRecoleccion = new Date(v.fecha_recoleccion);
          return fechaRecoleccion >= hoy && fechaRecoleccion < mañana;
        });

        recoleccionesHoy.forEach(venta => {
          nuevasNotificaciones.push({
            id: `recoleccion-hoy-${venta.id}`,
            tipo: 'recoleccion',
            prioridad: 'media',
            titulo: 'Recolección Programada Hoy',
            mensaje: `Recoger pedido de ${venta.cliente_nombre}`,
            fecha: new Date(venta.fecha_recoleccion),
            icono: '📥',
            color: 'green',
            accion: {
              texto: 'Ver Pedido',
              link: `/historial?id=${venta.id}`
            },
            datos: {
              venta_id: venta.id,
              cliente: venta.cliente_nombre
            }
          });
        });
      }

      // 3. NOTIFICACIONES DE PAGOS PENDIENTES
      if (recordatorios) {
        const pagosPendientes = ventas.filter(v => 
          v.estado_pago === 'No pagado' || v.estado_pago === 'Pagado parcialmente'
        );

        pagosPendientes.forEach(venta => {
          const montoPendiente = parseFloat(venta.total) - parseFloat(venta.cantidad_pagada || 0);
          
          nuevasNotificaciones.push({
            id: `pago-pendiente-${venta.id}`,
            tipo: 'pago',
            prioridad: montoPendiente > 1000 ? 'alta' : 'baja',
            titulo: venta.estado_pago === 'No pagado' ? 'Pago Pendiente' : 'Pago Parcial',
            mensaje: `${venta.cliente_nombre} debe $${montoPendiente.toFixed(2)}`,
            fecha: new Date(venta.created_at),
            icono: '💰',
            color: montoPendiente > 1000 ? 'red' : 'yellow',
            accion: {
              texto: 'Cobrar',
              link: `/historial?id=${venta.id}`
            },
            datos: {
              venta_id: venta.id,
              cliente: venta.cliente_nombre,
              monto_pendiente: montoPendiente
            }
          });
        });
      }

      // Ordenar por prioridad y fecha
      nuevasNotificaciones.sort((a, b) => {
        const prioridadOrden = { alta: 0, media: 1, baja: 2 };
        if (prioridadOrden[a.prioridad] !== prioridadOrden[b.prioridad]) {
          return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
        }
        return new Date(b.fecha) - new Date(a.fecha);
      });

      setNotificaciones(nuevasNotificaciones);
    };

    generarNotificaciones();

    // Actualizar notificaciones cada 30 segundos
    const interval = setInterval(generarNotificaciones, 30000);

    return () => clearInterval(interval);
  }, [productos, ventas, obtenerConfig]);

  // Obtener notificaciones no leídas
  const getNotificacionesNoLeidas = () => {
    return notificaciones.filter(n => !notificacionesLeidas.has(n.id));
  };

  // Marcar notificación como leída
  const marcarComoLeida = (id) => {
    setNotificacionesLeidas(prev => new Set([...prev, id]));
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = () => {
    const todosLosIds = notificaciones.map(n => n.id);
    setNotificacionesLeidas(new Set(todosLosIds));
  };

  // Limpiar notificación
  const limpiarNotificacion = (id) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
    setNotificacionesLeidas(prev => {
      const nuevo = new Set(prev);
      nuevo.delete(id);
      return nuevo;
    });
  };

  // Obtener conteo de notificaciones no leídas
  const getConteoNoLeidas = () => {
    return getNotificacionesNoLeidas().length;
  };

  // Obtener notificaciones por tipo
  const getNotificacionesPorTipo = (tipo) => {
    return notificaciones.filter(n => n.tipo === tipo);
  };

  // Obtener notificaciones por prioridad
  const getNotificacionesPorPrioridad = (prioridad) => {
    return notificaciones.filter(n => n.prioridad === prioridad);
  };

  const value = {
    notificaciones,
    notificacionesNoLeidas: getNotificacionesNoLeidas(),
    conteoNoLeidas: getConteoNoLeidas(),
    mostrarPanel,
    setMostrarPanel,
    marcarComoLeida,
    marcarTodasComoLeidas,
    limpiarNotificacion,
    getNotificacionesPorTipo,
    getNotificacionesPorPrioridad
  };

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  );
};