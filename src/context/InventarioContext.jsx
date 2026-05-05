import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Crear el contexto
const InventarioContext = createContext();

// Hook personalizado para usar el contexto
export const useInventario = () => {
  const context = useContext(InventarioContext);
  if (!context) {
    throw new Error('useInventario debe ser usado dentro de un InventarioProvider');
  }
  return context;
};

// Provider del contexto
export const InventarioProvider = ({ children }) => {
  // Estados
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== CARGAR DATOS AL INICIO ==========
  useEffect(() => {
    cargarProductos();
    cargarServicios();
  }, []);

  // Cargar productos desde Supabase
  const cargarProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setProductos(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar servicios desde Supabase
  const cargarServicios = async () => {
    try {
      const { data, error } = await supabase
        .from('servicios')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setServicios(data || []);
    } catch (error) {
      console.error('Error cargando servicios:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES DE PRODUCTOS ==========

  const agregarProducto = async (producto) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select()
        .single();

      if (error) throw error;
      
      // Actualizar estado local
      setProductos([...productos, data]);
      return { success: true, data };
    } catch (error) {
      console.error('Error agregando producto:', error);
      return { success: false, error: error.message };
    }
  };

  const editarProducto = async (id, productoActualizado) => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(productoActualizado)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setProductos(productos.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (error) {
      console.error('Error editando producto:', error);
      return { success: false, error: error.message };
    }
  };

  const eliminarProducto = async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setProductos(productos.filter(p => p.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return { success: false, error: error.message };
    }
  };

  const agregarStock = async (id, cantidad) => {
    try {
      // Obtener stock actual
      const producto = productos.find(p => p.id === id);
      if (!producto) throw new Error('Producto no encontrado');

      const nuevoStock = producto.stock + cantidad;

      const { data, error } = await supabase
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setProductos(productos.map(p => p.id === id ? data : p));
      return { success: true, data };
    } catch (error) {
      console.error('Error agregando stock:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== FUNCIONES DE SERVICIOS ==========

  const agregarServicio = async (servicio) => {
    try {
      const { data, error } = await supabase
        .from('servicios')
        .insert([servicio])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setServicios([...servicios, data]);
      return { success: true, data };
    } catch (error) {
      console.error('Error agregando servicio:', error);
      return { success: false, error: error.message };
    }
  };

  const editarServicio = async (id, servicioActualizado) => {
    try {
      const { data, error } = await supabase
        .from('servicios')
        .update(servicioActualizado)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setServicios(servicios.map(s => s.id === id ? data : s));
      return { success: true, data };
    } catch (error) {
      console.error('Error editando servicio:', error);
      return { success: false, error: error.message };
    }
  };

  const eliminarServicio = async (id) => {
    try {
      const { error } = await supabase
        .from('servicios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setServicios(servicios.filter(s => s.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== FUNCIÓN COMBINADA ==========

  const obtenerTodosLosItems = () => {
    const productosFormateados = productos.map(p => ({
      id: `producto-${p.id}`,
      nombre: `${p.nombre} (${p.unidad})`,
      precio: p.precio,
      tipo: 'producto',
      stock: p.stock,
      unidad: p.unidad,
      productoId: p.id
    }));

    const serviciosFormateados = servicios.map(s => ({
      id: `servicio-${s.id}`,
      nombre: s.nombre,
      precio: s.precio,
      tipo: 'servicio',
      servicioId: s.id
    }));

    return [...serviciosFormateados, ...productosFormateados];
  };

  const value = {
    // Estados
    productos,
    servicios,
    loading,
    error,
    // Funciones de productos
    agregarProducto,
    editarProducto,
    eliminarProducto,
    agregarStock,
    // Funciones de servicios
    agregarServicio,
    editarServicio,
    eliminarServicio,
    // Funciones de recarga
    cargarProductos,
    cargarServicios,
    // Función combinada
    obtenerTodosLosItems
  };

  return (
    <InventarioContext.Provider value={value}>
      {children}
    </InventarioContext.Provider>
  );
};