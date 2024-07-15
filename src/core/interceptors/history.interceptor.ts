import { navigationSubject } from "../../ui/subjects.js"

export function historyPushStateInterceptor(this: Window['history'], originalPushState: Window['history']['pushState'], ...args: [data: any, unused: string, url?: string | URL | null | undefined]) {
  const [,,url] = args

  navigationSubject.next({
    url
  })

  originalPushState.apply(this, args)
}