import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ConfiguracionContext = createContext();

export const useConfiguracion = () => {
  const context = useContext(ConfiguracionContext);
  if (!context) {
    throw new Error('useConfiguracion debe usarse dentro de ConfiguracionProvider');
  }
  return context;
};

export const ConfiguracionProvider = ({ children }) => {
  const [configuraciones, setConfiguraciones] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar todas las configuraciones
  const cargarConfiguraciones = async () => {
    try {
      const { data, error } = await supabase
        .from('configuraciones')
        .select('*')
        .order('clave');

      if (error) throw error;

      // Convertir array a objeto para fácil acceso
      const configObj = {};
      data.forEach(config => {
        // Convertir el valor según el tipo
        let valor = config.valor;
        if (config.tipo === 'boolean') {
          valor = config.valor === 'true';
        } else if (config.tipo === 'number') {
          valor = parseFloat(config.valor);
        }
        configObj[config.clave] = valor;
      });

      setConfiguraciones(configObj);
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener una configuración específica
  const obtenerConfig = (clave, valorPorDefecto = null) => {
    return configuraciones[clave] !== undefined ? configuraciones[clave] : valorPorDefecto;
  };

  // Actualizar una configuración
  const actualizarConfig = async (clave, valor) => {
    try {
      // Convertir valor a string para almacenar
      const valorString = typeof valor === 'boolean' ? valor.toString() : String(valor);

      const { error } = await supabase
        .from('configuraciones')
        .update({ 
          valor: valorString,
          updated_at: new Date().toISOString()
        })
        .eq('clave', clave);

      if (error) throw error;

      // Actualizar estado local
      setConfiguraciones(prev => ({
        ...prev,
        [clave]: valor
      }));

      return { success: true };
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      return { success: false, error: error.message };
    }
  };

  // Actualizar múltiples configuraciones
  const actualizarMultiples = async (configs) => {
    try {
      // configs es un objeto { clave: valor, ... }
      const updates = Object.entries(configs).map(([clave, valor]) => ({
        clave,
        valor: typeof valor === 'boolean' ? valor.toString() : String(valor),
        updated_at: new Date().toISOString()
      }));

      // Actualizar cada configuración
      for (const update of updates) {
        const { error } = await supabase
          .from('configuraciones')
          .update({ valor: update.valor, updated_at: update.updated_at })
          .eq('clave', update.clave);

        if (error) throw error;
      }

      // Actualizar estado local
      setConfiguraciones(prev => ({
        ...prev,
        ...configs
      }));

      return { success: true };
    } catch (error) {
      console.error('Error actualizando configuraciones:', error);
      return { success: false, error: error.message };
    }
  };

  // Resetear a valores por defecto
  const resetearConfig = async (clave) => {
    const valoresPorDefecto = {
      'negocio_nombre': 'Mi Negocio',
      'negocio_direccion': '',
      'negocio_telefono': '',
      'sistema_moneda': 'MXN',
      'sistema_formato_fecha': 'DD/MM/YYYY',
      'notif_activas': true,
      'notif_stock_bajo': true,
      'notif_recordatorios': true,
      'notif_limite_stock': 10
    };

    const valorPorDefecto = valoresPorDefecto[clave];
    if (valorPorDefecto !== undefined) {
      return await actualizarConfig(clave, valorPorDefecto);
    }

    return { success: false, error: 'Configuración no encontrada' };
  };

  useEffect(() => {
    cargarConfiguraciones();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('configuraciones_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'configuraciones' },
        () => {
          cargarConfiguraciones();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    configuraciones,
    loading,
    obtenerConfig,
    actualizarConfig,
    actualizarMultiples,
    resetearConfig,
    cargarConfiguraciones
  };

  return (
    <ConfiguracionContext.Provider value={value}>
      {children}
    </ConfiguracionContext.Provider>
  );
};