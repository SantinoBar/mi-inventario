/* eslint-disable no-restricted-globals */

// src/service-worker.js

// Este servicio worker puede ser personalizado.
// Mira https://developers.google.com/web/tools/workbox/modules
// para la lista de módulos disponibles.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

// Precachear todos los assets generados por tu proceso de build.
// Sus URLs son inyectadas en la variable self.__WB_MANIFEST.
precacheAndRoute(self.__WB_MANIFEST);

// Configurar ruteo estilo App Shell, para que todas las navegaciones
// se satisfagan con el index.html
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Retorna false para saltar peticiones que no sean de navegación.
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    } 
    if (url.pathname.startsWith('/_')) {
      return false;
    } 
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } 
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Ejemplo de una regla de caché para imágenes en tiempo de ejecución (runtime caching)
// Esto cachea imágenes png/jpg/svg de otros dominios (o locales no pre-cacheados)
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'), 
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Esto permite a la web app activar el nuevo service worker saltándose la espera
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});