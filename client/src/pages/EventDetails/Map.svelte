<script>
    import { onMount, onDestroy } from "svelte";
    import L, { marker } from "leaflet";

    let { latitude, longitude } = $props();

    let mapContainer;
    let mapInstance;

    const defaultZoom = 15;

    onMount(() => {
        if (!mapContainer || mapInstance) return;

        mapInstance = L.map(mapContainer).setView(
            [latitude, longitude],
            defaultZoom,
        );
        L.marker([latitude, longitude]).addTo(mapInstance);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance);
    });

    onDestroy(() => {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }
    });
</script>

<main>
    <div class="map-container-wrapper" bind:this={mapContainer}></div>
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
