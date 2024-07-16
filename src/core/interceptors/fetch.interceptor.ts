import { requestSubject } from '../../shared/index.js';

export async function fetchInterceptor(this: typeof globalThis, originalFetch: typeof globalThis.fetch, ...args: [RequestInfo | URL, RequestInit | undefined]) {
  const [url, init = {}] = args
  const { method = 'GET', body } = init

  const response = await originalFetch(...args);

  requestSubject.next({
    type: 'fetch',
    method,
    url: typeof url === 'string' ? new URL(url) : url,
    body,
    response,
    status: response.status
  })

  return response;
}