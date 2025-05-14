export function formatDistance(distance) {
    if (distance < 1000) {
        return distance.toFixed(0) + "m";
    } else {
        return (distance / 1000).toFixed(0) + "km";
    }
}

export function formatDate(isoString) {
    const date = new Date(isoString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}