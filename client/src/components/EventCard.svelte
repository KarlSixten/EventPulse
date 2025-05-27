<script>
    import { formatDate, formatDistance } from "../util/format"; //

    let { title, dateTime, distanceMeters } = $props();
</script>

<article class="event-card">
    <div class="card-content">
        <h3 class="event-title">{title}</h3>
    </div>
    <div class="card-footer">
        <p class="event-date-time">{formatDate(dateTime)}</p>
        {#if distanceMeters}
            <p class="event-distance-from-user">
                {formatDistance(distanceMeters)}
            </p>
        {/if}
    </div>
</article>

<style>
    .event-card {
        background-color: var(--ep-background-light);
        border: 1px solid var(--ep-primary);
        border-radius: 8px;
        padding: 15px;
        margin: 15px;
        box-shadow: 0 2px 4px var(--ep-primary);
        color: var(--ep-text-primary);
        transition: box-shadow 0.3s ease-in-out;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 120px;
        overflow: hidden;
    }

    .event-card:hover {
        box-shadow: 0 4px 12px var(--ep-primary);
    }

    .card-content {
        flex-grow: 1;
    }

    .event-title {
        font-size: 1.3em;
        font-weight: bold;
        color: var(--ep-text-primary);
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .card-footer {
        margin-top: 8px;
    }

    .event-date-time, .event-distance-from-user {
        font-size: 0.85em;
        color: var(--ep-text-primary);
        margin-bottom: 4px;
        line-height: 1.2;
        
    }

    .event-date-time:last-child, 
    .event-distance-from-user:last-child {
        margin-bottom: 0;
    }
</style>