export declare function getBySelector<E extends Element = Element>(selector: string, options?: {
    container?: Document | HTMLElement;
    timeout?: number;
}): Promise<E>;
