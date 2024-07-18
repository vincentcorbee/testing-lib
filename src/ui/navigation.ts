import { navigationSubject } from "./subjects.js"

export async function waitForNavigation(path: string | RegExp, timeout = 3000) {
  return new Promise((resolve, reject) => {
    let called = false

    const subscription = navigationSubject.subscribe({ next: async (data: any) => {
      called = true

      const match = typeof path === 'string' ? data.url === path : path.test(data.url)

      if(match) resolve(true)
      else reject(Error(`Url not matched: ${path}`))

      subscription.unsubscribe()
    }})

    setTimeout(() => {
      if (!called) {
        subscription.unsubscribe()

        resolve(Error(`Timeout on navigation: ${path}`))
      }
    }, timeout)
  })
}