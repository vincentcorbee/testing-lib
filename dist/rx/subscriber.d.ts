import { Observer } from './types.js';
export declare class Subscriber<T> implements Observer<T> {
    #private;
    constructor(observer: Observer<T>);
    next(value: T): void;
    error(error: any): void;
    complete(): void;
}
