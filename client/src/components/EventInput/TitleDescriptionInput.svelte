<script>
    let { title = $bindable(), description = $bindable() } = $props();
</script>

<div>
    <label for="event-title">Title:</label>
    <input type="text" id="event-title" bind:value={title} required />
</div>
<div>
    <label for="event-description">Description:</label>
    <textarea id="event-description" rows="6" bind:value={description} required
    ></textarea>
</div>
