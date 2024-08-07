import { waitForNavigation } from './wait-for-navigation.js';
export function navigationFactory(history) {
    return {
        navigate(path) {
            return history.navigate(path);
        },
        back() {
            return history.back();
        },
        forward() {
            return history.forward();
        },
        go(n) {
            return history.go(n);
        },
        reload(path = '/') {
            history.reload(path);
        },
        waitForNavigation,
    };
}
//# sourceMappingURL=navigation-factory.js.map