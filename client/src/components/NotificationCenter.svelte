<script>
    import { userStore } from "../stores/userStore.js";
    import {
        notifications,
        dismissAllNotifications,
        markNotificationRead,
    } from "../stores/notificationStore.js";
    import { formatDate } from "../util/format.js";
    import { onMount, onDestroy } from "svelte";
    import { navigate } from "svelte-routing";

    let showDropdown = false;

    $: unreadCount = $notifications.filter((n) => !n.isRead).length;

    function toggleDropdown() {
        showDropdown = !showDropdown;
    }

    function handleClickOutside(event) {
        if (
            showDropdown &&
            !event.target.closest(".notification-center-wrapper")
        ) {
            showDropdown = false;
        }
    }

    onMount(() => {
        window.addEventListener("click", handleClickOutside);
    });

    onDestroy(() => {
        window.removeEventListener("click", handleClickOutside);
    });

    function handleClearNotifications() {
        dismissAllNotifications();
        showDropdown = false;
    }

    function handleNotificationClick(notification) {
        markNotificationRead(notification.id);
        navigate(`/events/${notification.eventId}`);
        showDropdown = false;
    }
</script>

{#if $userStore}
    <div class="notification-center-wrapper">
        <button class="notification-button" onclick={toggleDropdown}>
            <ion-icon name="notifications{!showDropdown ? '-outline' : ''}"></ion-icon>
            {#if unreadCount > 0}
                <span class="badge">{unreadCount}</span>
            {/if}
        </button>

        {#if showDropdown}
            <div class="dropdown">
                <div class="dropdown-header">
                    <h4>Notifications</h4>
                    {#if unreadCount > 0}
                        <button
                            class="clear-all-button"
                            onclick={handleClearNotifications}>Mark all as read</button
                        >
                    {/if}
                </div>
                {#if $notifications.length > 0}
                    <ul class="notification-list">
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        {#each $notifications as notification (notification.id)}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <li class="notification-item" class:read={notification.isRead} onclick={() => handleNotificationClick(notification)}>
                                <p>{notification.message}</p>
                                <span class="timestamp">
                                    {formatDate(notification.timestamp)}
                                </span>
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="no-notifications">No new notifications.</p>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style>
    .notification-center-wrapper {
        position: relative;
        margin-left: 10px;
    }

    .notification-button {
        background: none;
        cursor: pointer;
        font-size: 1.2rem;
        position: relative;
        padding: 2px;
        color: var(--ep-text-on-primary);
        border: none;
    }

    .badge {
        position: absolute;
        top: 0px;
        right: 0px;
        background-color: var(--ep-error);
        color: var(--ep-text-on-primary);
        border-radius: 50%;
        font-size: 0.6rem;
        padding: 1px 3px;
        min-width: 8px;
        height: 8px;
        line-height: 8px;
    }

    .dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        width: 250px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        background-color: var(--ep-background-light);
        border: 1px solid var(--ep-border);
        color: var(--ep-text-primary);
    }

    .dropdown-header {
        padding: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--ep-border);
    }

    .dropdown-header h4 {
        margin: 0;
        font-size: 0.9rem;
    }

    .clear-all-button {
        background: var(--ep-accent);
        border: 1px solid var(--ep-border);
        color: var(--ep-text-primary);
        padding: 2px 5px;
        font-size: 0.7rem;
        cursor: pointer;
    }

    .notification-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .notification-item {
        padding: 5px;
        border-bottom: 1px solid var(--ep-border);
    }

    .notification-item:last-child {
        border-bottom: none;
    }

    .notification-item :global(a) {
        text-decoration: none;
    }

    .notification-item p {
        margin: 0 0 2px 0;
        font-size: 0.8rem;
        line-height: 1.2;
        color: var(--ep-text-primary);
    }

    .notification-item.read {
        background-color: #f8f9fa;
        opacity: 0.7;
    }

    .notification-item.read p,
    .notification-item.read .timestamp {
        color: #6c757d;
    }

    .notification-item .timestamp {
        font-size: 0.7rem;
        color: var(--ep-text-secondary);
    }

    .no-notifications {
        padding: 10px;
        text-align: center;
        font-size: 0.8rem;
        color: var(--ep-text-secondary);
    }
</style>
