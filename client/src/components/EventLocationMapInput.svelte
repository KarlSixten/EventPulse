<script>
    import { onMount, onDestroy } from "svelte";
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";

    export let latitude = null;
    export let longitude = null;

    let mapContainer;
    let mapInstance;
    let markerInstance = null;

    // Copenhagen for default
    const defaultLat = 55.6761;
    const defaultLon = 12.5683;
    const defaultZoom = 10;
    const selectedZoom = 15;

    function initializeMapAndMarker(centerLat, centerLon, zoom) {
        if (!mapContainer || mapInstance) return;

        mapInstance = L.map(mapContainer).setView([centerLat, centerLon], zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);

        mapInstance.on("click", (event) => {
            const clickedLat = event.latlng.lat;
            const clickedLng = event.latlng.lng;

            latitude = parseFloat(clickedLat.toFixed(6));
            longitude = parseFloat(clickedLng.toFixed(6));

            updateMarker(latitude, longitude);
        });
    }

    onMount(() => {
        if (!mapContainer) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    initializeMapAndMarker(
                        position.coords.latitude,
                        position.coords.longitude,
                        selectedZoom,
                    );
                },
                (error) => {
                    console.warn(
                        `Geolocation error: ${error.message}. Defaulting to Copenhagen.`,
                    );
                    initializeMapAndMarker(defaultLat, defaultLon, defaultZoom);
                },
            );
        } else {
            console.warn(
                "Geolocation is not supported by this browser. Defaulting to Copenhagen.",
            );
            initializeMapAndMarker(defaultLat, defaultLon, defaultZoom);
        }
    });

    onDestroy(() => {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }
    });

    function updateMarker(lat, lon) {
        if (!mapInstance) return;

        if (markerInstance) {
            markerInstance.setLatLng([lat, lon]);
        } else {
            markerInstance = L.marker([lat, lon]).addTo(mapInstance);
        }
    }
</script>

<div class="map-container-wrapper" bind:this={mapContainer}></div>

{#if latitude !== null && longitude !== null}
    <p class="coordinates-display">
        Selected: Lat: {latitude.toFixed(5)}, Lon: {longitude.toFixed(5)}
    </p>
{/if}

<style>
    .map-container-wrapper {
        height: 300px;
        width: 100%;
        border: 1px solid #ccc;
        margin-bottom: 10px;
    }

    :global(.leaflet-container) {
        height: 100%;
        width: 100%;
    }
</style>
