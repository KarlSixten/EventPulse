export async function fetchGet(url) {
    try {
        const response = await fetch(url, {
            credentials: "include"
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export function fetchPost(url, body) {
    return fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(async (response) => {
        const data = await response.json();
        return {
            status: response.status,
            ok: response.ok,
            data,
        };
    })
    .catch((error) => {
        console.error("fetchPost error:", error);
        throw error;
    });
}

export function fetchPut(url, body) {
    return fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(async (response) => {
        const data = await response.json();
        return {
            status: response.status,
            ok: response.ok,
            data,
        };
    })
    .catch((error) => {
        console.error("fetchPost error:", error);
        throw error;
    });
}