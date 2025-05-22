<script>
    import { Link, navigate } from "svelte-routing";
    import { userStore } from "../stores/userStore"; //
    import { clearNotifications } from "../stores/notificationStore";
    import { eventForEditing } from "../stores/eventStore";
    import { BASE_URL } from "../stores/generalStore"; //
    import { fetchPost } from "../util/fetch"; //
    import NotificationCenter from "./NotificationCenter.svelte";

    async function handleLogout() {
        try {
            const result = await fetchPost($BASE_URL + '/api/auth/logout');
            if (result.ok) {
                console.log("Successfully log out from server.");
            } else {
                console.error("Backend logout failed:", result.status, result.data.message);
            }
        } catch (error) {
            console.error("Error making logout request to backend:", error);
        } finally {
            userStore.set(null);
            clearNotifications();
            eventForEditing.set(null);
            sessionStorage.removeItem("currentUser");
            navigate("/");
        }
    }
</script>

<main>
    <nav class="navbar">
        <Link to="/" class="logo-link nav-link">
            <img src="/logo.png" class="logo-img" alt="EventPulse logo" />
        </Link>
        <Link to="/" class="nav-link"><ion-icon name="home"></ion-icon>Home</Link>
        <Link to="/discover" class="nav-link"><ion-icon name="planet"></ion-icon>Discover</Link>
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
                <button class="logout-button" onclick="{handleLogout}">
                    Logout<ion-icon name="log-out"></ion-icon>
                </button>
            {/if}
        </div>
    </nav>
</main>

<style>
    .navbar {
        display: flex;
        align-items: center;
        padding: 10px 20px;
        background-color: #00adb5;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;
    }

    .navbar :global(a.nav-link) {
        color: white;
        text-decoration: none;
        margin: 0 8px;
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
        color: white;
    }

    .logout-button {
        background: none;
        border: 1px solid white;
        color: white;
        padding: 5px 8px;
        margin-left: 8px;
    }
</style>