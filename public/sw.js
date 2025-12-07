// Versi cache, ganti kalau update file
const CACHE_NAME = "kaspos-cache-v4";

// Halaman utama + asset statis yang PASTI ada
const urlsToCache = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/logo.svg",
  "/NoImage.png"
  // Hapus asset dinamis (/css/app.css, /js/app.js) karena di-handle Vite
  // Hapus route dinamis (/pos, /kitchen) karena butuh auth dan rentan gagal cache
];

// Install service worker & cache asset
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Paksa aktifkan SW baru segera
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch: ambil dari cache dulu, kalau tidak ada baru fetch server
self.addEventListener("fetch", (event) => {
  // Skip request selain GET (POST, PUT, dll tidak boleh di-cache)
  if (event.request.method !== 'GET') return;

  // Skip request chrome-extension atau scheme lain
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Kalau ada di cache → kembalikan dari cache
      if (response) {
        return response;
      }
      
      // Kalau tidak ada → fetch ke server
      return fetch(event.request).then((response) => {
        // Cek apakah response valid
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone response untuk disimpan di cache (Runtime Caching)
        // Hanya cache asset statis, jangan cache halaman HTML dinamis secara agresif
        const responseToCache = response.clone();
        
        // Opsional: Bisa tambahkan logic filter file apa yang mau di-cache saat runtime
        
        return response;
      }).catch(() => {
        // Kalau request gagal (offline) → fallback ke halaman utama
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});

// Aktivasi service worker baru & hapus cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Ambil kontrol semua client segera
});
