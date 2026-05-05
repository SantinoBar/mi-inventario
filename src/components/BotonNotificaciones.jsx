import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificaciones } from '../context/NotificacionesContext';

const BotonNotificaciones = () => {
  const { conteoNoLeidas, setMostrarPanel } = useNotificaciones();

  return (
    <button
      onClick={() => setMostrarPanel(true)}
      className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
      title="Notificaciones"
    >
      <Bell className="w-6 h-6" />
      
      {/* Badge de conteo */}
      {conteoNoLeidas > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
          {conteoNoLeidas > 99 ? '99+' : conteoNoLeidas}
        </span>
      )}
    </button>
  );
};

export default BotonNotificaciones;