import { RequestEvent } from '../../shared/index.js';
export declare function waitForRequest(path: string, predicate: (data: RequestEvent) => boolean | Promise<boolean>, options?: {
    timeout?: number;
}): Promise<unknown>;
