import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Crear el contexto
const GastosContext = createContext();

// Hook personalizado para usar el contexto
export const useGastos = () => {
  const context = useContext(GastosContext);
  if (!context) {
    throw new Error('useGastos debe ser usado dentro de un GastosProvider');
  }
  return context;
};

// Provider del contexto
export const GastosProvider = ({ children }) => {
  // Estados
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== CARGAR DATOS AL INICIO ==========
  useEffect(() => {
    cargarGastos();
  }, []);

  // Cargar gastos desde Supabase
  const cargarGastos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setGastos(data || []);
    } catch (error) {
      console.error('Error cargando gastos:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES CRUD ==========

  const agregarGasto = async (gasto) => {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .insert([gasto])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setGastos([data, ...gastos]);
      return { success: true, data };
    } catch (error) {
      console.error('Error agregando gasto:', error);
      return { success: false, error: error.message };
    }
  };

  const editarGasto = async (id, gastoActualizado) => {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .update(gastoActualizado)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setGastos(gastos.map(g => g.id === id ? data : g));
      return { success: true, data };
    } catch (error) {
      console.error('Error editando gasto:', error);
      return { success: false, error: error.message };
    }
  };

  const eliminarGasto = async (id) => {
    try {
      const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setGastos(gastos.filter(g => g.id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      return { success: false, error: error.message };
    }
  };

  // ========== FUNCIONES DE UTILIDAD ==========

  // Obtener total de gastos por período
  const obtenerTotalPorPeriodo = (fechaInicio, fechaFin) => {
    return gastos
      .filter(g => {
        const inicio = new Date(g.fecha_inicio);
        const fin = new Date(g.fecha_fin);
        const periodoInicio = new Date(fechaInicio);
        const periodoFin = new Date(fechaFin);
        
        // El gasto está dentro del período si hay algún overlap
        return inicio <= periodoFin && fin >= periodoInicio;
      })
      .reduce((sum, g) => sum + parseFloat(g.monto), 0);
  };

  // Obtener gastos por categoría
  const obtenerGastosPorCategoria = () => {
    const categorias = {};
    gastos.forEach(g => {
      if (!categorias[g.categoria]) {
        categorias[g.categoria] = 0;
      }
      categorias[g.categoria] += parseFloat(g.monto);
    });
    return categorias;
  };

  const value = {
    // Estados
    gastos,
    loading,
    error,
    // Funciones CRUD
    agregarGasto,
    editarGasto,
    eliminarGasto,
    cargarGastos,
    // Funciones de utilidad
    obtenerTotalPorPeriodo,
    obtenerGastosPorCategoria
  };

  return (
    <GastosContext.Provider value={value}>
      {children}
    </GastosContext.Provider>
  );
};