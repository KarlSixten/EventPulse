<script>
    import { Router, Route, Link } from "svelte-routing";
    import SignUp from "../pages/SignUp/SignUp.svelte";
    import Login from "../pages/Login/Login.svelte";

    export let url = "";
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
            <Link to="/login">Login</Link>
            <Link to="/sign-up">Sign up</Link>
        </nav>

        <div class="content-area">
            <Route path="/"></Route>
            <Route path="/discover"></Route>
            <Route path="/about"></Route>
            <Route path="/login">
                <Login></Login>
            </Route>
            <Route path="/sign-up">
                <SignUp></SignUp>
            </Route>
        </div>
    </Router>
</main>

<style>
    .navbar {
        background-color: #00adb5;
        display: flex;
        align-items: center;
        padding: 10px 25px;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
    }

    .logo-img {
        height: 40px;
        width: auto;
        display: block;
    }
</style>
