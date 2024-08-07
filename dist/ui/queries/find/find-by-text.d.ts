export declare function findByText<E extends Element>(text: string, options?: string | {
    parent?: string;
    container?: Node;
    index?: number;
    timeout?: number;
}): Promise<E | null>;
