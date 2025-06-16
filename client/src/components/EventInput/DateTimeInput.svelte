<script>
    import { getLocalDateTimeString } from "../../util/format";

    let { dateTime = $bindable() } = $props();
</script>

<div>
    <label for="event-date">Date & Time:</label>
    <input
        type="datetime-local"
        id="event-date"
        min={getLocalDateTimeString()}
        bind:value={dateTime}
        required
    />
</div>
