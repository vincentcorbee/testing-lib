export declare class Subscriber {
    #private;
    constructor(observer: any);
    next(value: any): void;
    error(error: any): void;
    complete(): void;
}
export declare class Subscription {
    #private;
    constructor(teardownLogic?: () => void);
    unsubscribe(): void;
}
export declare class Subject {
    #private;
    next(value: any): void;
    error(value: any): void;
    completed(value: any): void;
    subscribe(observer: any): Subscription;
}
