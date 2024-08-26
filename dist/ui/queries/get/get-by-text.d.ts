export declare function getByText<E extends Element>(text: string, options?: string | {
    parent?: string;
    container?: Node;
    index?: number;
    timeout?: number;
    exact?: boolean;
}): Promise<E>;
