const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const request = async (method, path, body = null) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: body ? JSON.stringify(body) : null
    });

    const data = await res.json();

    if (!data.success) {
        throw { code: data.error.code, message: data.error.message };
    }

    return data.data;
};

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path)
};