<script>
    import { Link, navigate } from "svelte-routing";
    import { userStore } from "../stores/userStore";
    import { eventForEditing } from "../stores/eventStore";
    import { BASE_URL } from "../stores/generalStore";
    import { fetchPost } from "../util/fetch";
    import NotificationCenter from "./NotificationCenter.svelte";

    import toastr from "toastr";

    async function handleLogout() {
        try {
            const result = await fetchPost($BASE_URL + '/api/auth/logout');
            if (result.ok) {
                toastr.success("Successfully logged out.")
            } else {
                toastr.error("An error occured while logging out.")
                console.error("Backend logout failed:", result.status, result.data.message);
            }
        } catch (error) {
            toastr.error("An error occured while logging out.")
            console.error("Error making logout request to backend:", error);
        } finally {
            userStore.set(null);
            eventForEditing.set(null);
            sessionStorage.removeItem("currentUser");
            navigate("/");
        }
    }
</script>

<header class="navbar">
    <Link to="/" class="logo-link nav-link">
        <img src="/logo.png" class="logo-img" alt="EventPulse logo" />
    </Link>
    <Link to="/" class="nav-link"><ion-icon name="home"></ion-icon>Home</Link>
    <Link to="/discover" class="nav-link"><ion-icon name="planet"></ion-icon>Discover</Link>
    <Link to="/map" class="nav-link"><ion-icon name="map"></ion-icon>Map</Link>
    <Link to="/about" class="nav-link"><ion-icon name="reader"></ion-icon>About</Link>

    <div class="nav-spacer"></div>

    <div class="nav-links-auth">
        {#if !$userStore}
            <Link to="/login" class="nav-link"><ion-icon name="log-in"></ion-icon>Login</Link>
            <Link to="/sign-up" class="nav-link"><ion-icon name="person-add"></ion-icon>Sign up</Link>
        {:else}
            <Link to="/create-event" class="nav-link"><ion-icon name="add-circle"></ion-icon>Create Event</Link>
            <span class="welcome-message">
                Welcome, {$userStore.firstName}!
            </span>
            <NotificationCenter />
            <button class="logout-button" on:click={handleLogout}>
                Logout<ion-icon name="log-out"></ion-icon>
            </button>
        {/if}
    </div>
</header>

<style>
    .navbar {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        background-color: var(--ep-primary);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;
        z-index: 1000;
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
        margin-right: 5px;
    }

    .logo-img {
        height: 40px;
        display: block;
    }

    .nav-spacer {
        flex-grow: 1;
    }

    .nav-links-auth {
        display: flex;
        align-items: center;
    }

    .welcome-message {
        margin: 0 8px;
        color: var(--ep-text-on-primary);
    }

    .logout-button {
        background: none;
        border: 1px solid var(--ep-text-on-primary);
        color: var(--ep-text-on-primary);
        padding: 5px 8px;
        margin-left: 8px;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        border-radius: 4px;
        cursor: pointer;
        transition: opacity 0.2s;
        display: inline-flex;
        align-items: center;
    }
    
    .logout-button ion-icon {
        margin-left: 5px;
    }

    .logout-button:hover {
        opacity: 0.8;
    }
</style>