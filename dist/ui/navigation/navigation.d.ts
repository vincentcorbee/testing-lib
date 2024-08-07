interface History {
    push(path: string | URL): void;
    back(): void;
    forward(): void;
    go(n?: number): void;
    location: {
        pathname: string;
    };
}
export declare function navigation(history: History): {
    navigate(path: string | URL): void;
    back(): void;
    forward(): void;
    go(n?: number): void;
    reload(path?: string | URL): void;
};
export {};
