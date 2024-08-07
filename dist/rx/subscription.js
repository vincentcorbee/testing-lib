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
//# sourceMappingURL=subscription.js.map