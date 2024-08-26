export * from './screen/index.js';
export * as event from './event/index.js';
export * as request from './request/index.js';
export * as user from './user/index.js';
export * as queries from './queries/index.js';
export * as page from './page/index.js';
export { waitFor } from '../shared/wait-for.js';
export declare const navigation: {
    readonly navigate: (path: string | URL) => void;
    readonly back: () => void;
    readonly forward: () => void;
    readonly go: (n?: number) => void;
    readonly reload: (path?: string | URL) => void;
    readonly waitForNavigation: typeof import("./navigation/wait-for-navigation.js").waitForNavigation;
};
