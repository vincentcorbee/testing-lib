import { waitForNavigation } from './wait-for-navigation.js';

interface History {
  navigate(path: string | URL): void;
  back(): void;
  forward(): void;
  go(n?: number): void;
  reload(path?: string | URL): void;
  location: {
    pathname: string;
  };
}

export function navigationFactory(history: History) {
  return {
    navigate(path: string | URL) {
      return history.navigate(path);
    },
    back() {
      return history.back();
    },
    forward() {
      return history.forward();
    },
    go(n?: number) {
      return history.go(n);
    },
    reload(path: string | URL = '/') {
      history.reload(path);
    },
    waitForNavigation,
  } as const;
}
