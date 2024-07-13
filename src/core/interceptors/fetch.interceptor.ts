import { requestSubject } from '../../shared/index.js';

export async function fetchInterceptor(this: typeof globalThis, originalFetch: Function, ...args: any[]) {
  const [url, init = {}] = args
  const { method = 'GET', body } = init

  const response = await originalFetch.call(this, args);

  requestSubject.next({
    type: 'fetch',
    method,
    url: new URL(url),
    body,
    response,
    status: response.status
  })

  return response;
}