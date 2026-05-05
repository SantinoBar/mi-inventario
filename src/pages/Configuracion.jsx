import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, Building2, User, Settings as SettingsIcon, Bell, Database } from 'lucide-react';
import { Button, Input, Select, Card, Checkbox, Modal } from '../components/common';
import { useConfiguracion } from '../context/ConfiguracionContext';

const Configuracion = () => {
  const { configuraciones, loading, actualizarMultiples } = useConfiguracion();

  // Estados para datos del negocio
  const [datosNegocio, setDatosNegocio] = useState({
    nombre: '',
    direccion: '',
    telefono: ''
  });

  // Estados para configuración del sistema
  const [configSistema, setConfigSistema] = useState({
    moneda: 'MXN',
    formatoFecha: 'DD/MM/YYYY'
  });

  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState({
    notificacionesActivas: true,
    alertasStockBajo: true,
    recordatoriosPendientes: true,
    limiteStockBajo: 10
  });

  // Cargar configuraciones cuando estén disponibles
  useEffect(() => {
    if (!loading && Object.keys(configuraciones).length > 0) {
      setDatosNegocio({
        nombre: configuraciones['negocio_nombre'] || '',
        direccion: configuraciones['negocio_direccion'] || '',
        telefono: configuraciones['negocio_telefono'] || ''
      });

      setConfigSistema({
        moneda: configuraciones['sistema_moneda'] || 'MXN',
        formatoFecha: configuraciones['sistema_formato_fecha'] || 'DD/MM/YYYY'
      });

      setNotificaciones({
        notificacionesActivas: configuraciones['notif_activas'] !== false,
        alertasStockBajo: configuraciones['notif_stock_bajo'] !== false,
        recordatoriosPendientes: configuraciones['notif_recordatorios'] !== false,
        limiteStockBajo: configuraciones['notif_limite_stock'] || 10
      });
    }
  }, [loading, configuraciones]);

  // Estados de modales
  const [modalConfirmarLimpiar, setModalConfirmarLimpiar] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // ========== FUNCIONES ==========

  const guardarDatosNegocio = async () => {
    const result = await actualizarMultiples({
      'negocio_nombre': datosNegocio.nombre,
      'negocio_direccion': datosNegocio.direccion,
      'negocio_telefono': datosNegocio.telefono
    });

    if (result.success) {
      mostrarMensajeExito('Datos del negocio actualizados correctamente');
    } else {
      alert('Error al guardar: ' + result.error);
    }
  };

  const guardarConfigSistema = async () => {
    const result = await actualizarMultiples({
      'sistema_moneda': configSistema.moneda,
      'sistema_formato_fecha': configSistema.formatoFecha
    });

    if (result.success) {
      mostrarMensajeExito('Configuración del sistema actualizada correctamente');
    } else {
      alert('Error al guardar: ' + result.error);
    }
  };

  const guardarNotificaciones = async () => {
    const result = await actualizarMultiples({
      'notif_activas': notificaciones.notificacionesActivas,
      'notif_stock_bajo': notificaciones.alertasStockBajo,
      'notif_recordatorios': notificaciones.recordatoriosPendientes,
      'notif_limite_stock': notificaciones.limiteStockBajo
    });

    if (result.success) {
      mostrarMensajeExito('Configuración de notificaciones actualizada correctamente');
    } else {
      alert('Error al guardar: ' + result.error);
    }
  };

  const exportarDatos = () => {
    console.log('Exportando datos...');
    // Aquí iría la lógica real de exportación
    mostrarMensajeExito('Datos exportados correctamente');
  };

  const importarDatos = () => {
    console.log('Importando datos...');
    // Aquí iría la lógica real de importación
    mostrarMensajeExito('Datos importados correctamente');
  };

  const confirmarLimpiarDatos = () => {
    console.log('Limpiando todos los datos...');
    // Aquí iría la lógica real de limpieza
    setModalConfirmarLimpiar(false);
    mostrarMensajeExito('Todos los datos han sido eliminados');
  };

  const mostrarMensajeExito = (mensaje) => {
    setMensajeExito(mensaje);
    setModalExito(true);
    setTimeout(() => {
      setModalExito(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
        <p className="text-gray-600 mt-1">Administra la configuración de tu negocio</p>
      </div>

      {/* SECCIÓN 1: Datos del Negocio */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Datos del Negocio</h2>
        </div>

        <div className="space-y-4">
          <Input
            label="Nombre del Negocio"
            value={datosNegocio.nombre}
            onChange={(e) => setDatosNegocio({ ...datosNegocio, nombre: e.target.value })}
            required
          />

          <Input
            label="Dirección"
            value={datosNegocio.direccion}
            onChange={(e) => setDatosNegocio({ ...datosNegocio, direccion: e.target.value })}
            required
          />

          <Input
            label="Teléfono"
            type="tel"
            value={datosNegocio.telefono}
            onChange={(e) => setDatosNegocio({ ...datosNegocio, telefono: e.target.value })}
            required
          />

          <div className="flex justify-end pt-2">
            <Button onClick={guardarDatosNegocio} variant="primary" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Card>

      {/* SECCIÓN 2: Configuración del Sistema */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-purple-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Configuración del Sistema</h2>
        </div>

        <div className="space-y-4">
          <Select
            label="Moneda"
            value={configSistema.moneda}
            onChange={(e) => setConfigSistema({ ...configSistema, moneda: e.target.value })}
            options={[
              { value: 'MXN', label: 'Peso Mexicano (MXN)' },
              { value: 'USD', label: 'Dólar Estadounidense (USD)' },
              { value: 'EUR', label: 'Euro (EUR)' }
            ]}
            required
          />

          <Select
            label="Formato de Fecha"
            value={configSistema.formatoFecha}
            onChange={(e) => setConfigSistema({ ...configSistema, formatoFecha: e.target.value })}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' }
            ]}
            required
          />

          <div className="flex justify-end pt-2">
            <Button onClick={guardarConfigSistema} variant="primary" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Card>

      {/* SECCIÓN 4: Notificaciones */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-yellow-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Notificaciones</h2>
        </div>

        <div className="space-y-4">
          <Checkbox
            id="notificacionesActivas"
            label="Activar notificaciones"
            checked={notificaciones.notificacionesActivas}
            onChange={(e) => setNotificaciones({ ...notificaciones, notificacionesActivas: e.target.checked })}
          />

          <Checkbox
            id="alertasStockBajo"
            label="Alertas de stock bajo"
            checked={notificaciones.alertasStockBajo}
            onChange={(e) => setNotificaciones({ ...notificaciones, alertasStockBajo: e.target.checked })}
          />

          {notificaciones.alertasStockBajo && (
            <div className="ml-7">
              <Input
                type="number"
                label="Límite de stock bajo"
                value={notificaciones.limiteStockBajo}
                onChange={(e) => setNotificaciones({ ...notificaciones, limiteStockBajo: parseInt(e.target.value) || 0 })}
                min="0"
                helperText="Se enviará una alerta cuando el stock esté por debajo de este número"
              />
            </div>
          )}

          <Checkbox
            id="recordatoriosPendientes"
            label="Recordatorios de pendientes"
            checked={notificaciones.recordatoriosPendientes}
            onChange={(e) => setNotificaciones({ ...notificaciones, recordatoriosPendientes: e.target.checked })}
          />

          <div className="flex justify-end pt-2">
            <Button onClick={guardarNotificaciones} variant="primary" className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Card>

      {/* SECCIÓN 5: Respaldos y Datos */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Database className="w-5 h-5 text-green-700" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Respaldos y Datos</h2>
        </div>

        <div className="space-y-4">
          {/* Exportar Datos */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Exportar Datos</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Descarga una copia de todos tus datos en formato JSON
                </p>
              </div>
              <Button onClick={exportarDatos} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Importar Datos */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-800">Importar Datos</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Carga datos desde un archivo de respaldo
                </p>
              </div>
              <Button onClick={importarDatos} variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importar
              </Button>
            </div>
          </div>

          {/* Limpiar Datos */}
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-red-800">Limpiar Todos los Datos</h3>
                <p className="text-sm text-red-600 mt-1">
                  Elimina permanentemente todos los datos del sistema
                </p>
              </div>
              <Button 
                onClick={() => setModalConfirmarLimpiar(true)} 
                variant="danger" 
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ========== MODALES ========== */}

      {/* Modal Confirmar Limpiar Datos */}
      <Modal
        isOpen={modalConfirmarLimpiar}
        onClose={() => setModalConfirmarLimpiar(false)}
        title="¡Advertencia!"
        subtitle="Esta acción no se puede deshacer"
        size="small"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ¿Estás seguro de que deseas eliminar <span className="font-semibold">TODOS</span> los datos del sistema?
              <br /><br />
              Esto incluye:
            </p>
            <ul className="text-sm text-red-800 mt-2 list-disc list-inside space-y-1">
              <li>Todas las ventas</li>
              <li>Todos los clientes</li>
              <li>Todo el inventario</li>
              <li>Todos los gastos</li>
              <li>Todo el historial</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setModalConfirmarLimpiar(false)}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarLimpiarDatos}
              variant="danger"
              className="flex-1"
            >
              Sí, Eliminar Todo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Éxito */}
      <Modal
        isOpen={modalExito}
        onClose={() => setModalExito(false)}
        size="small"
        showCloseButton={false}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-semibold text-gray-800">{mensajeExito}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Configuracion;