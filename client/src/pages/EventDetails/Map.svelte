<script>
    import { singleLocationMap } from '../../util/setupMap.js';

    let { latitude, longitude } = $props();
</script>

<main>
    <div 
        class="map-container-wrapper" 
        use:singleLocationMap={{ latitude, longitude }}
    >
    </div>
</main>

<style>
    .map-container-wrapper {
        height: 40vh;
        width: 100%;
        border: 1px solid var(--ep-primary);
    }
</style>
