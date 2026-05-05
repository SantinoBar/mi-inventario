import React from 'react';
import { User, Search, LogOut } from 'lucide-react';
import BotonNotificaciones from '../BotonNotificaciones';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-30">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo y Nombre */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BP</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
            Business Pro
          </h1>
        </div>

        {/* Buscador (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Notificaciones y Perfil */}
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <BotonNotificaciones />

          {/* Perfil / Logout */}
          <button 
            onClick={logout}
            title="Cerrar Sesión"
            className="flex items-center gap-2 p-2 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-medium">
              Salir
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;