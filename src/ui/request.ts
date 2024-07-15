import { requestSubject } from "../shared/index.js"

export async function waitForRequest(path: string, predicate: any) {
  return new Promise((resolve, reject) => {
    let called = false

    const subscription = requestSubject.subscribe({ next: async data => {
      called = true

      if(data.url.pathname === path) {
        if (typeof predicate === 'function') {
          const result = await predicate(data)

          if (result === true) resolve(true)
          else {
            reject(Error(`Request not matched: ${path}`))
          }
        } else resolve(true)
      } else reject(Error(`Request not matched: ${path}`))

      subscription.unsubscribe()
    }})

    setTimeout(() => {
      if (!called) {
        subscription.unsubscribe()

        resolve(Error(`Timeout on request: ${path}`))
      }
    }, 3000)
  })
}