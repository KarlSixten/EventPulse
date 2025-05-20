import { writable, get } from 'svelte/store';
import { io } from 'socket.io-client';
import { userStore } from './userStore.js';
import { BASE_URL } from './generalStore.js';
import toastr from 'toastr';

let socket = null;

let newNotificationListener = null;

export const notifications = writable([]);
export const hasUnreadNotifications = writable(false);
export const isSocketConnected = writable(false);

userStore.subscribe(currentUser => {
  initializeSocket();
});

function initializeSocket() {
  const serverUrlValue = get(BASE_URL);
  const currentUser = get(userStore);

  if (currentUser && serverUrlValue) {
    if (!socket || socket.disconnected) {

      if (socket) {
        if (newNotificationListener) {
          socket.off('new_notification', newNotificationListener);
        }
        socket.disconnect();
      }

      socket = io(serverUrlValue, {
        withCredentials: true,
      });
      setupSocketListeners(socket);

    } else {
      setupSocketListeners(socket);
    }
  } else {
    if (socket) {
      if (newNotificationListener) {
        socket.off('new_notification', newNotificationListener);
        newNotificationListener = null;
      }
      socket.disconnect();
      socket = null;
      isSocketConnected.set(false);
      notifications.set([]);
      hasUnreadNotifications.set(false);
    }
  }
}

function setupSocketListeners(currentSocket) {
  currentSocket.on('connect', () => {
    isSocketConnected.set(true);
  });

  currentSocket.on('disconnect', (reason) => {
    isSocketConnected.set(false);
  });

  currentSocket.on('connect_error', (error) => {
    isSocketConnected.set(false);
  });

  if (newNotificationListener) {
    currentSocket.off('new_notification', newNotificationListener);
  }

  newNotificationListener = (notification) => {
    console.log(`NotificationStore: Received new_notification on socket ID ${currentSocket?.id}:`, notification);
    notifications.update(currentNotifications => {
      const updatedNotifications = [notification, ...currentNotifications].slice(0, 20);
      return updatedNotifications;
    });
    hasUnreadNotifications.set(true);
    toastr.info(notification.message || 'You have a new notification!');
  };

  currentSocket.on('new_notification', newNotificationListener);
}



export function markNotificationsAsRead() {
  hasUnreadNotifications.set(false);
  // Might also want to update the notifications themselves
  // notifications.update(all => all.map(n => ({ ...n, read: true })));
}

export function clearNotifications() {
  notifications.set([]);
  hasUnreadNotifications.set(false);
}