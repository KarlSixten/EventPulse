// @ts-nocheck
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_DEFAULTS = {
    COORDS: [55.6761, 12.5683], // Center of Copenhagen
    FALLBACK_ZOOM: 10,
    GEOLOCATION_ZOOM: 13,
    SELECTED_ZOOM: 15,
};

function createBaseMap(node) {
    const map = L.map(node);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    return map;
}

export function singleLocationMap(node, { latitude, longitude }) {
    const map = createBaseMap(node);
    map.setView([latitude, longitude], MAP_DEFAULTS.SELECTED_ZOOM);
    const marker = L.marker([latitude, longitude]).addTo(map);

    return {
        update({ latitude, longitude }) {
            map.setView([latitude, longitude], MAP_DEFAULTS.SELECTED_ZOOM);
            marker.setLatLng([latitude, longitude]);
        },
        destroy() {
            map.remove();
        }
    };
}

export function mapInput(node, initialCoords = {}) {
    const map = createBaseMap(node);
    let { latitude, longitude } = initialCoords;
    let marker = null;

    function updateMarker(lat, lng) {
        if (!marker) {
            marker = L.marker([lat, lng]).addTo(map);
        } else {
            marker.setLatLng([lat, lng]);
        }
    }

    if (latitude != null && longitude != null) {
        map.setView([latitude, longitude], MAP_DEFAULTS.SELECTED_ZOOM);
        updateMarker(latitude, longitude);
    } else {
        map.setView(MAP_DEFAULTS.COORDS, MAP_DEFAULTS.FALLBACK_ZOOM);
    }

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        node.dispatchEvent(new CustomEvent('select',
            {
                detail:
                {
                    latitude: lat,
                    longitude: lng
                }
            }));
    });

    return {
        update(newCoords) {
            map.setView([newCoords.latitude, newCoords.longitude], MAP_DEFAULTS.SELECTED_ZOOM);
            updateMarker(newCoords.latitude, newCoords.longitude);
        },
        destroy() {
            map.remove();
        }
    };
}

export function discoverMap(node) {
    const map = createBaseMap(node);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => map.setView([position.coords.latitude, position.coords.longitude], MAP_DEFAULTS.GEOLOCATION_ZOOM),
            () => map.setView(MAP_DEFAULTS.COORDS, MAP_DEFAULTS.FALLBACK_ZOOM)
        );
    } else {
        map.setView(MAP_DEFAULTS.COORDS, MAP_DEFAULTS.FALLBACK_ZOOM);
    }

    node.dispatchEvent(new CustomEvent('map_ready', { detail: { map } }));

    return {
        destroy() {
            map.remove();
        }
    };
}