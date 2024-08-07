export declare function waitFor<V = undefined>(action: (resolve: (value?: V) => void, reject: (reason?: any) => void) => void | Promise<void>, options?: {
    timeout?: number;
}): Promise<V | undefined>;
