<script>
  import { onMount } from "svelte";
  import { userStore } from "./stores/userStore.js";
  import { apiFetch } from "./util/fetch.js";
  import { BASE_URL } from "./stores/generalStore.js";
  import { Router, Route } from "svelte-routing";

  import "./stores/notificationStore.js";

  import "toastr/build/toastr.min.css";

  import toastr from "toastr";

  toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-bottom-right",
    timeOut: "4000",
    extendedTimeOut: "1000",
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
  import Map from "./pages/Map/Map.svelte";
  import Home from "./pages/Home/Home.svelte";
  import AuthGuard from "./components/AuthGuard.svelte";
  import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.svelte";
  import ResetPassword from "./pages/ResetPassword/ResetPassword.svelte";
  import Page404 from './pages/Error/Page404.svelte';

  export let url = "";

  onMount(async () => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      try {
        userStore.set(JSON.parse(storedUser));
      } catch (error) {
        sessionStorage.removeItem("currentUser");
      }
    }

    const { result, ok, error } = await apiFetch(`${$BASE_URL}/api/auth/me`);

    if (ok && result.data.isAuthenticated) {
      const user = result.data.user;

      userStore.set(user);
      sessionStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      userStore.set(null);
      sessionStorage.removeItem("currentUser");
      if (error) {
        console.error("Error verifying user session with backend:", error);
      }
    }
  });
</script>

<div class="app-layout">
  <Router {url}>
    <Header />
    <div class="content-area">
      <Route path="/"><Home></Home></Route>
      <Route path="/home"><Home></Home></Route>
      <Route path="/discover"><Discover></Discover></Route>
      <Route path="/map"><Map></Map></Route>
      <Route path="/about"><About></About></Route>
      <Route path="/login"><Login></Login></Route>
      <Route path="/sign-up"><SignUp></SignUp></Route>
      <Route path="/forgot-password"><ForgotPassword></ForgotPassword></Route>
      <Route path="/reset-password"><ResetPassword></ResetPassword></Route>

      <Route path="/create-event">
        <AuthGuard>
          <CreateEvent />
        </AuthGuard>
      </Route>

      <Route path="/events/:id" let:params
        ><EventDetails id={params.id}></EventDetails></Route
      >

      <Route path="/events/:id/edit" let:params>
        <AuthGuard>
          <EditEvent id={params.id}></EditEvent>
        </AuthGuard>
      </Route>
      
      <Route><Page404></Page404></Route>
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
</style>
