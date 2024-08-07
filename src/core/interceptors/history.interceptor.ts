import { navigationSubject } from '../../ui/subjects.js';

export function historyPushStateInterceptor(
  this: Window['history'],
  originalPushState: Window['history']['pushState'],
  ...args: [data: any, unused: string, url?: string | URL | null]
) {
  const [, , url] = args;

  navigationSubject.next({
    url: typeof url === 'string' ? url : url instanceof URL ? url.pathname : null,
  });

  originalPushState.apply(this, args);
}

export function historyGoInterceptor(
  this: Window['history'],
  originalGo: Window['history']['go'],
  ...args: [delta?: number | undefined]
) {
  // const [, , url] = args;

  // navigationSubject.next({
  //   url: typeof url === 'string' ? url : url instanceof URL ? url.pathname : null,
  // });

  originalGo.apply(this, args);
}
