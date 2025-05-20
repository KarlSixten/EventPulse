<script>
    import { userStore } from "../stores/userStore.js";
    import {
        notifications,
        hasUnreadNotifications,
        markNotificationsAsRead,
        clearNotifications,
    } from "../stores/notificationStore.js";
    import { formatDate } from "../util/format.js";
    import { onMount, onDestroy } from "svelte";
    import { Link } from "svelte-routing";

    let showDropdown = false;

    function toggleDropdown() {
        showDropdown = !showDropdown;
        if (showDropdown && $hasUnreadNotifications) {
            markNotificationsAsRead();
        }
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
        clearNotifications();
        showDropdown = false;
    }
</script>

{#if $userStore}
    <div class="notification-center-wrapper">
        <button class="notification-button" onclick={toggleDropdown}>
            <ion-icon name='notifications{!showDropdown ? '-outline' : ''}'></ion-icon>
            {#if $hasUnreadNotifications}
                <span class="badge"
                    >{$notifications.filter((n) => !n.read).length || ""}</span
                >
            {/if}
        </button>

        {#if showDropdown}
            <div class="dropdown">
                <div class="dropdown-header">
                    <h4>Notifications</h4>
                    {#if $notifications.length > 0}
                        <button
                            class="clear-all-button"
                            onclick={handleClearNotifications}>Clear All</button
                        >
                    {/if}
                </div>
                {#if $notifications.length > 0}
                    <ul class="notification-list">
                        {#each $notifications as notification (notification.timestamp + notification.message)}
                            <li class="notification-item">
                                <Link to='events/{notification.eventId}'>
                                    <p>{notification.message}</p>
                                    <span class="timestamp"
                                        >{formatDate(
                                            notification.timestamp,
                                        )}</span
                                    >
                                </Link>
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
        color: white;
    }

    .badge {
        position: absolute;
        top: 0px;
        right: 0px;
        background-color: red;
        color: white;
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
        background-color: white;
        border: 1px solid black;
        color: black;
    }

    .dropdown-header {
        padding: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid black;
    }

    .dropdown-header h4 {
        margin: 0;
        font-size: 0.9rem;
    }

    .clear-all-button {
        background: #eee;
        border: 1px solid black;
        color: black;
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
        border-bottom: 1px solid #ccc;

    }
    .notification-item:last-child {
        border-bottom: none;
    }

    .notification-item p {
        margin: 0 0 2px 0;
        font-size: 0.8rem;
        line-height: 1.2;
        color: black;

    }

    .notification-item .timestamp {
        font-size: 0.7rem;
        color: #333;
    }

    .no-notifications {
        padding: 10px;
        text-align: center;
        font-size: 0.8rem;
    }
</style>
