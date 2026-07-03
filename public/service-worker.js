const CACHE_NAME = "gita-profile-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./about.html",
  "./article.html",
  "./contact.html",
  "./css/style.css",
  "./js/script.js",
  "./images/fotogita.jpeg",
  "./manifest.json",
  "./images/icon-profile1.png",
  "./images/icon-profile2.png",
  "./login.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Listener untuk menerima Web Push Notification
self.addEventListener("push", (event) => {
  let data = { title: "Pemberitahuan", body: "Ada pesan baru untuk Anda!" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Pemberitahuan", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "images/icon-profile1.png",
    badge: "images/icon-profile1.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "./index.html"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listener ketika notifikasi diklik oleh user
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Cari tab yang sudah terbuka yang mencocokkan url notifikasi
      for (const client of clientList) {
        if (client.url.includes(event.notification.data.url) && "focus" in client) {
          return client.focus();
        }
      }
      // Jika tidak ada tab terbuka, buka yang baru
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});