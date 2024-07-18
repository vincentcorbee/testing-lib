export declare function getBySelector(selector: string, options?: {
    container?: Document | HTMLElement;
}): Promise<unknown>;
export declare function getByText(text: string, options?: string | {
    parent?: string;
    container?: Node;
    index?: number;
}): Promise<unknown>;
export declare function getAllByText(text: string, options?: string | {
    parent?: string;
    container?: Node;
}): Promise<unknown>;
