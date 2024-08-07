type Role = 'button' | 'heading';
export declare function getByRole<E extends Element>(role: Role, options?: {
    container?: Node;
    index?: number;
    timeout?: number;
    name?: string;
}): Promise<E>;
export {};
