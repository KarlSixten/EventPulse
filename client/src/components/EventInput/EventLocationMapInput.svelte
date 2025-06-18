<script>
    import { mapInput } from '../../util/setupMap.js'

    let { latitude = $bindable(null), longitude = $bindable(null) } = $props();

    function handleMapSelect(event) {
        latitude = parseFloat(event.detail.latitude.toFixed(6));
        longitude = parseFloat(event.detail.longitude.toFixed(6));
    }
</script>

<main>
    <div 
        class="map-container-wrapper" 
        use:mapInput={{ latitude, longitude }}
        onselect={handleMapSelect}
    >
    </div>

    {#if latitude !== null && longitude !== null}
        <p class="coordinates-display">
            Selected: Lat: {latitude.toFixed(2)}, Lon: {longitude.toFixed(2)}
        </p>
    {/if}
</main>

<style>
    .map-container-wrapper {
        height: 300px;
        width: 100%;
        border: 1px solid #ccc;
        margin-bottom: 10px;
        z-index: 0;
    }

    :global(.leaflet-container) {
        height: 100%;
        width: 100%;
    }
</style>
