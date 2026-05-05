import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Crear el contexto
const VentasContext = createContext();

// Hook personalizado para usar el contexto
export const useVentas = () => {
  const context = useContext(VentasContext);
  if (!context) {
    throw new Error('useVentas debe ser usado dentro de un VentasProvider');
  }
  return context;
};

// Provider del contexto
export const VentasProvider = ({ children }) => {
  // Estados
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== CARGAR DATOS AL INICIO ==========
  useEffect(() => {
    cargarVentas();
    // Ejecutar limpieza al cargar
    limpiarVentasSinItems();
  }, []);

  // Cargar ventas desde Supabase con información del cliente
  const cargarVentas = async () => {
    try {
      setLoading(true);
      
      // Usar la vista que ya incluye información del cliente
      const { data, error } = await supabase
        .from('vista_ventas_completa')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVentas(data || []);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== VALIDACIONES ==========

  const validarVenta = (venta) => {
    const errores = [];

    if (!venta.cliente_id) {
      errores.push('Debe seleccionar un cliente');
    }

    if (!venta.fecha_entrega) {
      errores.push('Debe especificar fecha de entrega');
    }

    if (!venta.fecha_recoleccion) {
      errores.push('Debe especificar fecha de recolección');
    }

    if (venta.total <= 0) {
      errores.push('El total de la venta debe ser mayor a 0');
    }

    if (venta.cantidad_pagada < 0) {
      errores.push('La cantidad pagada no puede ser negativa');
    }

    if (venta.cantidad_pagada > venta.total) {
      errores.push('La cantidad pagada no puede ser mayor al total');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  };

  const validarItems = (items) => {
    const errores = [];

    if (!items || items.length === 0) {
      errores.push('Debe agregar al menos un producto o servicio');
      return { valido: false, errores };
    }

    items.forEach((item, index) => {
      if (!item.tipo) {
        errores.push(`Item ${index + 1}: Tipo no especificado`);
      }

      if (!item.itemId) {
        errores.push(`Item ${index + 1}: ID no especificado`);
      }

      if (!item.nombre || item.nombre.trim() === '') {
        errores.push(`Item ${index + 1}: Nombre no especificado`);
      }

      if (item.cantidad <= 0) {
        errores.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
      }

      if (item.precio_unitario < 0) {
        errores.push(`Item ${index + 1}: Precio unitario no puede ser negativo`);
      }

      if (item.subtotal < 0) {
        errores.push(`Item ${index + 1}: Subtotal no puede ser negativo`);
      }
    });

    return {
      valido: errores.length === 0,
      errores
    };
  };

  // ========== LIMPIEZA DE VENTAS HUÉRFANAS ==========

  const limpiarVentasSinItems = async () => {
    try {
      // 1. Obtener todas las ventas
      const { data: todasVentas, error: errorVentas } = await supabase
        .from('ventas')
        .select('id');

      if (errorVentas) throw errorVentas;

      if (!todasVentas || todasVentas.length === 0) return;

      // 2. Obtener ventas que tienen items
      const { data: ventasConItems, error: errorItems } = await supabase
        .from('ventas_items')
        .select('venta_id');

      if (errorItems) throw errorItems;

      // 3. Crear set de IDs de ventas con items
      const ventasConItemsIds = new Set(
        (ventasConItems || []).map(item => item.venta_id)
      );

      // 4. Encontrar ventas sin items
      const ventasSinItems = todasVentas.filter(
        venta => !ventasConItemsIds.has(venta.id)
      );

      // 5. Eliminar ventas huérfanas
      if (ventasSinItems.length > 0) {
        const idsAEliminar = ventasSinItems.map(v => v.id);
        
        const { error: errorEliminar } = await supabase
          .from('ventas')
          .delete()
          .in('id', idsAEliminar);

        if (errorEliminar) throw errorEliminar;

        console.log(`Limpieza: ${ventasSinItems.length} venta(s) sin items eliminada(s)`);
      }
    } catch (error) {
      console.error('Error en limpieza de ventas sin items:', error);
      // No lanzamos error para no bloquear la carga
    }
  };

  // ========== FUNCIONES CRUD ==========

  const agregarVenta = async (venta, items) => {
    try {
      // PASO 1: Validar venta
      const validacionVenta = validarVenta(venta);
      if (!validacionVenta.valido) {
        return { 
          success: false, 
          error: validacionVenta.errores.join(', ') 
        };
      }

      // PASO 2: Validar items ANTES de insertar
      const validacionItems = validarItems(items);
      if (!validacionItems.valido) {
        return { 
          success: false, 
          error: validacionItems.errores.join(', ') 
        };
      }

      // PASO 3: Insertar la venta principal
      const { data: ventaCreada, error: errorVenta } = await supabase
        .from('ventas')
        .insert([{
          cliente_id: venta.cliente_id,
          a_domicilio: venta.a_domicilio,
          fecha_entrega: venta.fecha_entrega,
          fecha_recoleccion: venta.fecha_recoleccion,
          estado: venta.estado,
          estado_pago: venta.estado_pago,
          cantidad_pagada: venta.cantidad_pagada,
          total: venta.total,
          notas: venta.notas
        }])
        .select()
        .single();

      if (errorVenta) throw errorVenta;

      // PASO 4: Insertar los items de la venta
      const itemsParaInsertar = items.map(item => ({
        venta_id: ventaCreada.id,
        item_tipo: item.tipo,
        item_id: item.itemId,
        nombre_item: item.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }));

      const { error: errorItems } = await supabase
        .from('ventas_items')
        .insert(itemsParaInsertar);

      if (errorItems) {
        // Si falla la inserción de items, eliminar la venta creada
        console.error('Error insertando items, revertiendo venta...');
        await supabase
          .from('ventas')
          .delete()
          .eq('id', ventaCreada.id);
        
        throw new Error('Error al guardar los items de la venta: ' + errorItems.message);
      }

      // PASO 5: Obtener la venta completa con datos del cliente desde la vista
      const { data: ventaCompleta, error: errorVentaCompleta } = await supabase
        .from('vista_ventas_completa')
        .select('*')
        .eq('id', ventaCreada.id)
        .single();

      if (errorVentaCompleta) {
        console.error('Error obteniendo venta completa:', errorVentaCompleta);
        // Si falla, recargar ventas y retornar lo básico
        await cargarVentas();
        return { success: true, data: ventaCreada };
      }

      // PASO 6: Recargar ventas
      await cargarVentas();

      return { success: true, data: ventaCompleta };
    } catch (error) {
      console.error('Error agregando venta:', error);
      return { success: false, error: error.message };
    }
  };

  const editarVenta = async (id, ventaActualizada) => {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .update({
          estado: ventaActualizada.estado,
          estado_pago: ventaActualizada.estado_pago,
          cantidad_pagada: ventaActualizada.cantidad_pagada,
          notas: ventaActualizada.notas
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Recargar para obtener vista completa
      await cargarVentas();

      return { success: true, data };
    } catch (error) {
      console.error('Error editando venta:', error);
      return { success: false, error: error.message };
    }
  };

  const actualizarVentaConItems = async (ventaId, datosVenta, nuevosItems) => {
    try {
      // 1. Eliminar items antiguos
      const { error: errorEliminar } = await supabase
        .from('ventas_items')
        .delete()
        .eq('venta_id', ventaId);
      
      if (errorEliminar) throw new Error('Error al eliminar items antiguos: ' + errorEliminar.message);

      // 2. Insertar items nuevos
      const { error: errorInsertar } = await supabase
        .from('ventas_items')
        .insert(nuevosItems);
      
      if (errorInsertar) throw new Error('Error al guardar nuevos items: ' + errorInsertar.message);

      // 3. Actualizar la venta principal (estado, pago, total)
      const { error: errorVenta } = await supabase
        .from('ventas')
        .update(datosVenta)
        .eq('id', ventaId);
      
      if (errorVenta) throw new Error('Error al actualizar venta: ' + errorVenta.message);

      // 4. Recargar ventas
      await cargarVentas();

      return { success: true };
    } catch (error) {
      console.error('Error actualizando venta con items:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtener items de una venta específica
  const obtenerItemsVenta = async (ventaId) => {
    try {
      const { data, error } = await supabase
        .from('ventas_items')
        .select('*')
        .eq('venta_id', ventaId)
        .order('id', { ascending: true });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error obteniendo items de venta:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== FUNCIONES DE UTILIDAD ==========

  // Obtener ventas por período
  const obtenerVentasPorPeriodo = (fechaInicio, fechaFin) => {
    return ventas.filter(v => {
      const fechaVenta = new Date(v.created_at);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return fechaVenta >= inicio && fechaVenta <= fin;
    });
  };

  // Obtener total de ventas por período
  const obtenerTotalPorPeriodo = (fechaInicio, fechaFin) => {
    const ventasPeriodo = obtenerVentasPorPeriodo(fechaInicio, fechaFin);
    return ventasPeriodo.reduce((sum, v) => sum + parseFloat(v.total), 0);
  };

  // Obtener ventas por estado
  const obtenerVentasPorEstado = (estado) => {
    return ventas.filter(v => v.estado === estado);
  };

  // Obtener ventas por estado de pago
  const obtenerVentasPorEstadoPago = (estadoPago) => {
    return ventas.filter(v => v.estado_pago === estadoPago);
  };

  // Obtener total pendiente de pago
  const obtenerTotalPendientePago = () => {
    return ventas.reduce((sum, v) => {
      const pendiente = parseFloat(v.total) - parseFloat(v.cantidad_pagada);
      return sum + pendiente;
    }, 0);
  };

  const value = {
    // Estados
    ventas,
    loading,
    error,
    // Funciones CRUD
    agregarVenta,
    editarVenta,
    actualizarVentaConItems,
    cargarVentas,
    obtenerItemsVenta,
    // Funciones de mantenimiento
    limpiarVentasSinItems,
    // Funciones de utilidad
    obtenerVentasPorPeriodo,
    obtenerTotalPorPeriodo,
    obtenerVentasPorEstado,
    obtenerVentasPorEstadoPago,
    obtenerTotalPendientePago
  };

  return (
    <VentasContext.Provider value={value}>
      {children}
    </VentasContext.Provider>
  );
};