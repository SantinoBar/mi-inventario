const WhatsAppService = {
  enviarTicketWhatsApp: (venta, items, negocioConfig) => {
    if (!venta.cliente_telefono) {
      alert('El cliente no tiene un número de teléfono registrado.');
      return;
    }

    // Limpiar número (solo mantener números)
    const numero = venta.cliente_telefono.replace(/\D/g, '');
    
    // Si el número es de 10 dígitos (típico en México/Latam), añadir el código de país de México (52) por defecto.
    // Esto es muy útil porque wa.me requiere el código de país.
    const numeroFinal = numero.length === 10 ? `52${numero}` : numero;

    const nombreNegocio = negocioConfig?.nombre || 'Mi Negocio';

    let mensaje = `*TICKET DE VENTA #${venta.id}*\n`;
    mensaje += `*${nombreNegocio}*\n\n`;
    
    mensaje += `*Cliente:* ${venta.cliente_nombre || 'Público en General'}\n`;
    // Usa created_at o la fecha actual si apenas se está creando
    const fecha = venta.created_at ? new Date(venta.created_at) : new Date();
    mensaje += `*Fecha:* ${fecha.toLocaleDateString('es-MX')} a las ${fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}\n`;
    mensaje += `*Estado:* ${venta.estado}\n\n`;

    mensaje += `*Detalle:*\n`;
    items.forEach(item => {
      // Manejar posibles diferencias entre la estructura de items de Historial y Ventas
      const nombre = item.nombre_item || item.nombre;
      const subtotal = item.subtotal || (item.cantidad * item.precio_unitario);
      mensaje += `${item.cantidad}x ${nombre} - $${subtotal.toFixed(2)}\n`;
    });
    
    mensaje += `------------------------\n`;
    mensaje += `*Total: $${Number(venta.total).toFixed(2)}*\n`;
    
    if (venta.estado_pago === 'Pagado parcialmente') {
      mensaje += `*Pagado:* $${Number(venta.cantidad_pagada).toFixed(2)}\n`;
      const falta = Number(venta.total) - Number(venta.cantidad_pagada);
      mensaje += `*Falta:* $${falta.toFixed(2)}\n`;
    } else {
      mensaje += `*Pago:* ${venta.estado_pago}\n`;
    }

    mensaje += `\n¡Gracias por su preferencia!`;

    const url = `https://wa.me/${numeroFinal}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }
};

export default WhatsAppService;
