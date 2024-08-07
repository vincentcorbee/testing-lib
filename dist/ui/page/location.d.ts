export type Location = {
    href: string;
    hash: string;
    host: string;
    hostname: string;
    origin: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
};
export declare function location(predicate: string, options?: {
    timeout?: number;
}): Promise<void>;
export declare function location(predicate: RegExp, options?: {
    timeout?: number;
}): Promise<void>;
export declare function location(property: keyof Location, predicate: string | RegExp, options?: {
    timeout?: number;
}): Promise<void>;
export declare function location(predicate: (location: Location) => void | Promise<void>, options?: {
    timeout?: number;
}): Promise<void>;
