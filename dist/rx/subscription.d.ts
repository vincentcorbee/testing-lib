export declare class Subscription<T> {
    #private;
    constructor(teardownLogic?: () => void);
    unsubscribe(): void;
}
