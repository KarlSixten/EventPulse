<script>
    import { onMount } from "svelte";


    onMount(() => {
        fetchEvents();
    })

    async function fetchEvents() {
        console.log("fetch events called");
    }

</script>

<main>
    This is the discover page
</main>

<style>

</style>