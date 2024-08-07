export declare function historyPushStateInterceptor(this: Window['history'], originalPushState: Window['history']['pushState'], ...args: [data: any, unused: string, url?: string | URL | null]): void;
export declare function historyGoInterceptor(this: Window['history'], originalGo: Window['history']['go'], ...args: [delta?: number | undefined]): void;
