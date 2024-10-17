export declare function waitFor<V = undefined>(action: () => Promise<V> | V, options?: {
    timeout?: number;
}): Promise<V>;
