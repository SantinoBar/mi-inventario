import React, { createContext, useContext, useState, useEffect } from 'react';
import PrinterService from '../services/PrinterService';

const PrinterContext = createContext();

export const usePrinter = () => {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error('usePrinter debe usarse dentro de PrinterProvider');
  }
  return context;
};

export const PrinterProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  // Verificar estado de la impresora periódicamente
  useEffect(() => {
    // Verificación inicial
    const checkStatus = () => {
      const connected = PrinterService.isDeviceConnected();
      setIsConnected(connected);
      
      if (connected && PrinterService.device) {
        setDeviceName(PrinterService.device.name || 'Impresora');
      } else {
        setDeviceName('');
      }
    };

    checkStatus();

    // Configurar callback de desconexión
    PrinterService.setOnDisconnectCallback(() => {
      console.log('Impresora desconectada - actualizando contexto global');
      setIsConnected(false);
      setDeviceName('');
    });

    // Verificar estado cada 3 segundos
    const interval = setInterval(() => {
      checkStatus();
    }, 3000);

    return () => {
      clearInterval(interval);
      PrinterService.setOnDisconnectCallback(null);
    };
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    try {
      // Si hay un dispositivo guardado, intentar reconectar
      if (PrinterService.device && !PrinterService.isDeviceConnected()) {
        console.log('Intentando reconectar a dispositivo guardado...');
        try {
          await PrinterService.reconnect();
          setIsConnected(true);
          setDeviceName(PrinterService.device.name || 'Impresora');
          console.log('Reconectado exitosamente');
          return { success: true, reconnected: true };
        } catch (reconnectError) {
          console.log('Reconexión falló, solicitando nuevo dispositivo...');
        }
      }

      // Conectar nuevo dispositivo
      await PrinterService.connect();
      setIsConnected(true);
      setDeviceName(PrinterService.device.name || 'Impresora');
      return { success: true, reconnected: false };
    } catch (error) {
      console.error('Error conectando impresora:', error);
      setIsConnected(false);
      setDeviceName('');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    PrinterService.disconnect();
    setIsConnected(false);
    setDeviceName('');
  };

  // Verificar y reconectar automáticamente si es necesario
  const ensureConnected = async () => {
    // Si ya está conectada, no hacer nada
    if (PrinterService.isDeviceConnected()) {
      return true;
    }

    // Si hay dispositivo guardado pero no conectado, intentar reconectar
    if (PrinterService.device) {
      try {
        console.log('Auto-reconectando impresora...');
        await PrinterService.reconnect();
        setIsConnected(true);
        setDeviceName(PrinterService.device.name || 'Impresora');
        return true;
      } catch (error) {
        console.error('Auto-reconexión falló:', error);
        setIsConnected(false);
        return false;
      }
    }

    return false;
  };

  const value = {
    isConnected,
    isConnecting,
    deviceName,
    connect,
    disconnect,
    ensureConnected,
    printerService: PrinterService
  };

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
};