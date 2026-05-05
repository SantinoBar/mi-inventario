import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  History,
  Settings,
  Receipt
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Ventas', path: '/ventas' },
    { icon: Package, label: 'Inventario', path: '/inventario' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: FileText, label: 'Reportes', path: '/reportes' },
    { icon: Receipt, label: 'Gastos', path: '/gastos' },
    { icon: History, label: 'Historial', path: '/historial' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 z-20 transition-all duration-300 hidden md:block ${
        isHovered ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav className="p-2 flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-primary-700 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0 w-0'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;