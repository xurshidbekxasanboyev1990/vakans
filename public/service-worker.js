const CACHE_NAME = 'vakans-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip HMR and dev server requests
  if (request.url.includes('?t=') || 
      request.url.includes('/@') || 
      request.url.includes('/node_modules/') ||
      request.url.includes('hot-update') ||
      request.url.includes('.map')) {
    return fetch(request)
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone).catch(() => {
              // Ignore cache errors in development
            })
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || new Response('Offline', { status: 503 })
        })
      })
  )
})

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-applications') {
    event.waitUntil(syncApplications())
  }
})

async function syncApplications() {
  // Retrieve pending applications from IndexedDB and sync
  // This would be implemented based on your offline storage strategy
  console.log('Syncing offline applications...')
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Vakans.uz'
  const options = {
    body: data.body || 'Yangi xabar mavjud',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url)
      }
    })
  )
})
