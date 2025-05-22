<script>
    import { onMount, onDestroy } from "svelte";
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";

    let {
        latitude = $bindable(null),
        longitude = $bindable(null),
    } = $props();

    let mapContainer = $state(null);
    let mapInstance = $state(null);
    let markerInstance = $state(null);

    const COPENHAGEN_LAT = 55.6761;
    const COPENHAGEN_LON = 12.5683;
    const ZOOM_FALLBACK = 10;
    const ZOOM_SELECTED = 15;

    function setupMap(centerLat, centerLon, initialZoom) {
        if (mapInstance || !mapContainer) {
            if (mapInstance) {
                mapInstance.setView([centerLat, centerLon], initialZoom);
            }
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

        mapInstance.on("click", (event) => {
            const clickedLat = event.latlng.lat;
            const clickedLng = event.latlng.lng;

            latitude = parseFloat(clickedLat.toFixed(6));
            longitude = parseFloat(clickedLng.toFixed(6));

            updateMarker(latitude, longitude);
            mapInstance.setView([latitude, longitude], ZOOM_SELECTED);
        });
    }

    function updateMarker(lat, lon) {
        if (!mapInstance) return;

        if (markerInstance) {
            markerInstance.setLatLng([lat, lon]);
        } else {
            markerInstance = L.marker([lat, lon]).addTo(mapInstance);
        }
    }

    onMount(() => {
    if (!mapContainer) {
        console.error("MapInput: mapContainer element not found.");
        return;
    }

    if (latitude !== null && longitude !== null) {
        setupMap(latitude, longitude, ZOOM_SELECTED);
        updateMarker(latitude, longitude);
    }

    else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setupMap(position.coords.latitude, position.coords.longitude, ZOOM_SELECTED);
            },
            (error) => {
                console.warn(`MapInput: Geolocation error (${error.code}): ${error.message}. Defaulting map center to Copenhagen.`);
                setupMap(COPENHAGEN_LAT, COPENHAGEN_LON, ZOOM_FALLBACK);
            }
        );
    }
    else {
        console.warn("MapInput: No initial coordinates and geolocation not supported. Defaulting map center to Copenhagen.");
        setupMap(COPENHAGEN_LAT, COPENHAGEN_LON, ZOOM_FALLBACK);
    }
});

    onDestroy(() => {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
            markerInstance = null;
        }
    });
</script>

<main>
    <div class="map-container-wrapper" bind:this={mapContainer}></div>

    {#if latitude !== null && longitude !== null}
        <p class="coordinates-display">
            Selected: Lat: {latitude.toFixed(5)}, Lon: {longitude.toFixed(5)}
        </p>
    {/if}
</main>

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
