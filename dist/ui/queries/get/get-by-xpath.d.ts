export declare function getByXpath<E extends Element>(expression: string, options?: {
    container?: Node;
    index?: number;
    timeout?: number;
    name?: string;
}): Promise<E>;
