<script>
    let { isPrivate = $bindable() } = $props();
</script>

<div class="checkbox-group">
    <input type="checkbox" id="event-is-private" bind:checked={isPrivate} />
    <label for="event-is-private">This is a private event</label>
</div>
