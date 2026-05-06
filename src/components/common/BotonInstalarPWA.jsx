import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const BotonInstalarPWA = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <button
      onClick={promptInstall}
      type="button"
      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all mt-6"
    >
      <Download className="w-5 h-5 mr-2 animate-bounce" />
      Instalar App en el Dispositivo
    </button>
  );
};

export default BotonInstalarPWA;
