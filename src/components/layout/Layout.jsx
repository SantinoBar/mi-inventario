import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import PanelNotificaciones from '../PanelNotificaciones';
import InstallPWA from '../InstallPWA';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Sidebar (Desktop) */}
      <Sidebar />

      {/* Main Content */}
      <main className="pt-16 md:pl-16 pb-16 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Panel de Notificaciones */}
      <PanelNotificaciones />
      <InstallPWA />
    </div>
  );
};

export default Layout;