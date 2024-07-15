
import { requestSubject } from '../../shared/index.js';

export function xmlHttpRequestOpenInterceptor(this: XMLHttpRequest, originalXhttpRequestOpen: XMLHttpRequest['open'], ...args: any[]) {
    const [method, url] = args

    this.responseType = 'json'

    this.addEventListener('loadend', function(_event) {
      requestSubject.next({
        type: 'xhr',
        method,
        url: new URL(url),
        // @ts-ignore
        body: this.body,
        response: this.response,
        status: this.status,
        json: async () => {
            if(this.response instanceof Blob) return JSON.parse(await this.response.text())
            return null
        }
      })
    });

    this.addEventListener('error', function(event) {
      console.log(event)
    });

    return originalXhttpRequestOpen.apply(this, args as any);
}

export function xmlHttpRequestSendInterceptor(this: XMLHttpRequest, originalXhttpRequestSend: XMLHttpRequest['send'], body: any) {
  // @ts-ignore
  this.body = body


  return originalXhttpRequestSend.call(this, body);
}