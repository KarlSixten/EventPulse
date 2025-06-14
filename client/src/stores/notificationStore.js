import { writable, get } from 'svelte/store';
import { io } from 'socket.io-client';
import { userStore } from './userStore.js';
import { BASE_URL } from './generalStore.js';
import { apiFetch } from '../util/fetch.js';
import toastr from 'toastr';

export const notifications = writable([]);
export const hasUnreadNotifications = writable(false);
export const isSocketConnected = writable(false);

function updateUnreadStatus() {
  const unreadCount = get(notifications).filter((n) => !n.isRead).length;
  hasUnreadNotifications.set(unreadCount > 0);
}

async function fetchAndLoadNotifications() {
  const serverUrl = get(BASE_URL);
  
  const { result, error, ok } = await apiFetch(`${serverUrl}/api/notifications`);

  if (ok) {
    notifications.set(result.data); 
    updateUnreadStatus();
  } else {
    toastr.error("Could not load notifications.");
    console.error("Failed to fetch notifications:", error);
  }
}

const socket = io(get(BASE_URL), {
  autoConnect: false,
  withCredentials: true,
});

socket.on('connect', () => {
  isSocketConnected.set(true);
});

socket.on('disconnect', () => {
  isSocketConnected.set(false);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  isSocketConnected.set(false);
});

socket.on('new_notification', (notification) => {
  console.log(notification);
  
  notifications.update((currentNotifications) => [
    notification,
    ...currentNotifications,
  ]);
  updateUnreadStatus();
  toastr.info(notification.message || 'You have a new notification!');
});

userStore.subscribe((currentUser) => {
  if (currentUser && !socket.connected) {
    socket.connect();
    fetchAndLoadNotifications();
  } else if (!currentUser && socket.connected) {
    socket.disconnect();
    notifications.set([]);
    hasUnreadNotifications.set(false);
  }
});


export async function markNotificationRead(notificationId) {
    const serverUrl = get(BASE_URL);
    const notification = get(notifications).find((n) => n.id === notificationId);

    if (!notification || notification.isRead) {
        return;
    }
    
    const { ok, error } = await apiFetch(
        `${serverUrl}/api/notifications/${notificationId}/mark-read`, 
        { method: "PUT" }
    );

    if (ok) {
        notifications.update((current) =>
            current.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
        );
        updateUnreadStatus();
    } else {
        toastr.error(error?.message || 'Could not mark notification as read.');
        console.error("Failed to mark notification as read:", error);
    }
}

export async function dismissAllNotifications() {
    const serverUrl = get(BASE_URL);
    const unreadExists = get(notifications).some((n) => !n.isRead);

    if (unreadExists) {
        const { ok, error } = await apiFetch(
            `${serverUrl}/api/notifications/read-all`, 
            { method: "PUT" }
        );

        if (ok) {
            notifications.update((all) => all.map((n) => ({ ...n, isRead: true })));
            hasUnreadNotifications.set(false);
        } else {
            toastr.error(error?.message || 'Could not clear notifications.');
            console.error("Failed to clear notifications:", error);
        }
    }
}