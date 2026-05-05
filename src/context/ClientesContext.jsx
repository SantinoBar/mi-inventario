import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Crear el contexto
const ClientesContext = createContext();

// Hook personalizado para usar el contexto
export const useClientes = () => {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error('useClientes debe ser usado dentro de un ClientesProvider');
  }
  return context;
};

// Provider del contexto
export const ClientesProvider = ({ children }) => {
  // Estados
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========== CARGAR DATOS AL INICIO ==========
  useEffect(() => {
    cargarClientes();
  }, []);

  // Cargar clientes desde Supabase
  const cargarClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES CRUD ==========

  const agregarCliente = async (cliente) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setClientes([...clientes, data]);
      return { success: true, data };
    } catch (error) {
      console.error('Error agregando cliente:', error);
      return { success: false, error: error.message };
    }
  };

  const editarCliente = async (id, clienteActualizado) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(clienteActualizado)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setClientes(clientes.map(c => c.id === id ? data : c));
      return { success: true, data };
    } catch (error) {
      console.error('Error editando cliente:', error);
      return { success: false, error: error.message };
    }
  };

  const cambiarEstadoCliente = async (id, activo) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({ activo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setClientes(clientes.map(c => c.id === id ? data : c));
      return { success: true, data };
    } catch (error) {
      console.error('Error cambiando estado de cliente:', error);
      return { success: false, error: error.message };
    }
  };

  // Obtener clientes activos (para autocompletado en Ventas)
  const obtenerClientesActivos = () => {
    return clientes.filter(c => c.activo);
  };

  // Buscar cliente por id
  const obtenerClientePorId = (id) => {
    return clientes.find(c => c.id === id);
  };

  const value = {
    // Estados
    clientes,
    loading,
    error,
    // Funciones
    agregarCliente,
    editarCliente,
    cambiarEstadoCliente,
    cargarClientes,
    obtenerClientesActivos,
    obtenerClientePorId
  };

  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  );
};