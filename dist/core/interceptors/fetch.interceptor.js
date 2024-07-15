import { requestSubject } from '../../shared/index.js';
export async function fetchInterceptor(originalFetch, ...args) {
    const [url, init = {}] = args;
    const { method = 'GET', body } = init;
    const response = await originalFetch.call(this, ...args);
    requestSubject.next({
        type: 'fetch',
        method,
        url: typeof url === 'string' ? new URL(url) : url,
        body,
        response,
        status: response.status
    });
    return response;
}
//# sourceMappingURL=fetch.interceptor.js.map