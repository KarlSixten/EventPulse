<script>
    import {
        formatDate,
        formatDistance,
        formatCurrency,
    } from "../../util/format";

    let { event } = $props();
</script>

<article class="event-card">
    <div class="card-content">
        <h3 class="event-title">{event.title}</h3>
        <p
            class="event-publicity"
            class:public={!event.isPrivate}
            class:private={event.isPrivate}
        >
            {event.isPrivate ? "Private" : "Public"}
        </p>
        <p class="event-type event-type-{event.type.name}">
            {event.type.name}
        </p>
    </div>
    <div class="card-footer">
        <p class="event-price">{formatCurrency(event.price)}</p>
        <p class="event-date-time">{formatDate(event.dateTime)}</p>
        {#if event.distanceMeters}
            <p class="event-distance-from-user">
                {formatDistance(event.distanceMeters)}
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
        min-height: 250px;
    }

    .event-card:hover {
        box-shadow: 0 4px 12px var(--ep-primary);
    }

    .event-title {
        font-size: 1.3em;
        font-weight: bold;
        color: var(--ep-text-primary);
        margin-top: 0;
        line-height: 1.3;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .event-publicity {
        display: inline-block;
        font-weight: normal;
        color: var(--ep-text-secondary);
        background-color: var(--ep-accent);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .event-publicity.public {
        background-color: var(--ep-success);
        color: var(--ep-text-on-primary);
    }

    .event-publicity.private {
        background-color: var(--ep-secondary);
        color: var(--ep-text-on-secondary);
    }


    .event-type {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: normal;
        border: 1px solid;
    }

    .event-type-Concert {
        background-color: #f3e8ff;
        color: #581c87;
        border-color: #d8b4fe;
    }

    .event-type-Meetup {
        background-color: #e0f2fe;
        color: #0c4a6e;
        border-color: #7dd3fc;
    }

    .event-type-Birthday {
        background-color: #fef9c3;
        color: #713f12;
        border-color: #fde047;
    }

    .event-type-Food {
        background-color: #ffe4e6;
        color: #881337;
        border-color: #fda4af;
    }

    .event-type-Workshop {
        background-color: #fefce8;
        color: #854d0e;
        border-color: #facc15;
    }

    .event-type-Workout {
        background-color: #dcfce7;
        color: #166534;
        border-color: #86efac;
    }

    .event-type-Presentation {
        background-color: #eef2ff;
        color: #312e81;
        border-color: #a5b4fc;
    }

    .event-type-Other {
        background-color: #f3f4f6;
        color: #374151;
        border-color: #d1d5db;
    }
</style>
