<script>
    import { onMount, onDestroy } from "svelte";
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";
    import { fetchGet } from "../../util/fetch";
    import { BASE_URL } from "../../stores/generalStore";
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
        try {
            let apiUrl =
                $BASE_URL +
                `/api/events?timeFilter=upcoming&locationRequired=true`;            

            const result = await fetchGet(apiUrl);

            if (result && result.data) {
                events = result.data;
                toastr.success(`Found ${result.data.length} nearby events.`)
            } else {
                toastr.error("Failed to fetch events or no data in response")
                console.error("Failed to fetch events or no data in response:", result);
                events = [];
            }
        } catch (error) {
            console.error("Error fetching events for map:", error);
            events = [];
        } finally {
            isLoadingEvents = false;
        }
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
                    typeof event.latitude === "number" &&
                    typeof event.longitude === "number" &&
                    !isNaN(event.latitude) &&
                    !isNaN(event.longitude)
                ) {
                    const marker = L.marker([event.latitude, event.longitude]);

                    // Customize popup content
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
    p {
        text-align: center;
        margin-bottom: 1em;
    }

    .map-container-wrapper {
        height: 70vh;
        min-height: 400px;
        width: 95%;
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }

    :global(.leaflet-container) {
        height: 100%;
        width: 100%;
    }
</style>
