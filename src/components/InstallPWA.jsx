import React, { useEffect, useState } from 'react';
// Reutilizamos tus componentes UI existentes
import Button from './common/Button'; 

const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      // Prevenir que el mini-infobar aparezca en móviles automáticamente
      e.preventDefault();
      // Guardar el evento para dispararlo después
      setPromptInstall(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = (e) => {
    e.preventDefault();
    if (!promptInstall) {
      return;
    }
    // Mostrar el prompt de instalación nativo
    promptInstall.prompt();
    
    // Esperar a que el usuario responda
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario aceptó instalar la app');
      } else {
        console.log('El usuario rechazó instalar la app');
      }
      // Limpiar el prompt guardado
      setPromptInstall(null);
      setSupportsPWA(false);
    });
  };

  if (!supportsPWA) {
    return null; // No mostrar nada si ya está instalada o no es compatible
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleInstallClick}
        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Instalar App
      </Button>
    </div>
  );
};

export default InstallPWA;