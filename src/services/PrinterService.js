// src/services/PrinterService.js
class PrinterService {
  constructor() {
    this.device = null;
    this.isConnected = false;
    this.characteristic = null;
  }

  // Conectar a impresora Bluetooth
  async connect() {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth no soportado en este navegador');
      }

      console.log('Buscando impresora Bluetooth...');
      
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Servicio de impresión común (POS)
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Servicio alternativo 1
          '00001101-0000-1000-8000-00805f9b34fb'  // UUID Típico de SPP (Serial Port Profile)
        ]
      });

      console.log('Dispositivo encontrado:', this.device.name);

      // Escuchar evento de desconexión
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      this.server = await this.device.gatt.connect();
      console.log('Conectado al servidor GATT');

      // Buscar servicio de impresión
      try {
        this.service = await this.server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
        console.log('Servicio de impresión estándar encontrado.');
      } catch (error) {
        console.warn('Servicio POS estándar (18F0) no encontrado. Intentando UUID alternativo (SPP):');
        const alternativeUUID = '00001101-0000-1000-8000-00805f9b34fb';
        this.service = await this.server.getPrimaryService(alternativeUUID);
      }

      // Obtener característica de escritura
      const characteristics = await this.service.getCharacteristics();
      this.characteristic = characteristics.find(c => c.properties.write);

      if (!this.characteristic) {
        throw new Error("No se encontró una característica de escritura válida en el servicio.");
      }
      
      this.isConnected = true;
      console.log('Impresora conectada exitosamente');
      return true;

    } catch (error) {
      console.error('Error conectando impresora:', error);
      this.isConnected = false;
      this.disconnect();
      throw error;
    }
  }

  // Callback cuando se desconecta el dispositivo
  onDisconnected(event) {
    console.log('Impresora desconectada:', event);
    this.isConnected = false;
    this.characteristic = null;
    // Notificar a quien esté escuchando
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback();
    }
  }

  // Establecer callback de desconexión
  setOnDisconnectCallback(callback) {
    this.onDisconnectCallback = callback;
  }

  // Desconectar impresora
  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.characteristic = null;
    console.log('Impresora desconectada');
  }

  // Enviar comando ESC/POS a la impresora
  async sendCommand(command) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Impresora no conectada');
    }

    try {
      // Dividir comando en chunks de máximo 20 bytes (límite Bluetooth LE)
      const chunkSize = 20;
      for (let i = 0; i < command.length; i += chunkSize) {
        const chunk = command.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error('Error enviando comando:', error);
      throw error;
    }
  }

  // Imprimir texto
  async printText(text, options = {}) {
    const { align = 'left', fontSize = 'normal', bold = false } = options;
    
    let command = new Uint8Array(0);

    // Alineación
    if (align === 'center') {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x61, 0x01]));
    } else if (align === 'right') {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x61, 0x02]));
    } else {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x61, 0x00]));
    }

    // Tamaño de fuente
    if (fontSize === 'large') {
      command = this.concatArrays(command, new Uint8Array([0x1D, 0x21, 0x11]));
    } else if (fontSize === 'small') {
      command = this.concatArrays(command, new Uint8Array([0x1D, 0x21, 0x00]));
    }

    // Negrita
    if (bold) {
      command = this.concatArrays(command, new Uint8Array([0x1B, 0x45, 0x01]));
    }

    // Texto
    const textBytes = new TextEncoder().encode(text);
    command = this.concatArrays(command, textBytes);

    // Resetear formato
    command = this.concatArrays(command, new Uint8Array([0x1B, 0x45, 0x00]));
    command = this.concatArrays(command, new Uint8Array([0x1D, 0x21, 0x00]));

    await this.sendCommand(command);
  }

  // Imprimir línea separadora
  async printSeparator() {
    await this.printText('--------------------------------', { align: 'center' });
    await this.printNewLine();
  }

  // Nueva línea
  async printNewLine(lines = 1) {
    const command = new Uint8Array(lines).fill(0x0A);
    await this.sendCommand(command);
  }

  // Cortar papel
  async cutPaper() {
    const command = new Uint8Array([0x1D, 0x56, 0x00]);
    await this.sendCommand(command);
  }

  // Abrir cajón (si está conectado)
  async openDrawer() {
    const command = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
    await this.sendCommand(command);
  }

  // Utilitario para concatenar arrays
  concatArrays(a, b) {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  }

  // Imprimir ticket de venta
  async printTicket(venta, datosNegocio) {
    try {
      // Encabezado con datos del negocio
      await this.printText(datosNegocio.nombre || 'MI NEGOCIO', { 
        align: 'center', 
        fontSize: 'large', 
        bold: true 
      });
      await this.printNewLine();
      
      if (datosNegocio.direccion) {
        await this.printText(datosNegocio.direccion, { align: 'center' });
      }
      if (datosNegocio.telefono) {
        await this.printText(`\n`);
        await this.printText(`Tel: ${datosNegocio.telefono}`, { align: 'center' });
      }
      
      await this.printNewLine();
      await this.printSeparator();

      // Información del ticket
      await this.printText(`TICKET #${venta.id}`, { align: 'center', bold: true });
      await this.printText(`\n`);
      await this.printText(`Fecha: ${new Date(venta.created_at).toLocaleString('es-MX')}`, { align: 'left' });
      await this.printText(`\n`);
      await this.printText(`Cliente: ${venta.cliente_nombre}`, { align: 'left' });
      
      if (venta.cliente_telefono) {
        await this.printText(`\n`);
        await this.printText(`Tel: ${venta.cliente_telefono}`, { align: 'left' });
      }
      
      if (venta.a_domicilio && venta.cliente_direccion) {
        await this.printText(`\n`);
        await this.printText(`Direccion: ${venta.cliente_direccion}`, { align: 'left' });
      }
      
      await this.printNewLine();
      await this.printSeparator();

      // Items
      await this.printText('DETALLE:', { bold: true });
      await this.printNewLine();

      for (const item of venta.items) {
        const itemText = `${item.nombre_item}`;
        
        await this.printText(`\n`);
        await this.printText(itemText);
        
        const cantidadText = `${item.cantidad}x`;
        const precioText = `$${parseFloat(item.precio_unitario).toFixed(1)}`;
        const totalText = `$${parseFloat(item.subtotal).toFixed(1)}`;
        
        await this.printText(`  ${cantidadText} ${precioText} = ${totalText}`, { align: 'right' });
      }

      await this.printNewLine();
      await this.printSeparator();

      // Totales
      await this.printText(`TOTAL: $${parseFloat(venta.total).toFixed(2)}`, { 
        align: 'right', 
        bold: true, 
        fontSize: 'large' 
      });

      // Estado de pago
      await this.printNewLine();
      await this.printText(`Estado: ${venta.estado}`, { align: 'left' });
      await this.printText(`\n`);
      await this.printText(`Pago: ${venta.estado_pago}`, { align: 'left' });
      
      if (venta.estado_pago === 'Pagado parcialmente') {
        const pagado = parseFloat(venta.cantidad_pagada);
        const falta = parseFloat(venta.total) - pagado;
        await this.printText(`\n`);
        await this.printText(`Pagado: $${pagado.toFixed(2)}`, { align: 'left' });
        await this.printText(`\n`);
        await this.printText(`Falta: $${falta.toFixed(2)}`, { align: 'left' });
      }

      // Fechas importantes
      await this.printNewLine();
      await this.printSeparator();
      await this.printText(`Entrega: ${new Date(venta.fecha_entrega).toLocaleDateString('es-MX')}`, { align: 'left' });
      await this.printText(`\n`);
      await this.printText(`Recoleccion: ${new Date(venta.fecha_recoleccion).toLocaleDateString('es-MX')}`, { align: 'left' });

      // Notas
      if (venta.notas) {
        await this.printNewLine();
        await this.printSeparator();
        await this.printText('NOTAS:', { bold: true });
        await this.printText(venta.notas, { align: 'left' });
      }

      await this.printNewLine();
      await this.printSeparator();
      await this.printText('Gracias por su preferencia!', { align: 'center' });
      await this.printNewLine(3);

      // Cortar papel
      await this.cutPaper();

      console.log('Ticket impreso exitosamente');
      return true;

    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      throw error;
    }
  }

  // Verificar estado de conexión
  isDeviceConnected() {
    // Verificar tanto el estado interno como el estado real del dispositivo
    const deviceConnected = this.device && this.device.gatt && this.device.gatt.connected;
    
    // Sincronizar estado interno con estado real
    if (!deviceConnected && this.isConnected) {
      console.log('Sincronizando estado: dispositivo desconectado');
      this.isConnected = false;
      this.characteristic = null;
    }
    
    return deviceConnected && this.isConnected;
  }

  // Intentar reconectar al dispositivo guardado
  async reconnect() {
    if (!this.device) {
      throw new Error('No hay dispositivo guardado para reconectar');
    }

    try {
      console.log('Intentando reconectar a:', this.device.name);
      
      this.server = await this.device.gatt.connect();
      console.log('Reconectado al servidor GATT');

      // Buscar servicio de impresión
      try {
        this.service = await this.server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      } catch (error) {
        const alternativeUUID = '00001101-0000-1000-8000-00805f9b34fb';
        this.service = await this.server.getPrimaryService(alternativeUUID);
      }

      // Obtener característica de escritura
      const characteristics = await this.service.getCharacteristics();
      this.characteristic = characteristics.find(c => c.properties.write);

      if (!this.characteristic) {
        throw new Error("No se encontró característica de escritura");
      }
      
      this.isConnected = true;
      console.log('Reconexión exitosa');
      return true;

    } catch (error) {
      console.error('Error reconectando:', error);
      this.isConnected = false;
      throw error;
    }
  }
}

export default new PrinterService();