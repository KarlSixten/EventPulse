<script>
    import { Router, Route, Link, navigate } from "svelte-routing";
    import { userStore } from "../stores/userStore";

    import SignUp from "../pages/SignUp/SignUp.svelte";
    import Login from "../pages/Login/Login.svelte";
    import Discover from "../pages/Discover/Discover.svelte";
    import CreateEvent from "../pages/CreateEvent/CreateEvent.svelte";
    import EventDetails from "../pages/EventDetails/EventDetails.svelte";

    export let url = "";

    function handleLogout() {
        userStore.set(null);
        sessionStorage.removeItem('currentUser');
        navigate('/');
    }
</script>

<main>
    <Router {url}>
        <nav class="navbar">
            <Link to="/" class="logo-link">
                <img src="/logo.png" class="logo-img" alt="EventPulse logo"/>
            </Link>
            <Link to="/">Home</Link>
            <Link to="/discover">Discover</Link>
            <Link to="/about">About</Link>

            <div class="nav-spacer"></div>

            <div class="nav-links-auth">
                {#if !$userStore}
                    <Link to="/login">Login</Link>
                    <Link to="/sign-up">Sign up</Link>
                {:else}
                    <Link to="/create-event">Create Event</Link>
                    <span class="welcome-message">
                        Welcome, {$userStore.firstName}!
                    </span>
                    <button class="logout-button" on:click={handleLogout}>
                        Logout
                    </button>
                {/if}
            </div>
        </nav>

        <div class="content-area">
            <Route path="/">
                </Route>
            <Route path="/discover"><Discover></Discover></Route>
            <Route path="/about">
                </Route>
            <Route path="/login"><Login></Login></Route>
            <Route path="/sign-up"><SignUp></SignUp></Route>
            <Route path="/create-event"><CreateEvent></CreateEvent></Route>
            <Route path="/events/:id"><EventDetails></EventDetails></Route>
        </div>
    </Router>
</main>

<style>
    .navbar { 
        display: flex; align-items: center;
        padding: 10px 20px;
        background-color: #00adb5;
        color: white;
        position: fixed; top: 0; left: 0; width: 100%;
        box-sizing: border-box
    }

    .navbar :global(a) { 
        color: white;
        text-decoration: none;
        margin: 0 8px;
    }

    .logo-img { height: 40px; display: block; }
    .nav-spacer { flex-grow: 1;}
    
    .nav-links-auth { display: flex; align-items: center; }

    .welcome-message { margin: 0 8px; }

    .logout-button { 
        background: none; 
        border: 1px solid white;
        color: white; 
        padding: 5px 8px; 
        margin-left: 8px; 
    }
    .content-area { 
        padding-top: 60px; 
    }
</style>