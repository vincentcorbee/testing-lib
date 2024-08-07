import { Subscriber } from './subscriber.js';
import { Subscription } from './subscription.js';
export class Subject {
    #subscriptions = new Map();
    next(value) {
        this.#subscriptions.forEach((_, observer) => {
            if (observer.next)
                observer.next(value);
        });
    }
    error(error) {
        this.#subscriptions.forEach((_, observer) => {
            if (observer.error)
                observer.error(error);
        });
    }
    complete() {
        this.#subscriptions.forEach((_, observer) => {
            if (observer.complete)
                observer.complete();
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