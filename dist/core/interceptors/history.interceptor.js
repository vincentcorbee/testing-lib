import { navigationSubject } from '../../ui/subjects.js';
export function historyPushStateInterceptor(originalPushState, ...args) {
    const [, , url] = args;
    navigationSubject.next({
        url: typeof url === 'string' ? url : url instanceof URL ? url.pathname : null,
    });
    originalPushState.apply(this, args);
}
export function historyGoInterceptor(originalGo, ...args) {
    // const [, , url] = args;
    // navigationSubject.next({
    //   url: typeof url === 'string' ? url : url instanceof URL ? url.pathname : null,
    // });
    originalGo.apply(this, args);
}
//# sourceMappingURL=history.interceptor.js.map