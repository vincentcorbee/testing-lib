import { Subscriber } from './subscriber.js';
import { Subscription } from './subscription.js';
import { Observer } from './types.js';

export class Subject<T> {
  #subscriptions = new Map<Subscriber<T>, Subscription<T>>();

  next(value: T) {
    this.#subscriptions.forEach((_, observer) => {
      if (observer.next) observer.next(value);
    });
  }

  error(error: any) {
    this.#subscriptions.forEach((_, observer) => {
      if (observer.error) observer.error(error);
    });
  }

  complete() {
    this.#subscriptions.forEach((_, observer) => {
      if (observer.complete) observer.complete();
    });
  }

  subscribe(observer: Observer<T>) {
    const subscriber = new Subscriber(observer);
    const subscription = new Subscription(() => this.#subscriptions.delete(subscriber));

    this.#subscriptions.set(subscriber, subscription);

    return subscription;
  }
}
