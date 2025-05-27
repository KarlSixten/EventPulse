export async function fetchGet(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
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

export async function fetchDelete(url) {
    try {
        const response = await fetch(url, {
            method: "DELETE",
            credentials: "include"
        });
        const result = await response.json();
        result.ok = response.ok;
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
