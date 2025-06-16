<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { apiFetch } from "../../util/fetch";
    import toastr from "toastr";

    let { typeId = $bindable() } = $props();

    let eventTypes = $state([]);

    onMount(async () => {
        const { result, error, ok } = await apiFetch(`${$BASE_URL}/api/events/types`);

        if (ok) {
            eventTypes = result.data;
        } else {
            toastr.error("Could not load event types.");
            console.error("Failed to fetch event types:", error);
        }
    });
</script>

<div>
    <label for="event-type">Type:</label>
    <select bind:value={typeId} required>
        <option value="" disabled>Select a type...</option>
        {#each eventTypes as type}
            <option value={type.id}>{type.name}</option>
        {/each}
    </select>
</div>
