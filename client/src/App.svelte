<script>
  import { onMount } from 'svelte';
  import { userStore } from './stores/userStore.js'
  import { fetchGet } from './util/fetch.js';
  import { BASE_URL } from './stores/generalStore.js';

  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';

  onMount(async () => {
    try {
      const result = await fetchGet($BASE_URL + "/api/me"); 

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
  <Header />

  <main class="main-content-area">
  </main>

  <Footer />
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding-top: 70px;
  }

  .main-content-area {
    flex-grow: 1;
  }
</style>