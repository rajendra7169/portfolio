// The previous version of this site installed an offline cache from this
// address. Browsers that still have it check here for updates and get this:
// it deletes everything that cache kept and removes itself, so returning
// visitors load the new site.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) await caches.delete(key);
      await self.registration.unregister();
      for (const client of await self.clients.matchAll({ type: "window" })) client.navigate(client.url);
    })(),
  );
});
