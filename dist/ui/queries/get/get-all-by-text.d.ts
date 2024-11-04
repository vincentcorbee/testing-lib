export declare function getAllByText<E extends Element = Element>(text: string, options?: string | {
    parent?: string;
    container?: Node;
    timeout?: number;
    exact?: boolean;
}): Promise<E[]>;