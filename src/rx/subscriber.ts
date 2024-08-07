import { Observer } from './types.js';

export class Subscriber<T> implements Observer<T> {
  #observer: Observer<T>;
  #completed: boolean;
  #errored: boolean;

  constructor(observer: Observer<T>) {
    this.#observer = observer;
    this.#completed = false;
    this.#errored = false;
  }

  next(value: T) {
    try {
      !this.#completed && !this.#errored && this.#observer.next && this.#observer.next(value);
    } catch (error) {
      this.error(error);
    }
  }

  error(error: any) {
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
