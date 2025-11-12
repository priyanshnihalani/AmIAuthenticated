import { getHttpClient } from "./httpClient";

function client() {
    const c = getHttpClient()
    if (!c) throw new Error('HTTP client not initialized. Call createHttpClient() first.');
    return c;
}

export const ApiService = {

    async get(path, config = {}) {
        const res = await client().get(path, config)
        return res.data
    },

    async post(path, body = {}, config = {}) {
        const res = await client().post(path, body, config)
        return res.data
    },

    async put(path, body = {}, config = {}) {
        const res = await client().put(path, body, config);
        return res.data;
    },

    async delete(path, config = {}) {
        const res = await client().delete(path, config);
        return res.data;
    },

    async upload(path, file, extra = {}) {
        const form = new FormData();
        form.append('file', file);
        Object.entries(extra).forEach(([k, v]) => form.append(k, v));

        const res = await client().post(path, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
}