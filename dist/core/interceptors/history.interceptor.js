import { navigationSubject } from "../../ui/subjects.js";
export function historyPushStateInterceptor(originalPushState, ...args) {
    const [, , url] = args;
    navigationSubject.next({
        url
    });
    originalPushState.apply(this, args);
}
//# sourceMappingURL=history.interceptor.js.map