// REMINDER - PWA Companion Notification & Action Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const data = event.notification.data || {};
  const reminderId = data.reminderId;

  if (action === 'complete' && reminderId) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: 'REMINDER_COMPLETE', reminderId });
        }
      })
    );
  } else if (action === 'snooze' && reminderId) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({ type: 'REMINDER_SNOOZE', reminderId, minutes: 15 });
        }
      })
    );
  } else {
    // Body click: bring app to foreground
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/reminders');
        }
      })
    );
  }
});

