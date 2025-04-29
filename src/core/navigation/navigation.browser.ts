export const navigationBrowser = {
  navigate(path: string | URL): void {
    history.pushState({}, '', path);
  },
  back() {
    history.back();
  },
  forward() {
    history.forward();
  },
  go(n?: number) {
    history.go(n);
  },
  reload(path: string | URL = '/') {
    const currentPath = globalThis.location.pathname;

    // const handler = () => {
    //   window.removeEventListener('popstate', handler);
    //   history.pushState({}, '', currentPath);
    //   dispatchEvent(new PopStateEvent('popstate'));
    // };

    // window.addEventListener('popstate', handler);

    history.pushState({}, '', path);

    // dispatchEvent(new PopStateEvent('popstate'));

    setTimeout(() => history.pushState({}, '', currentPath));
  },
  get location() {
    return location.pathname;
  },
};
