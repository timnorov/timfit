const CACHE_NAME = 'timfit-v12';
const ASSETS = [
  './index.html',
  './manifest.json',
  './timer-worker.js',
  './css/main.css',
  './js/utils.js',
  './js/i18n.js',
  './js/program.js',
  './js/data.js',
  './js/auth.js',
  './js/router.js',
  './js/notifications.js',
  './js/workout.js',
  './js/progress.js',
  './js/photos.js',
  './js/cardio.js',
  './js/settings.js',
  './js/library.js',
  './js/app.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Navigation (HTML pages): always network-first so new deployments are
  // picked up immediately and the SW can never get stuck serving stale HTML.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else: cache-first, fall back to network.
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => null);
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./index.html'));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body, tag } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        icon: './assets/icons/icon-192.png',
        badge: './assets/icons/icon-192.png',
        vibrate: [200, 100, 200]
      });
    }, delay);
  }
  if (e.data && e.data.type === 'CANCEL_NOTIFICATION') {
    self.registration.getNotifications({ tag: e.data.tag }).then(ns => {
      ns.forEach(n => n.close());
    });
  }
});
