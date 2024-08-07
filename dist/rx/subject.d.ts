import { Subscription } from './subscription.js';
import { Observer } from './types.js';
export declare class Subject<T> {
    #private;
    next(value: T): void;
    error(error: any): void;
    complete(): void;
    subscribe(observer: Observer<T>): Subscription<unknown>;
}
