export class Subscription<T> {
  #teardownLogic: () => void;
  #subscribed: boolean;

  constructor(teardownLogic = function () {}) {
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
