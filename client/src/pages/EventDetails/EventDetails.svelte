<script>
    import { onMount } from "svelte";
    import { fetchGet } from "../../util/fetch.js";
    import { BASE_URL } from "../../stores/generalStore.js";

    export let params = {};

    onMount(() => {
        console.log(params);
    });

</script>

<main>
    This is details for event
</main>

<style>

</style>