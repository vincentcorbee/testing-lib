import { requestSubject } from '../../shared/index.js';

type HTTPRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

type Open = XMLHttpRequest['open'];
type Send = XMLHttpRequest['send'];

interface ExtendedXMLHttpRequest extends XMLHttpRequest {
  body: Parameters<Send>[0];
  method: HTTPRequestMethod;
  requestURL: URL;
}

function onLoadend(this: ExtendedXMLHttpRequest, _event: ProgressEvent<XMLHttpRequestEventTarget>) {
  requestSubject.next({
    type: 'xhr',
    responseType: this.responseType,
    get responseText() {
      return this.responseText;
    },
    get responseXML() {
      return this.responseXML;
    },
    method: this.method,
    url: this.requestURL,
    body: this.body,
    response: this.response,
    status: this.status,
    json: async () => {
      if (this.response instanceof Blob) return JSON.parse(await this.response.text());
      return null;
    },
  });
}

function onError(this: ExtendedXMLHttpRequest, event: ProgressEvent<XMLHttpRequestEventTarget>) {
  console.log(event);
}

export function xmlHttpRequestOpenInterceptor(
  this: ExtendedXMLHttpRequest,
  originalXhttpRequestOpen: Open,
  ...args: Parameters<Open>
): void {
  const [method, url] = args;

  // this.responseType = 'json';
  this.method = method as HTTPRequestMethod;
  this.requestURL = typeof url === 'string' ? new URL(url) : url;

  this.addEventListener('loadend', onLoadend.bind(this), { once: true });
  this.addEventListener('error', onError.bind(this), { once: true });

  return originalXhttpRequestOpen.apply(this, args as any);
}

export function xmlHttpRequestSendInterceptor(
  this: ExtendedXMLHttpRequest,
  originalXhttpRequestSend: XMLHttpRequest['send'],
  body: Parameters<Send>[0],
) {
  this.body = body;

  return originalXhttpRequestSend.call(this, body);
}
