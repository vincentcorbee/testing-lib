import { waitForNavigation } from './wait-for-navigation.js';
interface History {
    navigate(path: string | URL): void;
    back(): void;
    forward(): void;
    go(n?: number): void;
    reload(path?: string | URL): void;
    location: {
        pathname: string;
    };
}
export declare function navigationFactory(history: History): {
    readonly navigate: (path: string | URL) => void;
    readonly back: () => void;
    readonly forward: () => void;
    readonly go: (n?: number) => void;
    readonly reload: (path?: string | URL) => void;
    readonly waitForNavigation: typeof waitForNavigation;
};
export {};
