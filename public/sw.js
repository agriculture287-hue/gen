// Monetag Ad Network Active Service Worker
importScripts('https://quge5.com/88/tag.min.js');
importScripts('https://nap5k.com/tag.min.js');

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
