<script>
    let { title, dateTime, distanceMeters} = $props()

    function formatDistance(distance) {
        if (distance < 1000) {
            return distance.toFixed(0) + "m";
        } else {
            return (distance / 1000).toFixed(0) + "km";
        }
    }

    function formatDate(isoString) {
        const date = new Date(isoString);

        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const year = date.getUTCFullYear();
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
</script>

<main>
    <div class="event-card">
        <h3 class="event-title">{title}</h3>
        <p class="event-date-time">{formatDate(dateTime)}</p>
        {#if distanceMeters}
            <p class="event-distance-from-user">
                {formatDistance(distanceMeters)}
            </p>
        {/if}
    </div>
</main>

<style>
    .event-card {
        background-color: #ffffff;
        border: 1px solid #00adb5;
        border-radius: 8px;
        padding: 20px;
        margin: 15px;
        box-shadow: 0 2px 4px #00adb5;
        max-width: 50vw;
        font-family: Arial, sans-serif;
        color: #333;
        transition: box-shadow 0.3s ease-in-out;
    }

    .event-card:hover {
        box-shadow: 0 4px 12px #00adb5;
    }

    .event-title {
        font-size: 1.4em;
        font-weight: bold;
        color: #1a1a1a;
        margin-top: 0;
        margin-bottom: 10px;
    }
</style>
