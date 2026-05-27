// Self-destruct service worker
// Purpose: Unregisters any previously installed SW and clears all caches.
// This ensures the leaderboard always loads fresh data from the server.
// Safe to delete this file entirely once all kiosk devices have loaded it at least once.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
  await self.registration.unregister();
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.navigate(client.url));
});
