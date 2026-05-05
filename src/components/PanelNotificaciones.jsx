import React from 'react';
import { X, Check } from 'lucide-react';
import { useNotificaciones } from '../context/NotificacionesContext';
import { useNavigate } from 'react-router-dom';

const PanelNotificaciones = () => {
  const { 
    notificaciones, 
    notificacionesNoLeidas,
    mostrarPanel, 
    setMostrarPanel,
    marcarComoLeida,
    marcarTodasComoLeidas,
    limpiarNotificacion
  } = useNotificaciones();

  const navigate = useNavigate();

  if (!mostrarPanel) return null;

  const handleAccion = (notif) => {
    marcarComoLeida(notif.id);
    setMostrarPanel(false);
    if (notif.accion?.link) {
      navigate(notif.accion.link);
    }
  };

  const handleCerrar = (e, notifId) => {
    e.stopPropagation();
    limpiarNotificacion(notifId);
  };

  const getColorClasses = (color, prioridad) => {
    const base = {
      red: 'bg-red-50 border-red-200',
      orange: 'bg-orange-50 border-orange-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200'
    };

    const badge = {
      red: 'bg-red-100 text-red-700',
      orange: 'bg-orange-100 text-orange-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700'
    };

    return {
      card: base[color] || 'bg-gray-50 border-gray-200',
      badge: badge[color] || 'bg-gray-100 text-gray-700'
    };
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diffMs = ahora - notifFecha;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return notifFecha.toLocaleDateString('es-MX');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => setMostrarPanel(false)}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-primary-700 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            {notificacionesNoLeidas.length > 0 && (
              <p className="text-sm text-primary-100">
                {notificacionesNoLeidas.length} sin leer
              </p>
            )}
          </div>
          <button
            onClick={() => setMostrarPanel(false)}
            className="p-2 hover:bg-primary-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Acciones */}
        {notificaciones.length > 0 && (
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <button
              onClick={marcarTodasComoLeidas}
              className="text-sm text-primary-700 hover:text-primary-800 font-medium flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Marcar todas como leídas
            </button>
          </div>
        )}

        {/* Lista de notificaciones */}
        <div className="flex-1 overflow-y-auto">
          {notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-lg font-medium text-gray-600">No hay notificaciones</p>
              <p className="text-sm text-gray-500 mt-1">Todo está al día</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notificaciones.map((notif) => {
                const colors = getColorClasses(notif.color, notif.prioridad);
                const esNoLeida = notificacionesNoLeidas.some(n => n.id === notif.id);

                return (
                  <div
                    key={notif.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      esNoLeida ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleAccion(notif)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono */}
                      <div className="text-2xl flex-shrink-0">
                        {notif.icono}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800 text-sm">
                                {notif.titulo}
                              </h3>
                              {esNoLeida && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notif.mensaje}
                            </p>
                          </div>

                          {/* Botón cerrar */}
                          <button
                            onClick={(e) => handleCerrar(e, notif.id)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatearFecha(notif.fecha)}
                          </span>
                          
                          {/* Badge de prioridad */}
                          {notif.prioridad === 'alta' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                              Urgente
                            </span>
                          )}
                        </div>

                        {/* Botón de acción */}
                        {notif.accion && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccion(notif);
                            }}
                            className="mt-2 text-xs text-primary-700 hover:text-primary-800 font-medium"
                          >
                            {notif.accion.texto} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PanelNotificaciones;