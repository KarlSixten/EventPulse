import { writable, get } from 'svelte/store';
import { io } from 'socket.io-client';
import { userStore } from './userStore.js';
import { BASE_URL } from './generalStore.js';
import { fetchGet, fetchPut } from '../util/fetch.js';
import toastr from 'toastr';

let socket = null;

let newNotificationListener = null;

export const notifications = writable([]);
export const hasUnreadNotifications = writable(false);
export const isSocketConnected = writable(false);

userStore.subscribe(currentUser => {
  initializeSocket();
  if (currentUser) {
    fetchAndLoadNotifications();
  } else {
    notifications.set([]);
    hasUnreadNotifications.set(false);
  }
});

async function fetchAndLoadNotifications() {
  const serverUrlValue = get(BASE_URL);
  const result = await fetchGet(serverUrlValue + '/api/notifications');
  if (result && result.data) {
    notifications.set(result.data);
    if (result.data.length > 0) {
      hasUnreadNotifications.set(true);
    }
  }
}

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
    const newNotification = {
      message: notification.message,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    notifications.update(currentNotifications => [newNotification, ...currentNotifications]);
    hasUnreadNotifications.set(true);
    toastr.info(notification.message || 'You have a new notification!');
  }
}

export async function markNotificationRead(notificationId) {
    const serverUrlValue = get(BASE_URL);

    const result = await fetchPut(`${serverUrlValue}/api/notifications/${notificationId}/mark-read`, {});
    if (result.ok) {
        notifications.update(currentNotifications =>
            currentNotifications.filter(notification => notification.id !== notificationId)
        );
    } else {
        toastr.error('Could not mark notification as read. Please try again.');
    }
}

export async function dismissAllNotifications() {
  const serverUrlValue = get(BASE_URL);
  const currentNotifications = get(notifications);

  if (currentNotifications.length > 0) {
    const result = await fetchPut(`${serverUrlValue}/api/notifications/read-all`);
    if (result.ok) {
      notifications.set([]);
      hasUnreadNotifications.set(false);
    } else {
      toastr.error('Could not clear notifications. Please try again.');
    }
  }
}