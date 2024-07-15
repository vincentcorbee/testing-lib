export class Subscriber {
    #observer;
    #completed;
    #errored;
    constructor(observer) {
        this.#observer = observer;
        this.#completed = false;
        this.#errored = false;
    }
    next(value) {
        try {
            !this.#completed && !this.#errored && this.#observer.next && this.#observer.next(value);
        }
        catch (error) {
            this.error(error);
        }
    }
    error(error) {
        if (!this.#completed && !this.#errored) {
            this.#errored = true;
            this.#observer.error && this.#observer.error(error);
        }
    }
    complete() {
        if (!this.#completed && !this.#errored) {
            this.#completed = true;
            this.#observer.complete && this.#observer.complete();
        }
    }
}
export class Subscription {
    #teardownLogic;
    #subscribed;
    constructor(teardownLogic = function () { }) {
        this.#teardownLogic = teardownLogic;
        this.#subscribed = true;
    }
    unsubscribe() {
        if (this.#subscribed) {
            this.#subscribed = false;
            this.#teardownLogic();
        }
    }
}
export class Subject {
    #subscriptions = new Map();
    next(value) {
        this.#subscriptions.forEach((_, observer) => {
            if (observer.next)
                observer.next(value);
        });
    }
    error(value) {
        this.#subscriptions.forEach((_, observer) => {
            if (observer.error)
                observer.error(value);
        });
    }
    completed(value) {
        this.#subscriptions.forEach((_, observer) => {
            if (observer.completed)
                observer.completed(value);
        });
    }
    subscribe(observer) {
        const subscriber = new Subscriber(observer);
        const subscription = new Subscription(() => this.#subscriptions.delete(subscriber));
        this.#subscriptions.set(subscriber, subscription);
        return subscription;
    }
}
//# sourceMappingURL=subject.js.map