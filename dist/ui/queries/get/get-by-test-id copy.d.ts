export declare function getByTestId<E extends Element>(id: string, options: {
    container?: Document | HTMLElement;
    timeout?: number;
}): Promise<E>;
