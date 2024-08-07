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
//# sourceMappingURL=subscriber.js.map