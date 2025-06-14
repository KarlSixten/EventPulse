<script>
    import { onMount, onDestroy } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";
    import { apiFetch } from "../../util/fetch";
    import toastr from "toastr";

    let mapContainer = $state(null);
    let mapInstance = $state(null);
    let eventMarkersGroup = $state(null);
    let events = $state([]);
    let isLoadingEvents = $state(true);

    const COPENHAGEN_LAT = 55.7;
    const COPENHAGEN_LON = 12.5;
    const ZOOM_FALLBACK = 10;
    const ZOOM_GEOLOCATED = 13;

    function setupMap(centerLat, centerLon, initialZoom) {
        if (!mapContainer) {
            console.error(
                "MapPage: mapContainer DOM element not found during setupMap.",
            );
            return;
        }
        if (mapInstance) {
            mapInstance.setView([centerLat, centerLon], initialZoom);
            return;
        }

        mapInstance = L.map(mapContainer).setView(
            [centerLat, centerLon],
            initialZoom,
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);

        if (!eventMarkersGroup) {
            eventMarkersGroup = L.layerGroup().addTo(mapInstance);
        }
    }

    async function loadEventsWithLocations() {
        isLoadingEvents = true;

        const apiUrl = `${$BASE_URL}/api/events?timeFilter=upcoming&locationRequired=true`;
        const { result, ok, error } = await apiFetch(apiUrl);

        if (ok) {
            events = result.data;
            toastr.success(`Found ${result.data.length} nearby events.`);
        } else {
            toastr.error(
                error?.message || "Failed to fetch events for the map.",
            );
            console.error("Error fetching events for map:", error);
            events = [];
        }

        isLoadingEvents = false;
    }

    onMount(() => {
        if (!mapContainer) {
            console.error(
                "MapPage: mapContainer element not available onMount. Map will not initialize.",
            );
            isLoadingEvents = false;
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setupMap(
                        position.coords.latitude,
                        position.coords.longitude,
                        ZOOM_GEOLOCATED,
                    );
                },
                (error) => {
                    console.warn(
                        `MapPage: Geolocation error (${error.code}): ${error.message}. Defaulting to Copenhagen.`,
                    );
                    setupMap(COPENHAGEN_LAT, COPENHAGEN_LON, ZOOM_FALLBACK);
                },
            );
        } else {
            console.warn(
                "MapPage: Geolocation not supported by this browser. Defaulting to Copenhagen.",
            );
            setupMap(COPENHAGEN_LAT, COPENHAGEN_LON, ZOOM_FALLBACK);
        }

        loadEventsWithLocations();
    });

    onDestroy(() => {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
            eventMarkersGroup = null;
        }
    });

    $effect(() => {
        const currentEvents = events;
        const currentMapInstance = mapInstance;
        const currentEventMarkersGroup = eventMarkersGroup;

        if (!currentMapInstance || !currentEventMarkersGroup) {
            return;
        }
        currentEventMarkersGroup.clearLayers();

        if (currentEvents && currentEvents.length > 0) {
            currentEvents.forEach((event) => {
                if (
                    event &&
                    typeof event.location.latitude === "number" &&
                    typeof event.location.longitude === "number" &&
                    !isNaN(event.location.latitude) &&
                    !isNaN(event.location.longitude)
                ) {
                    const marker = L.marker([
                        event.location.latitude,
                        event.location.longitude,
                    ]);

                    let popupContent = `<b>${event.title || "Event"}</b>`;
                    if (event.description) {
                        const shortDesc =
                            event.description.length > 100
                                ? event.description.substring(0, 97) + "..."
                                : event.description;
                        popupContent += `<br>${shortDesc}`;
                    }
                    if (event.id) {
                        popupContent += `<br><a href="/events/${event.id}" target="_blank">View Details</a>`;
                    }
                    marker.bindPopup(popupContent);

                    marker.addTo(currentEventMarkersGroup);
                } else {
                    console.warn(
                        "MapPage: Skipping event due to missing or invalid coordinates:",
                        event?.title || "Unknown Event",
                    );
                }
            });
        }
    });
</script>

<main>
    {#if isLoadingEvents}
        <p>Loading event locations...</p>
    {/if}
    <h3>Nearby public Events</h3>

    <div class="map-container-wrapper" bind:this={mapContainer}></div>
</main>

<style>
    h3 {
        text-align: center;
        color: var(--ep-primary);
        margin-top: 1em;
        margin-bottom: 1em;
        font-size: 1.5em;
    }

    p {
        text-align: center;
        margin-bottom: 1em;
        color: var(--ep-text-secondary);
    }

    .map-container-wrapper {
        height: 75vh;
        min-height: 450px;
        width: 100%;
        max-width: 95%;
        border: 1px solid var(--ep-border);
        margin: 0 auto 20px auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
    }

    :global(.leaflet-container) {
        height: 100%;
        width: 100%;
        border-radius: inherit;
    }
</style>
