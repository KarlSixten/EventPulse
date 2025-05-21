<script>
  import { onMount } from "svelte";
  import { userStore } from "./stores/userStore.js";
  import { fetchGet } from "./util/fetch.js";
  import { BASE_URL } from "./stores/generalStore.js";
  import { Router, Route } from "svelte-routing";
  
  import './stores/notificationStore.js'

  import "toastr/build/toastr.min.css";

  import toastr from 'toastr';

    toastr.options = {
      "closeButton": true,
      "progressBar": true,
      "positionClass": "toast-bottom-right",
      "timeOut": "4000",
      "extendedTimeOut": "1000",
    };

  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import SignUp from "./pages/SignUp/SignUp.svelte";
  import Login from "./pages/Login/Login.svelte";
  import Discover from "./pages/Discover/Discover.svelte";
  import CreateEvent from "./pages/CreateEvent/CreateEvent.svelte";
  import EventDetails from "./pages/EventDetails/EventDetails.svelte";
  import About from "./pages/About/About.svelte";
    import EditEvent from "./pages/EditEvent/EditEvent.svelte";

  export let url = "";

  onMount(async () => {
    try {
      const result = await fetchGet($BASE_URL + "/api/auth/me");

      if (!result.isAuthenticated) {
        userStore.set(null);
        sessionStorage.removeItem("currentUser");
      } else {
        const user = result.user;
        if (user && user.id) {
          userStore.set(user);
          sessionStorage.setItem("currentUser", JSON.stringify(user));
        } else {
          userStore.set(null);
          sessionStorage.removeItem("currentUser");
        }
      }
    } catch (error) {
      console.error("Error verifying user session with backend:", error.message, error);
      userStore.set(null);
      sessionStorage.removeItem("currentUser");
    }
  });
</script>

<div class="app-layout">
  <Router {url}>
    <Header />
    <div class="content-area">
      <Route path="/"></Route>
      <Route path="/discover"><Discover></Discover></Route>
      <Route path="/about"><About></About></Route>
      <Route path="/login"><Login></Login></Route>
      <Route path="/sign-up"><SignUp></SignUp></Route>
      <Route path="/create-event"><CreateEvent></CreateEvent></Route>
      <Route path="/events/:id" let:params><EventDetails id={params.id}></EventDetails></Route>
      <Route path="/events/:id/edit"><EditEvent></EditEvent></Route>
    </div>
    <Footer />
  </Router>
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding-top: 70px;
  }

  .content-area {
    flex-grow: 1;
  }
  
</style>
