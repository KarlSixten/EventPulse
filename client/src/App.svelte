<script>
  import { onMount } from 'svelte';
  import { userStore } from './stores/userStore.js'
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';

  onMount(() => {
    try {
      const storedUser = sessionStorage.getItem("currentUser");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userStore.set(userData);
      }
    } catch (error) {
      console.error("Error reading user from sessionStorage on mount:", error);
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