import { requestSubject } from '../../shared/index.js';
function onLoadend(_event) {
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
            if (this.response instanceof Blob)
                return JSON.parse(await this.response.text());
            return null;
        },
    });
}
function onError(event) {
    console.log(event);
}
export function xmlHttpRequestOpenInterceptor(originalXhttpRequestOpen, ...args) {
    const [method, url] = args;
    // this.responseType = 'json';
    this.method = method;
    this.requestURL = typeof url === 'string' ? new URL(url) : url;
    this.addEventListener('loadend', onLoadend.bind(this), { once: true });
    this.addEventListener('error', onError.bind(this), { once: true });
    return originalXhttpRequestOpen.apply(this, args);
}
export function xmlHttpRequestSendInterceptor(originalXhttpRequestSend, body) {
    this.body = body;
    return originalXhttpRequestSend.call(this, body);
}
//# sourceMappingURL=xml-http-request.interceptor.js.map