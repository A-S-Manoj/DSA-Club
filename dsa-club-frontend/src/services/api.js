const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const request = async (method, path, body = null) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: body ? JSON.stringify(body) : null,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        let data;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            try {
                data = await res.json();
            } catch {
                // ignore JSON parse error, fallback handled below
            }
        }

        if (data && typeof data === 'object' && 'success' in data) {
            if (!data.success) {
                throw {
                    code: data.error?.code || 'UNKNOWN_ERROR',
                    message: data.error?.message || 'An unexpected error occurred'
                };
            }
            return data.data;
        }

        if (!res.ok) {
            throw {
                code: 'HTTP_ERROR',
                message: `Server returned status ${res.status}: ${res.statusText || 'Error'}`
            };
        }

        throw {
            code: 'INVALID_RESPONSE',
            message: 'Invalid response format from server'
        };
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw {
                code: 'TIMEOUT',
                message: 'Request timed out'
            };
        }
        throw error;
    }
};

export const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path)
};