export declare function waitForWithResolvers<V = undefined>(action: (resolve: (value?: V | PromiseLike<V>) => void, reject: (reason?: any) => void) => void | Promise<void>, options?: {
    timeout?: number;
}): Promise<V | undefined>;
