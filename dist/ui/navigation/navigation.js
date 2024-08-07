export function navigation(history) {
    return {
        navigate(path) {
            return history.push(path);
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
            const currentPath = history.location.pathname;
            history.push(path);
            setTimeout(() => history.push(currentPath));
        },
    };
}
//# sourceMappingURL=navigation.js.map