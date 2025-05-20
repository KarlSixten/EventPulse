import { writable, get } from 'svelte/store';
import { io } from 'socket.io-client';
import { userStore } from './userStore.js';
import { BASE_URL } from './generalStore.js';
import toastr from 'toastr';

let socket = null;

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
      console.log('NotificationStore: User logged in, attempting to connect WebSocket to:', serverUrlValue);
      socket = io(serverUrlValue, {
        withCredentials: true,
      });

      socket.on('connect', () => {
        console.log('NotificationStore: Successfully connected to WebSocket server. Socket ID:', socket.id);
        isSocketConnected.set(true);
      });

      socket.on('disconnect', (reason) => {
        console.log('NotificationStore: Disconnected from WebSocket server:', reason);
        isSocketConnected.set(false);
      });

      socket.on('connect_error', (error) => {
        console.error('NotificationStore: WebSocket connection error:', error);
        isSocketConnected.set(false);
      });

      socket.on('new_notification', (notification) => {
        console.log('NotificationStore: Received new_notification:', notification);
        notifications.update(currentNotifications => {
          const updatedNotifications = [notification, ...currentNotifications].slice(0, 20);
          return updatedNotifications;
        });
        hasUnreadNotifications.set(true);

        toastr.info(notification.message || 'You have a new notification!');
      });

    }
  } else {
    if (socket) {
      console.log('NotificationStore: User logged out or not authenticated, disconnecting WebSocket.');
      socket.disconnect();
      socket = null;
      isSocketConnected.set(false);
      notifications.set([]);
      hasUnreadNotifications.set(false);
    }
  }
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