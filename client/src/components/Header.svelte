<script>
    import { Link, navigate } from "svelte-routing";
    import { BASE_URL } from "../stores/generalStore";
    import { userStore } from "../stores/userStore";
    import { eventForEditing } from "../stores/eventStore";
    import { apiFetch } from "../util/fetch";
    import toastr from "toastr";

    import NotificationCenter from "./NotificationCenter.svelte";

    async function handleLogout() {
        const { ok, error } = await apiFetch(`${$BASE_URL}/api/auth/logout`, {
            method: "POST",
        });

        if (ok) {
            toastr.success("Successfully logged out.");
        } else {
            toastr.error(
                error.message || "An error occurred while logging out.",
            );
        }

        userStore.set(null);
        eventForEditing.set(null);
        sessionStorage.removeItem("currentUser");
        navigate("/");
    }
</script>

<header class="navbar">
    <Link to="/" class="logo-link nav-link">
        <img src="/logo.png" class="logo-img" alt="EventPulse logo" />
    </Link>
    <Link to="/" class="nav-link"><ion-icon name="home"></ion-icon>Home</Link>
    <Link to="/discover" class="nav-link"
        ><ion-icon name="planet"></ion-icon>Discover</Link
    >
    <Link to="/map" class="nav-link"><ion-icon name="map"></ion-icon>Map</Link>
    <Link to="/about" class="nav-link"
        ><ion-icon name="reader"></ion-icon>About</Link
    >

    <div class="nav-spacer"></div>

    <div class="nav-links-auth">
        {#if !$userStore}
            <Link to="/login" class="nav-link"
                ><ion-icon name="log-in"></ion-icon>Login</Link
            >
            <Link to="/sign-up" class="nav-link"
                ><ion-icon name="person-add"></ion-icon>Sign up</Link
            >
        {:else}
            <Link to="/create-event" class="nav-link"
                ><ion-icon name="add-circle"></ion-icon>Create Event</Link
            >
            <span class="welcome-message">
                Welcome, {$userStore.firstName}!
            </span>
            <NotificationCenter />
            <button class="logout-button" onclick={handleLogout}>
                Logout<ion-icon name="log-out"></ion-icon>
            </button>
        {/if}
    </div>
</header>

<style>
    .navbar {
        display: flex;
        padding: 10px 20px;
        background-color: var(--ep-primary);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;
        z-index: 1000;
                color: var(--ep-text-on-primary);

    }
    .navbar :global(a.nav-link) {
        color: var(--ep-text-on-primary);
        text-decoration: none;
        margin: 0 8px;
        padding: 5px;
        display: inline-flex;
        align-items: center;
    }

    .navbar :global(a.nav-link:hover) {
        filter: brightness(80%);
    }

    .navbar :global(a.nav-link ion-icon) {
        margin-right: 0.5rem;
    }

    .logo-img {
        height: 3rem;
        display: block;
    }

    .nav-spacer {
        flex-grow: 1;
        min-width: 5rem;
    }

    .nav-links-auth {
        display: flex;
        align-items: center;
        text-wrap-mode: nowrap;

    }

    .welcome-message {
        margin: 0 8px;

    }

    .logout-button {
        margin-left: 2rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
    }

    .logout-button ion-icon {
        margin-left: 0.2rem;
    }
</style>
