type HTTPRequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
type Open = XMLHttpRequest['open'];
type Send = XMLHttpRequest['send'];
interface ExtendedXMLHttpRequest extends XMLHttpRequest {
    body: Parameters<Send>[0];
    method: HTTPRequestMethod;
    requestURL: URL;
}
export declare function xmlHttpRequestOpenInterceptor(this: ExtendedXMLHttpRequest, originalXhttpRequestOpen: Open, ...args: Parameters<Open>): void;
export declare function xmlHttpRequestSendInterceptor(this: ExtendedXMLHttpRequest, originalXhttpRequestSend: XMLHttpRequest['send'], body: Parameters<Send>[0]): void;
export {};
