import { navigationSubject } from "../../ui/subjects.js"

export function historyPushStateInterceptor(this: History, originalPushState, ...args) {
  const [,,url] = args

  navigationSubject.next({
    url
  })

  originalPushState.apply(this, args)
}